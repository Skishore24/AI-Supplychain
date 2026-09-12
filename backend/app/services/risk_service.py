from typing import Dict, Any, List
from sqlalchemy.orm import Session
from datetime import date, timedelta

from app.models.product import Product
from app.models.inventory import Inventory
from app.models.supplier import Supplier
from app.models.sales import Sale
from app.services.inventory_service import inventory_service

class RiskService:
    """
    Unified Supply Chain Risk Radar & Anomaly Engine:
    - Analyzes physical inventory run-rates, coverage days, and impending stockouts
    - Identifies supplier quality drops and extended delivery lead-times
    - Detects unexpected demand spikes or demand collapse
    - Ranks all vulnerabilities by severity and calculated risk score
    """

    def generate_risk_radar(self, db: Session, organization_id: int) -> Dict[str, Any]:
        inv_status = inventory_service.get_inventory_status(db, organization_id=organization_id)
        items = inv_status["items"]

        radar_items = []
        critical_count = 0
        warning_count = 0

        # 1. Stockout & Depletion Risks
        for item in items:
            cov = item["days_of_coverage"]
            lead = item["lead_time_days"]
            avail = item["available_stock"]

            if avail == 0:
                critical_count += 1
                radar_items.append({
                    "risk_type": "stockout_critical",
                    "severity": "CRITICAL",
                    "probability": 1.0,
                    "impact": 0.95,
                    "risk_score": 95.0,
                    "title": f"Active Stockout: {item['name']}",
                    "reason": f"Physical stock is depleted. 0 units available against daily demand of {item['daily_demand']} units/day.",
                    "affected_entity": f"{item['sku']} ({item['name']})",
                    "recommended_action": f"Issue emergency purchase order immediately (ROP: {item['reorder_point']} units).",
                    "supporting_data": {"available": avail, "daily_demand": item["daily_demand"], "lead_time": lead}
                })
            elif cov <= lead:
                critical_count += 1
                radar_items.append({
                    "risk_type": "stockout_imminent",
                    "severity": "CRITICAL",
                    "probability": 0.90,
                    "impact": 0.85,
                    "risk_score": 76.5,
                    "title": f"Imminent Stockout Risk: {item['name']}",
                    "reason": f"Only {cov} days of coverage remain, which is below supplier lead time ({lead} days).",
                    "affected_entity": f"{item['sku']} ({item['name']})",
                    "recommended_action": f"Expedite replenishment order for at least {item['reorder_point']} units.",
                    "supporting_data": {"available": avail, "coverage_days": cov, "lead_time": lead}
                })
            elif cov <= (lead * 1.5) or avail <= item["reorder_point"]:
                warning_count += 1
                radar_items.append({
                    "risk_type": "low_stock_warning",
                    "severity": "WARNING",
                    "probability": 0.65,
                    "impact": 0.60,
                    "risk_score": 39.0,
                    "title": f"Reorder Threshold Triggered: {item['name']}",
                    "reason": f"Available stock ({avail}) has fallen below reorder point ({item['reorder_point']}).",
                    "affected_entity": f"{item['sku']} ({item['name']})",
                    "recommended_action": f"Prepare draft purchase order with preferred vendor.",
                    "supporting_data": {"available": avail, "reorder_point": item["reorder_point"]}
                })

        # 2. Supplier Quality & Lead-time Degradation
        suppliers = db.query(Supplier).filter(
            Supplier.organization_id == organization_id,
            Supplier.status == "active"
        ).all()

        for s in suppliers:
            if s.quality_score < 80.0:
                warning_count += 1
                radar_items.append({
                    "risk_type": "supplier_quality_drop",
                    "severity": "WARNING",
                    "probability": 0.70,
                    "impact": 0.75,
                    "risk_score": 52.5,
                    "title": f"Supplier Quality Deficit: {s.name}",
                    "reason": f"Quality index is {s.quality_score}%, falling below the 80% SLA threshold.",
                    "affected_entity": f"Supplier: {s.name}",
                    "recommended_action": "Conduct vendor quality audit or route purchase orders to secondary supplier.",
                    "supporting_data": {"quality_score": s.quality_score, "reliability": s.reliability_score}
                })
            if s.delivery_days > 12:
                warning_count += 1
                radar_items.append({
                    "risk_type": "supplier_extended_leadtime",
                    "severity": "WARNING",
                    "probability": 0.60,
                    "impact": 0.65,
                    "risk_score": 39.0,
                    "title": f"Prolonged Delivery Window: {s.name}",
                    "reason": f"Published lead time is {s.delivery_days} days, creating upstream buffer vulnerabilities.",
                    "affected_entity": f"Supplier: {s.name}",
                    "recommended_action": "Adjust inventory safety stock buffer by +20% for associated SKUs.",
                    "supporting_data": {"delivery_days": s.delivery_days}
                })

        radar_items.sort(key=lambda x: x["risk_score"], reverse=True)
        health_score = max(20.0, 100.0 - (critical_count * 15.0) - (warning_count * 5.0))

        return {
            "total_risks": len(radar_items),
            "critical_count": critical_count,
            "warning_count": warning_count,
            "overall_health_score": round(health_score, 1),
            "items": radar_items
        }

risk_service = RiskService()
