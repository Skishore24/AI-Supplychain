from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from models.inventory import Inventory
from models.product import Product
from models.sales import Sale
from datetime import date, timedelta
from sqlalchemy import func
from ai.tools.base_tool import AITool

class GetInventoryTool(AITool):
    name = "get_inventory"
    description = "Retrieve current inventory levels, reserved stock, and warehouse locations for a product."
    is_write = False
    requires_auth = False

    def execute(self, db: Session, user: Optional[Any] = None, product_id: int = 0, **kwargs) -> Dict[str, Any]:
        inv = db.query(Inventory).filter(Inventory.product_id == product_id).first()
        if not inv:
            return {"found": False, "message": f"Inventory record for product ID {product_id} not found."}
        
        prod = db.query(Product).filter(Product.id == product_id).first()
        available = max(0, inv.current_stock - inv.reserved_stock)
        return {
            "found": True,
            "inventory": {
                "product_id": inv.product_id,
                "product_name": prod.name if prod else "Unknown",
                "sku": prod.sku if prod else "N/A",
                "warehouse_id": inv.warehouse_id,
                "current_stock": inv.current_stock,
                "reserved_stock": inv.reserved_stock,
                "available_stock": available,
                "reorder_level": inv.reorder_level or (prod.reorder_point if prod else 15),
                "safety_stock": inv.safety_stock or (prod.safety_stock if prod else 10),
                "status": inv.status
            }
        }

class GetInventoryRiskTool(AITool):
    name = "get_inventory_risk"
    description = "Compute stockout risk, velocity, and days of coverage across the inventory catalog."
    is_write = False
    requires_auth = False

    def execute(self, db: Session, user: Optional[Any] = None, **kwargs) -> Dict[str, Any]:
        records = db.query(Inventory, Product).join(Product, Inventory.product_id == Product.id).all()
        fourteen_days_ago = date.today() - timedelta(days=14)

        risk_list = []
        for inv, prod in records:
            available = max(0, inv.current_stock - inv.reserved_stock)
            sales_14d = db.query(func.sum(Sale.quantity_sold)).filter(
                Sale.product_id == prod.id,
                Sale.sale_date >= fourteen_days_ago
            ).scalar() or 0
            daily_demand = max(0.5, round(sales_14d / 14.0, 2))
            days_remaining = round(available / daily_demand, 1)

            lead_time = prod.lead_time_days or 5
            safety_stock = prod.safety_stock or inv.safety_stock or 10
            reorder_point = prod.reorder_point or inv.reorder_level or 15

            if available == 0 or days_remaining <= lead_time:
                severity = "CRITICAL"
            elif available <= reorder_point or days_remaining <= (lead_time * 1.5):
                severity = "WARNING"
            else:
                severity = "HEALTHY"

            risk_list.append({
                "product_id": prod.id,
                "sku": prod.sku,
                "product_name": prod.name,
                "current_stock": inv.current_stock,
                "available_stock": available,
                "daily_demand": daily_demand,
                "days_remaining": days_remaining,
                "lead_time": lead_time,
                "severity": severity,
                "suggested_reorder": max(15, int((daily_demand * 30) + safety_stock) - available)
            })

        return {
            "total_items": len(records),
            "items": risk_list
        }
