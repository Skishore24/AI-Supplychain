import re
import uuid
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from models.ai import AIConversation, AIMessage, AIAuditLog, AIRecommendation
from models.user import User
from agents.supplier_agent import SupplierAgent
from agents.inventory_agent import InventoryAgent
from agents.demand_agent import DemandAgent
from agents.risk_agent import RiskAgent
from agents.procurement_agent import ProcurementAgent
from rag.pipeline import RAGPipeline
from ai.llm.provider import get_llm_provider

logger = logging.getLogger("ai.orchestrator")

class AIOrchestrator:
    """
    Central AI Orchestrator for the Enterprise Supply Chain Platform:
    1. Parses user intent (supplier selection, inventory risk, demand forecast, procurement, or policy knowledge).
    2. Routes to specialized agents, database tools, ML models, or RAG pipeline.
    3. Prevents unnecessary database or LLM queries.
    4. Records persistent conversation history and audit logs.
    5. Returns structured telemetry, citations, tool results, and recommendations.
    """

    def __init__(self):
        self.supplier_agent = SupplierAgent()
        self.inventory_agent = InventoryAgent()
        self.demand_agent = DemandAgent()
        self.risk_agent = RiskAgent()
        self.procurement_agent = ProcurementAgent()
        self.rag_pipeline = RAGPipeline()
        self.llm = get_llm_provider()

    def process_chat(
        self,
        db: Session,
        message: str,
        conversation_id: Optional[str] = None,
        user: Optional[Any] = None
    ) -> Dict[str, Any]:
        user_msg = message.strip()
        user_email = getattr(user, "email", "admin@emox.ai")

        # 1. Manage Conversation state
        if not conversation_id:
            conv_id = f"conv-{uuid.uuid4().hex[:12]}"
            conv = AIConversation(
                id=conv_id,
                user_id=getattr(user, "id", None),
                title=user_msg[:40] + ("..." if len(user_msg) > 40 else ""),
                created_at=datetime.now(timezone.utc)
            )
            db.add(conv)
            db.commit()
        else:
            conv_id = conversation_id
            conv = db.query(AIConversation).filter(AIConversation.id == conv_id).first()
            if not conv:
                conv = AIConversation(
                    id=conv_id,
                    user_id=getattr(user, "id", None),
                    title=user_msg[:40],
                    created_at=datetime.now(timezone.utc)
                )
                db.add(conv)
                db.commit()

        # Save user message
        user_record = AIMessage(
            conversation_id=conv_id,
            role="user",
            content=user_msg,
            created_at=datetime.now(timezone.utc)
        )
        db.add(user_record)
        db.commit()

        # 2. Intent Classification
        intent = self._classify_intent(user_msg)
        target_sku = self._extract_sku_or_id(user_msg)

        agent_used = intent
        answer = ""
        sources = []
        tool_results = []
        recommendations = []
        confidence = 0.88

        # 3. Route to Subsystem
        if intent == "policy_knowledge":
            # Knowledge RAG Question: Do NOT query inventory unnecessarily
            rag_res = self.rag_pipeline.answer_question(db, question=user_msg)
            answer = rag_res.get("answer", "")
            sources = rag_res.get("sources", [])
            confidence = rag_res.get("confidence", 0.85)
            tool_results.append({"tool": "rag_hybrid_search", "sources_count": len(sources)})

        elif intent == "supplier_selection":
            # Supplier Optimizer Agent
            sup_res = self.supplier_agent.run(db, sku=target_sku, product_name=user_msg)
            best_sup = sup_res.get("recommended_supplier") or {}
            answer = sup_res.get("reasoning", "")
            confidence = sup_res.get("confidence", 0.90)
            tool_results.append({
                "tool": "supplier_agent",
                "recommended_supplier": best_sup.get("supplier_name"),
                "score": sup_res.get("score"),
                "price": best_sup.get("unit_price")
            })

            # Check if any contract documents exist in RAG for this supplier
            if best_sup.get("supplier_name"):
                doc_matches = self.rag_pipeline.retriever.retrieve(db, query=best_sup["supplier_name"], top_k=2)
                if doc_matches:
                    sources = [
                        {
                            "document_name": d["document_name"],
                            "document_id": d["document_id"],
                            "page": d["page"],
                            "section": d.get("section"),
                            "snippet": d["content"][:180] + "..."
                        }
                        for d in doc_matches
                    ]

        elif intent == "inventory_risk":
            # Inventory & Stockout Risk Agent
            inv_res = self.inventory_agent.run(db, product_id=int(target_sku) if (target_sku and target_sku.isdigit()) else None)
            alerts = inv_res.get("restock_items", []) or inv_res.get("alerts", [])
            confidence = 0.92

            if target_sku:
                matched = next((a for a in inv_res.get("alerts", []) if target_sku.lower() in a["sku"].lower() or target_sku in str(a["product_id"])), None)
                if matched:
                    answer = (
                        f"{matched['product_name']} ({matched['sku']}) is currently at {matched['severity']} risk! "
                        f"{matched['explanation']}"
                    )
                    tool_results.append({"tool": "inventory_agent", "product": matched["product_name"], "status": matched["severity"]})
                else:
                    answer = f"Inventory check complete. Product matching '{target_sku}' has adequate stock coverage."
            else:
                crit_count = inv_res.get("critical_out_of_stock_count", 0)
                warn_count = inv_res.get("warning_count", 0)
                top_alert_names = [f"{a['sku']} ({a['product_name']})" for a in alerts[:3]]
                answer = (
                    f"Inventory Risk Audit: {crit_count} critical stockouts and {warn_count} replenishment warnings identified. "
                    f"Highest risk items: {', '.join(top_alert_names) if top_alert_names else 'None'}."
                )
                tool_results.append({"tool": "inventory_agent", "critical": crit_count, "warning": warn_count})

        elif intent == "demand_forecasting":
            # ML Demand Forecasting Agent
            dem_res = self.demand_agent.run(db)
            confidence = 0.89
            items = dem_res.get("items", [])
            answer = (
                f"ML Demand Velocity Forecast: Analyzed {len(items)} active products using chronological feature validation. "
                f"Top fast-moving product is {items[0]['product_name']} at {items[0]['daily_velocity']} units/day "
                f"(30-day forecast: {items[0]['projected_30d']} units)."
            ) if items else "No sales history available to forecast."
            tool_results.append({"tool": "ml_demand_forecaster", "products_count": len(items)})

        elif intent == "procurement_recommendation":
            # End-to-end Procurement Flow: Inventory + Demand + Supplier + Policy
            proc_res = self.procurement_agent.run(db)
            recs = proc_res.get("recommendations", [])
            recommendations = recs
            confidence = 0.91

            if recs:
                rec0 = recs[0]
                answer = (
                    f"AI Procurement Recommendation Generated for Admin Review:\n\n"
                    f"• Recommended Order: {rec0['recommended_quantity']} units of {rec0['product_name']} ({rec0['sku']})\n"
                    f"• Supplier: {rec0['supplier_name']} at ₹{rec0['unit_price']:.2f}/unit (PO Total: ₹{rec0['total_cost']:,.2f})\n"
                    f"• Justification: {rec0['reasoning']}\n\n"
                    f"Action: Please review and approve in the AI Recommendations Hub."
                )
            else:
                answer = "All inventory positions are within target buffer thresholds. No purchase orders required today."

            tool_results.append({"tool": "procurement_agent", "recommendations_generated": len(recs)})

        else:
            # General Supply Chain Assistant
            answer = (
                "I am your local AI Supply Chain Assistant. I can assist you with:\n"
                "• Supplier selection and quote optimization ('Which supplier should I use for SKU-1004?')\n"
                "• Stockout risk and replenishment analysis ('Why is SKU-1004 at risk?')\n"
                "• ML demand velocity forecasting ('Show 30-day demand forecast')\n"
                "• Procurement recommendations ('How many units should we order?')\n"
                "• Company policy & vendor contract search ('What is our emergency procurement policy?')"
            )
            confidence = 1.0

        # 4. Save Assistant Message in Database
        meta_dict = {
            "agent": agent_used,
            "sources": sources,
            "tool_results": tool_results,
            "recommendations": [r.get("id") for r in recommendations if isinstance(r, dict)],
            "confidence": confidence
        }
        assistant_record = AIMessage(
            conversation_id=conv_id,
            role="assistant",
            content=answer,
            metadata_json=meta_dict,
            created_at=datetime.now(timezone.utc)
        )
        db.add(assistant_record)

        # 5. Audit Logging
        audit = AIAuditLog(
            user_email=user_email,
            agent=agent_used,
            tool=tool_results[0].get("tool") if tool_results else "direct_chat",
            action="AI_CHAT_QUERY",
            entity=user_msg[:60],
            result={"confidence": confidence, "sources_count": len(sources)},
            model=self.llm.__class__.__name__,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(audit)
        db.commit()

        return {
            "conversation_id": conv_id,
            "answer": answer,
            "agent": agent_used,
            "sources": sources,
            "tool_results": tool_results,
            "recommendations": recommendations,
            "confidence": confidence
        }

    def _classify_intent(self, text: str) -> str:
        lower = text.lower()
        if any(w in lower for w in ["policy", "contract", "procedure", "sop", "guideline", "rule", "manual", "emergency purchasing"]):
            return "policy_knowledge"
        elif any(w in lower for w in ["supplier", "vendor", "quote", "which supplier", "cheapest", "best supplier"]):
            return "supplier_selection"
        elif any(w in lower for w in ["risk", "stockout", "deplete", "coverage", "run out", "why is", "inventory risk"]):
            return "inventory_risk"
        elif any(w in lower for w in ["forecast", "prediction", "growth", "next month", "trend", "velocity", "demand"]):
            return "demand_forecasting"
        elif any(w in lower for w in ["order", "procure", "purchase", "replenish", "how many units", "restock"]):
            return "procurement_recommendation"
        return "general"

    def _extract_sku_or_id(self, text: str) -> Optional[str]:
        # Match SKU-XXXX or numeric ID
        match = re.search(r"\b(SKU-[A-Z0-9\-]+|\d+)\b", text, re.IGNORECASE)
        if match:
            return match.group(1).upper()
        return None

_default_orchestrator: Optional[AIOrchestrator] = None

def get_ai_orchestrator() -> AIOrchestrator:
    global _default_orchestrator
    if _default_orchestrator is None:
        _default_orchestrator = AIOrchestrator()
    return _default_orchestrator
