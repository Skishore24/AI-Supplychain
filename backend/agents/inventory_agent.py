from datetime import date, timedelta
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from models.inventory import Inventory
from models.product import Product
from models.sales import Sale
from agents.supplier_agent import evaluate_suppliers_for_product

def calculate_inventory_intelligence(db: Session) -> Dict[str, Any]:
    """
    Agent 2: Inventory Optimization & Stockout Risk Agent
    Analyzes:
    - Current on-hand stock vs reserved stock
    - 14-day sales velocity & average daily run-rate
    - Estimated days of coverage remaining
    - Recommended reorder quantity: (Safety Stock + Daily Demand * Lead Time) - Current Stock
    """
    inventory_records = db.query(Inventory, Product).join(
        Product, Inventory.product_id == Product.id
    ).all()

    alerts = []
    total_stock_units = 0
    total_inventory_value = 0.0
    critical_count = 0
    warning_count = 0
    overstock_count = 0

    fourteen_days_ago = date.today() - timedelta(days=14)

    for inv, prod in inventory_records:
        available_stock = max(0, inv.current_stock - inv.reserved_stock)
        total_stock_units += inv.current_stock
        unit_price = prod.price or 0.0
        total_inventory_value += unit_price * inv.current_stock

        # Calculate sales velocity over last 14 days
        sales_14d = db.query(func.sum(Sale.quantity_sold)).filter(
            Sale.product_id == prod.id,
            Sale.sale_date >= fourteen_days_ago
        ).scalar() or 0

        daily_demand = max(0.5, round(sales_14d / 14.0, 2)) # At least 0.5 unit/day baseline
        days_remaining = round(available_stock / daily_demand, 1)

        lead_time = prod.lead_time_days or 5
        safety_stock = prod.safety_stock or inv.safety_stock or 10
        reorder_point = prod.reorder_point or inv.reorder_level or 15

        # Determine Risk Status
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

        # Calculate Recommended Reorder Qty
        target_buffer_days = 30 # target 30-day stock buffer
        needed_units = int((daily_demand * target_buffer_days) + safety_stock)
        suggested_reorder = max(15, needed_units - available_stock)

        # Look up best supplier recommendation
        supplier_eval = evaluate_suppliers_for_product(db, prod.name)
        best_supplier_name = (
            supplier_eval["best_supplier"]["name"] 
            if supplier_eval["best_supplier"] 
            else "No supplier on record"
        )

        if severity in ("CRITICAL", "WARNING"):
            action = (
                f"Place Purchase Order for {suggested_reorder} units with {best_supplier_name}. "
                f"Current coverage is only ~{days_remaining} days."
            )
            alerts.append({
                "product_id": prod.id,
                "product_name": prod.name,
                "sku": prod.sku,
                "category": prod.category,
                "current_stock": inv.current_stock,
                "available_stock": available_stock,
                "reserved_stock": inv.reserved_stock,
                "reorder_level": reorder_point,
                "safety_stock": safety_stock,
                "daily_demand": daily_demand,
                "days_remaining": days_remaining,
                "lead_time_days": lead_time,
                "severity": severity,
                "status": status,
                "suggested_reorder_units": suggested_reorder,
                "recommended_supplier": best_supplier_name,
                "action_recommendation": action,
                "reason": f"Stock level ({available_stock} avail) will deplete in approximately {days_remaining} days based on current burn rate."
            })

    # Sort alerts: CRITICAL first, then lowest days remaining
    alerts.sort(key=lambda a: (0 if a["severity"] == "CRITICAL" else 1, a["days_remaining"]))

    return {
        "total_stock_units": total_stock_units,
        "total_inventory_value": round(total_inventory_value, 2),
        "total_items_tracked": len(inventory_records),
        "low_stock_alerts_count": len(alerts),
        "critical_out_of_stock_count": critical_count,
        "warning_count": warning_count,
        "overstock_count": overstock_count,
        "alerts": alerts
    }
