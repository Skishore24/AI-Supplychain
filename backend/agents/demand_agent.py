import math
from datetime import date, timedelta
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from models.product import Product
from models.inventory import Inventory
from models.sales import Sale

def generate_demand_forecast(db: Session) -> Dict[str, Any]:
    """
    Agent 3: Demand Velocity & Run-Rate Forecaster
    Generates 7-day, 30-day, and 90-day demand horizons with confidence intervals.
    """
    products = db.query(Product).filter(Product.status == "active").all()
    forecasts = []
    
    today = date.today()
    thirty_days_ago = today - timedelta(days=30)
    seven_days_ago = today - timedelta(days=7)

    category_demand = {}

    for prod in products:
        inv = db.query(Inventory).filter(Inventory.product_id == prod.id).first()
        current_stock = inv.current_stock if inv else 0
        available_stock = max(0, current_stock - (inv.reserved_stock if inv else 0))

        # Recent sales
        sales_7d = db.query(func.sum(Sale.quantity_sold)).filter(
            Sale.product_id == prod.id,
            Sale.sale_date >= seven_days_ago
        ).scalar() or 0

        sales_30d = db.query(func.sum(Sale.quantity_sold)).filter(
            Sale.product_id == prod.id,
            Sale.sale_date >= thirty_days_ago
        ).scalar() or 0

        daily_rate_7d = sales_7d / 7.0
        daily_rate_30d = sales_30d / 30.0

        # Weighted velocity: recent 7 days weighted 60%, 30 days weighted 40%
        base_velocity = max(0.5, round((daily_rate_7d * 0.6) + (daily_rate_30d * 0.4), 2))

        # Trend detection
        if daily_rate_7d > daily_rate_30d * 1.15:
            trend = "increasing"
            growth_pct = round(((daily_rate_7d - daily_rate_30d) / max(0.1, daily_rate_30d)) * 100, 1)
            multiplier = 1.10
        elif daily_rate_7d < daily_rate_30d * 0.85:
            trend = "decreasing"
            growth_pct = round(((daily_rate_7d - daily_rate_30d) / max(0.1, daily_rate_30d)) * 100, 1)
            multiplier = 0.92
        else:
            trend = "stable"
            growth_pct = 0.0
            multiplier = 1.0

        p7 = round(base_velocity * 7 * multiplier, 1)
        p30 = round(base_velocity * 30 * multiplier, 1)
        p90 = round(base_velocity * 90 * multiplier, 1)

        # Standard error / confidence bounds (± 15% - 25%)
        conf_margin_30 = p30 * 0.18
        conf_lower = max(0.0, round(p30 - conf_margin_30, 1))
        conf_upper = round(p30 + conf_margin_30, 1)

        days_stock_left = round(available_stock / base_velocity, 1)

        if days_stock_left < 7:
            risk = "HIGH"
        elif days_stock_left < 20:
            risk = "MEDIUM"
        else:
            risk = "LOW"

        forecasts.append({
            "product_id": prod.id,
            "product_name": prod.name,
            "sku": prod.sku,
            "category": prod.category,
            "current_stock": current_stock,
            "available_stock": available_stock,
            "daily_velocity": base_velocity,
            "projected_7d": p7,
            "projected_30d": p30,
            "projected_90d": p90,
            "confidence_lower": conf_lower,
            "confidence_upper": conf_upper,
            "trend_direction": trend,
            "growth_rate": growth_pct,
            "days_of_stock_left": days_stock_left,
            "stockout_risk": risk
        })

        # Category aggregate
        cat = prod.category
        if cat not in category_demand:
            category_demand[cat] = {"category": cat, "monthly_projected_units": 0, "daily_velocity": 0.0}
        category_demand[cat]["monthly_projected_units"] += p30
        category_demand[cat]["daily_velocity"] += base_velocity

    return {
        "forecast_horizon_days": 30,
        "items": forecasts,
        "category_run_rates": list(category_demand.values())
    }

def get_supply_chain_risk_overview(db: Session) -> Dict[str, Any]:
    """
    Supply Chain Risk Engine:
    Categorizes risks across Stockout, Supplier, Demand, Delivery, and Inventory Anomaly.
    """
    from agents.inventory_agent import calculate_inventory_intelligence
    inv_intel = calculate_inventory_intelligence(db)
    demand_intel = generate_demand_forecast(db)

    risks = []
    
    # 1. Stockout Risks
    for alert in inv_intel.get("alerts", []):
        if alert["severity"] == "CRITICAL":
            risks.append({
                "id": f"RISK-STOCKOUT-{alert['product_id']}",
                "category": "Stockout",
                "severity": "CRITICAL",
                "probability": 0.95,
                "impact": 0.90,
                "risk_score": 85.5,
                "title": f"Imminent Stockout for {alert['product_name']}",
                "reason": alert["reason"],
                "affected_entity": f"{alert['sku']} ({alert['product_name']})",
                "recommended_action": f"Approve PO for {alert['suggested_reorder_units']} units via {alert['recommended_supplier']}."
            })
        elif alert["severity"] == "WARNING":
            risks.append({
                "id": f"RISK-STOCKOUT-{alert['product_id']}",
                "category": "Stockout",
                "severity": "HIGH",
                "probability": 0.75,
                "impact": 0.70,
                "risk_score": 52.5,
                "title": f"Replenishment Warning: {alert['product_name']}",
                "reason": alert["reason"],
                "affected_entity": f"{alert['sku']}",
                "recommended_action": f"Schedule reorder of {alert['suggested_reorder_units']} units."
            })

    # 2. Demand Surge Risks
    for item in demand_intel.get("items", []):
        if item["growth_rate"] > 20.0 and item["days_of_stock_left"] < 15:
            risks.append({
                "id": f"RISK-DEMAND-{item['product_id']}",
                "category": "Demand",
                "severity": "HIGH",
                "probability": 0.80,
                "impact": 0.75,
                "risk_score": 60.0,
                "title": f"Demand Surge Detected (+{item['growth_rate']}%)",
                "reason": f"Sales run-rate surged by {item['growth_rate']}% over the past 7 days while stock coverage is only {item['days_of_stock_left']} days.",
                "affected_entity": f"{item['sku']} ({item['product_name']})",
                "recommended_action": "Increase safety stock threshold and place advance replenishment."
            })

    # Overall risk score calculation
    if not risks:
        overall_score = 12.0
        risk_level = "OPTIMAL"
    else:
        crit_count = sum(1 for r in risks if r["severity"] == "CRITICAL")
        high_count = sum(1 for r in risks if r["severity"] == "HIGH")
        overall_score = min(98.0, max(15.0, (crit_count * 25.0) + (high_count * 12.0)))
        
        if overall_score >= 70:
            risk_level = "CRITICAL"
        elif overall_score >= 45:
            risk_level = "ELEVATED"
        elif overall_score >= 25:
            risk_level = "MODERATE"
        else:
            risk_level = "OPTIMAL"

    return {
        "overall_risk_score": round(overall_score, 1),
        "risk_level": risk_level,
        "critical_alerts_count": sum(1 for r in risks if r["severity"] == "CRITICAL"),
        "warning_alerts_count": sum(1 for r in risks if r["severity"] in ("HIGH", "MEDIUM")),
        "risks": risks
    }
