from datetime import date, timedelta
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel

from models.inventory import Inventory
from models.product import Product
from models.sales import Sale
from agents.base_agent import BaseAgent
from agents.supplier_agent import SupplierAgent
from ai.tools.inventory_tools import GetInventoryTool, GetInventoryRiskTool
from ai.llm.provider import get_llm_provider
from ai.llm.prompts import INVENTORY_REPLENISHMENT_PROMPT, SYSTEM_PROMPT_SUPPLY_CHAIN_BASE

class InventoryAgentInput(BaseModel):
    product_id: Optional[int] = None
    target_buffer_days: int = 30
    min_safety_stock: int = 10

class InventoryAgent(BaseAgent):
    name = "inventory_agent"
    description = "Calculates stock levels, burn rate, days of coverage, reorder points, and replenishment quantities deterministically."
    input_schema = InventoryAgentInput

    def __init__(self):
        super().__init__()
        self.tools = [GetInventoryTool(), GetInventoryRiskTool()]

    def run(self, db: Session, user: Optional[Any] = None, **kwargs) -> Dict[str, Any]:
        target_prod_id = kwargs.get("product_id")
        target_buffer_days = kwargs.get("target_buffer_days", 30)
        min_safety = kwargs.get("min_safety_stock", 10)

        query = db.query(Inventory, Product).join(Product, Inventory.product_id == Product.id)
        if target_prod_id:
            query = query.filter(Inventory.product_id == target_prod_id)

        inventory_records = query.all()

        alerts = []
        total_stock_units = 0
        total_inventory_value = 0.0
        critical_count = 0
        warning_count = 0
        overstock_count = 0
        fourteen_days_ago = date.today() - timedelta(days=14)

        supplier_agent = SupplierAgent()
        llm = get_llm_provider()

        for inv, prod in inventory_records:
            available_stock = max(0, inv.current_stock - inv.reserved_stock)
            total_stock_units += inv.current_stock
            unit_price = prod.price or 0.0
            total_inventory_value += unit_price * inv.current_stock

            # Sales velocity calculation
            sales_14d = db.query(func.sum(Sale.quantity_sold)).filter(
                Sale.product_id == prod.id,
                Sale.sale_date >= fourteen_days_ago
            ).scalar() or 0

            daily_demand = max(0.5, round(sales_14d / 14.0, 2))
            days_remaining = round(available_stock / daily_demand, 1)

            lead_time = prod.lead_time_days or 5
            safety_stock = max(min_safety, prod.safety_stock or inv.safety_stock or 10)
            reorder_point = prod.reorder_point or inv.reorder_level or int((daily_demand * lead_time) + safety_stock)

            # Risk classification
            if available_stock == 0:
                status = "Out of Stock"
                severity = "CRITICAL"
                critical_count += 1
            elif days_remaining <= lead_time or available_stock <= (safety_stock // 2):
                status = "Critical"
                severity = "CRITICAL"
                critical_count += 1
            elif available_stock <= reorder_point or days_remaining <= (lead_time * 1.5):
                status = "Low"
                severity = "WARNING"
                warning_count += 1
            elif days_remaining > 90:
                status = "Overstock"
                severity = "INFO"
                overstock_count += 1
            else:
                status = "Healthy"
                severity = "OPTIMAL"

            # Recommended replenishment quantity: (Safety Stock + Daily Demand * Target Days) - Available
            needed_units = int((daily_demand * target_buffer_days) + safety_stock)
            suggested_reorder = max(15, needed_units - available_stock)

            # Supplier matching
            sup_res = supplier_agent.run(db, product_id=prod.id, quantity=suggested_reorder)
            best_supplier = sup_res.get("recommended_supplier") or {}
            best_supplier_name = best_supplier.get("supplier_name", "Primary Vendor")

            expected_stockout_date = (date.today() + timedelta(days=int(days_remaining))).isoformat() if days_remaining < 90 else None

            # Generate concise explanation for flagged items
            explanation = (
                f"Current stock of {available_stock} available units will deplete in ~{days_remaining} days at a burn rate of {daily_demand} units/day. "
                f"Lead time is {lead_time} days. Order {suggested_reorder} units from {best_supplier_name} to maintain a {target_buffer_days}-day buffer."
            )

            # If single product query and flagged, optionally enrich with LLM explanation
            if target_prod_id and severity in ("CRITICAL", "WARNING"):
                prompt = INVENTORY_REPLENISHMENT_PROMPT.format(
                    product_name=prod.name,
                    sku=prod.sku,
                    current_stock=inv.current_stock,
                    reserved_stock=inv.reserved_stock,
                    available_stock=available_stock,
                    daily_demand=daily_demand,
                    days_remaining=days_remaining,
                    lead_time=lead_time,
                    safety_stock=safety_stock,
                    reorder_point=reorder_point,
                    suggested_reorder=suggested_reorder,
                    supplier_name=best_supplier_name,
                    severity=severity
                )
                llm_exp = llm.generate(prompt=prompt, system=SYSTEM_PROMPT_SUPPLY_CHAIN_BASE)
                if llm_exp and "[AI Note:" not in llm_exp:
                    explanation = llm_exp

            alerts.append({
                "product_id": prod.id,
                "product_name": prod.name,
                "sku": prod.sku,
                "category": prod.category,
                "current_stock": inv.current_stock,
                "available_stock": available_stock,
                "reserved_stock": inv.reserved_stock,
                "daily_demand": daily_demand,
                "days_remaining": days_remaining,
                "lead_time_days": lead_time,
                "safety_stock": safety_stock,
                "reorder_level": reorder_point,
                "suggested_reorder_units": suggested_reorder,
                "recommended_supplier": best_supplier_name,
                "supplier_id": best_supplier.get("supplier_id"),
                "estimated_reorder_cost": best_supplier.get("total_cost", 0.0),
                "expected_stockout_date": expected_stockout_date,
                "severity": severity,
                "status": status,
                "reason": f"Stock depletion in ~{days_remaining} days based on {daily_demand} units/day burn rate.",
                "explanation": explanation,
                "action_recommendation": f"Procure {suggested_reorder} units from {best_supplier_name} to avoid stockout."
            })

        alerts.sort(key=lambda a: (0 if a["severity"] == "CRITICAL" else (1 if a["severity"] == "WARNING" else 2), a["days_remaining"]))

        return {
            "total_stock_units": total_stock_units,
            "total_inventory_value": round(total_inventory_value, 2),
            "total_items_tracked": len(inventory_records),
            "low_stock_alerts_count": len([a for a in alerts if a["severity"] in ("CRITICAL", "WARNING")]),
            "critical_out_of_stock_count": critical_count,
            "warning_count": warning_count,
            "overstock_count": overstock_count,
            "alerts": alerts,
            "restock_items": [a for a in alerts if a["severity"] in ("CRITICAL", "WARNING")]
        }

# Backwards compatible alias
def calculate_inventory_intelligence(db: Session) -> Dict[str, Any]:
    agent = InventoryAgent()
    return agent.run(db)
