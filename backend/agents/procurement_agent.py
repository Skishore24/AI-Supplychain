from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from pydantic import BaseModel

from models.product import Product
from models.ai import AIRecommendation, AIAuditLog
from agents.base_agent import BaseAgent
from agents.inventory_agent import InventoryAgent
from agents.supplier_agent import SupplierAgent
from ml.forecasting.predict import generate_demand_prediction
from ai.llm.provider import get_llm_provider
from ai.llm.prompts import PROCUREMENT_RECOMMENDATION_PROMPT, SYSTEM_PROMPT_SUPPLY_CHAIN_BASE

class ProcurementAgentInput(BaseModel):
    product_id: Optional[int] = None
    target_buffer_days: int = 30

class ProcurementAgent(BaseAgent):
    name = "procurement_agent"
    description = "Synthesizes inventory risk, ML demand projections, and supplier rankings to generate actionable procurement recommendations requiring human approval."
    input_schema = ProcurementAgentInput

    def run(self, db: Session, user: Optional[Any] = None, **kwargs) -> Dict[str, Any]:
        target_prod_id = kwargs.get("product_id")
        target_buffer = kwargs.get("target_buffer_days", 30)

        # 1. Run Inventory Agent to find replenishment needs
        inv_agent = InventoryAgent()
        inv_data = inv_agent.run(db, product_id=target_prod_id, target_buffer_days=target_buffer)
        flagged_items = inv_data.get("restock_items", [])

        if not flagged_items:
            # Check all items if target_prod_id was given
            flagged_items = inv_data.get("alerts", [])

        if not flagged_items:
            return {
                "recommendations_count": 0,
                "recommendations": [],
                "message": "All product inventory levels are healthy. No procurement orders needed at this time."
            }

        supplier_agent = SupplierAgent()
        llm = get_llm_provider()
        created_recommendations = []

        for item in flagged_items[:5]:  # Top priority replenishment candidates
            prod_id = item["product_id"]
            reorder_qty = item["suggested_reorder_units"]

            # 2. Query ML Demand Forecast
            pred = generate_demand_prediction(db, prod_id, horizons=[30])
            h30 = next((h for h in pred["horizons"] if h["horizon_days"] == 30), {})
            p30_units = h30.get("predicted_quantity", reorder_qty)

            # 3. Query Supplier Agent for optimal vendor
            sup_res = supplier_agent.run(db, product_id=prod_id, quantity=reorder_qty)
            best_sup = sup_res.get("recommended_supplier") or {}
            sup_name = best_sup.get("supplier_name", "Primary Certified Supplier")
            unit_price = best_sup.get("unit_price", 100.0)
            total_cost = best_sup.get("total_cost", round(unit_price * reorder_qty, 2))

            # 4. Formulate grounded recommendation
            reasoning_summary = (
                f"Available stock ({item['available_stock']} units) will deplete in ~{item['days_remaining']} days. "
                f"30-day ML forecast demand is {p30_units} units. Optimal supplier is {sup_name} "
                f"at ₹{unit_price:.2f}/unit with a {best_sup.get('delivery_days', 5)}-day turnaround."
            )

            rec_text = (
                f"Procure {reorder_qty} units of {item['product_name']} ({item['sku']}) from {sup_name}. "
                f"Projected PO Total: ₹{total_cost:,.2f}."
            )

            # 5. Persist AIRecommendation record with status GENERATED (requires Human Approval)
            rec_record = AIRecommendation(
                agent_name="Procurement Agent",
                agent_type="procurement",
                entity_type="product",
                entity_id=prod_id,
                product_id=prod_id,
                recommendation=rec_text,
                confidence=round(min(0.95, max(0.70, sup_res.get("confidence", 0.85))), 2),
                risk_score=round(85.0 if item["severity"] == "CRITICAL" else 55.0, 1),
                score=best_sup.get("final_score", 85.0),
                reasoning=reasoning_summary,
                reasoning_summary=reasoning_summary,
                supporting_data={
                    "product_id": prod_id,
                    "product_name": item["product_name"],
                    "sku": item["sku"],
                    "order_quantity": reorder_qty,
                    "supplier_id": best_sup.get("supplier_id"),
                    "supplier_name": sup_name,
                    "unit_price": unit_price,
                    "total_cost": total_cost,
                    "days_remaining": item["days_remaining"],
                    "current_stock": item["current_stock"],
                    "forecast_30d": p30_units,
                    "lead_time_days": item["lead_time_days"],
                    "severity": item["severity"]
                },
                suggested_action=f"Approve Purchase Order for {reorder_qty} units via {sup_name}",
                status="GENERATED",
                created_at=datetime.now(timezone.utc)
            )
            db.add(rec_record)
            db.commit()
            db.refresh(rec_record)

            created_recommendations.append({
                "id": rec_record.id,
                "product_id": prod_id,
                "product_name": item["product_name"],
                "sku": item["sku"],
                "recommended_quantity": reorder_qty,
                "supplier_id": best_sup.get("supplier_id"),
                "supplier_name": sup_name,
                "unit_price": unit_price,
                "total_cost": total_cost,
                "severity": item["severity"],
                "status": rec_record.status,
                "confidence": rec_record.confidence,
                "risk_score": rec_record.risk_score,
                "reasoning": reasoning_summary,
                "suggested_action": rec_record.suggested_action
            })

        return {
            "recommendations_count": len(created_recommendations),
            "recommendations": created_recommendations,
            "human_approval_required": True
        }
