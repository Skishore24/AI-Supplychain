import re
import uuid
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.models.ai import AIConversation, AIMessage, AIRecommendation
from app.models.product import Product
from app.agents.base import AgentContext, AgentResult
from app.agents.registry import agent_registry
from app.agents.executor import agent_executor

logger = logging.getLogger("ai.orchestration")

class SupplyChainOrchestrator:
    """
    Central AI Supply Chain Orchestrator:
    1. Receives natural-language inquiries from authenticated users.
    2. Maintains conversation history and tenant-scoped session context.
    3. Classifies task intent and maps to specialized agents.
    4. Extracts domain entities (SKU, Product, Supplier ID, Timeframes).
    5. Dispatches execution through the AgentExecutor.
    6. Formats structured result with evidence, confidence, recommendations, and tool traces.
    """

    def classify_intent(self, message: str) -> str:
        text = message.lower()

        # Forecasting
        if any(w in text for w in ["forecast", "predict", "velocity", "demand", "sales projection"]):
            return "demand_forecast"

        # Inventory
        if any(w in text for w in ["stock", "inventory", "stockout", "depletion", "coverage", "reorder point", "rop"]):
            return "inventory"

        # Procurement / Purchase Order
        if any(w in text for w in ["purchase order", "create po", "draft po", "procure", "replenish", "order from supplier"]):
            return "procurement"

        # Suppliers
        if any(w in text for w in ["supplier", "vendor", "quote", "lead time", "lead-time", "cheapest supplier"]):
            return "supplier"

        # Risks
        if any(w in text for w in ["risk", "danger", "bottleneck", "disruption", "anomaly", "vulnerability"]):
            return "risk"

        # Analytics
        if any(w in text for w in ["revenue", "sales", "kpi", "performance", "metrics", "analytics", "dashboard", "overview"]):
            return "analytics"

        # Document / Policy RAG
        if any(w in text for w in ["policy", "document", "contract", "manual", "sop", "guideline", "rule", "terms"]):
            return "document"

        return "inventory"

    def extract_sku_or_id(self, db: Session, organization_id: int, message: str) -> Optional[int]:
        # Match SKU patterns like SKU-101, SKU101, etc.
        match = re.search(r"\b(sku[-\s]?[0-9a-z_-]+)\b", message, re.IGNORECASE)
        if match:
            candidate_sku = match.group(1).replace(" ", "-")
            prod = db.query(Product).filter(
                Product.sku.ilike(candidate_sku),
                Product.organization_id == organization_id
            ).first()
            if prod:
                return prod.id

        # Match product names present in DB
        words = message.split()
        for i in range(len(words)):
            candidate_name = " ".join(words[i:i+3])
            prod = db.query(Product).filter(
                Product.name.ilike(f"%{candidate_name}%"),
                Product.organization_id == organization_id
            ).first()
            if prod:
                return prod.id

        return None

    def process_chat(
        self,
        db: Session,
        message: str,
        conversation_id: Optional[str] = None,
        user: Optional[Any] = None,
        organization_id: int = 1
    ) -> Dict[str, Any]:
        user_msg = message.strip()
        user_email = getattr(user, "email", "user@emox.ai")
        user_role = getattr(user, "role", "USER")
        user_id = getattr(user, "id", None)
        org_id = getattr(user, "organization_id", None) or organization_id

        # 1. Conversation Management
        if not conversation_id:
            conv_id = f"conv-{uuid.uuid4().hex[:12]}"
            conv = AIConversation(
                id=conv_id,
                user_id=user_id,
                organization_id=org_id,
                title=user_msg[:40] + ("..." if len(user_msg) > 40 else ""),
                created_at=datetime.now(timezone.utc)
            )
            db.add(conv)
            db.commit()
        else:
            conv_id = conversation_id
            conv = db.query(AIConversation).filter(
                AIConversation.id == conv_id,
                AIConversation.organization_id == org_id
            ).first()
            if not conv:
                conv = AIConversation(
                    id=conv_id,
                    user_id=user_id,
                    organization_id=org_id,
                    title=user_msg[:40],
                    created_at=datetime.now(timezone.utc)
                )
                db.add(conv)
                db.commit()

        # Record User Message
        user_record = AIMessage(
            conversation_id=conv_id,
            role="user",
            content=user_msg,
            created_at=datetime.now(timezone.utc)
        )
        db.add(user_record)
        db.commit()

        # 2. Contextual Routing
        intent = self.classify_intent(user_msg)
        target_prod_id = self.extract_sku_or_id(db, org_id, user_msg)

        context = AgentContext(
            organization_id=org_id,
            user_id=user_id,
            user_email=user_email,
            user_role=user_role
        )

        agent = agent_registry.get(intent)
        if not agent:
            agent = agent_registry.get("inventory")

        # 3. Agent Execution with Real Tools
        agent_args: Dict[str, Any] = {}
        if intent == "document":
            agent_args["question"] = user_msg
        elif intent == "demand_forecast":
            if target_prod_id:
                agent_args["product_id"] = target_prod_id
        elif intent in ["inventory", "supplier", "procurement"]:
            if target_prod_id:
                agent_args["product_id"] = target_prod_id

        agent_result: AgentResult = agent_executor.execute(agent, db, context, **agent_args)

        # 4. Save Assistant Response
        assistant_record = AIMessage(
            conversation_id=conv_id,
            role="assistant",
            content=agent_result.summary,
            metadata_json={
                "agent_name": agent_result.agent_name,
                "confidence": agent_result.confidence,
                "sources": agent_result.citations,
                "recommendations": agent_result.recommendations,
                "metrics": agent_result.metrics,
                "trace": agent_result.trace
            },
            created_at=datetime.now(timezone.utc)
        )
        db.add(assistant_record)
        db.commit()

        return {
            "conversation_id": conv_id,
            "agent_used": agent_result.agent_name,
            "intent": intent,
            "message": agent_result.summary,
            "data": agent_result.data,
            "recommendations": agent_result.recommendations,
            "sources": agent_result.citations,
            "confidence": agent_result.confidence,
            "tool_calls": agent_result.tool_calls,
            "trace": agent_result.trace
        }

supply_chain_orchestrator = SupplyChainOrchestrator()
