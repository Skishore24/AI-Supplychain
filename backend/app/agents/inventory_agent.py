from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.agents.specialized.inventory_agent import InventoryAgent
from app.services.inventory_service import inventory_service
from app.services.supplier_service import supplier_service
from app.models.inventory import Inventory
from app.models.product import Product

def calculate_inventory_intelligence(db: Session, organization_id: int = 1) -> Dict[str, Any]:
    """
    Calculates inventory intelligence, days of coverage, reorder points, and alerts.
    """
    try:
        status_data = inventory_service.get_inventory_status(db, organization_id=organization_id)
        items = status_data.get("items", [])

        alerts = []
        for itm in items:
            status = itm.get("status", "Healthy")
            severity = "CRITICAL" if status in ("Critical", "Out of Stock") else ("WARNING" if status == "Low" else "INFO")
            
            alerts.append({
                "id": itm["inventory_id"],
                "product_id": itm["product_id"],
                "product_name": itm["product_name"],
                "sku": itm["sku"],
                "current_stock": itm["current_stock"],
                "reorder_level": itm["reorder_point"],
                "safety_stock": itm["safety_stock"],
                "available_stock": itm["available_stock"],
                "days_remaining": itm["days_of_coverage"],
                "suggested_reorder_units": itm["recommended_reorder_qty"],
                "supplier_name": "Primary Vendor",
                "estimated_reorder_cost": round(itm["recommended_reorder_qty"] * itm["cost_price"], 2),
                "severity": severity,
                "status": status,
                "reason": f"Stock coverage estimated at {itm['days_of_coverage']} days.",
                "explanation": f"Calculated ROP: {itm['reorder_point']} units with {itm['safety_stock']} safety buffer.",
                "action_recommendation": f"Procure {itm['recommended_reorder_qty']} units to restore optimal buffer."
            })

        alerts.sort(key=lambda a: (0 if a["severity"] == "CRITICAL" else (1 if a["severity"] == "WARNING" else 2), a["days_remaining"]))

        critical_count = sum(1 for a in alerts if a["severity"] == "CRITICAL")
        warning_count = sum(1 for a in alerts if a["severity"] == "WARNING")

        return {
            "total_stock_units": status_data.get("total_units", 0),
            "total_inventory_value": status_data.get("total_valuation", 0.0),
            "total_items_tracked": len(items),
            "low_stock_alerts_count": critical_count + warning_count,
            "critical_out_of_stock_count": critical_count,
            "warning_count": warning_count,
            "overstock_count": sum(1 for a in alerts if a["status"] == "Overstock"),
            "alerts": alerts,
            "restock_items": [a for a in alerts if a["severity"] in ("CRITICAL", "WARNING")]
        }
    except Exception as e:
        return {
            "total_stock_units": 0,
            "total_inventory_value": 0.0,
            "total_items_tracked": 0,
            "low_stock_alerts_count": 0,
            "critical_out_of_stock_count": 0,
            "warning_count": 0,
            "overstock_count": 0,
            "alerts": [],
            "restock_items": []
        }

__all__ = ["InventoryAgent", "calculate_inventory_intelligence"]
