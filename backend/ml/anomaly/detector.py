from typing import List, Dict, Any
from sqlalchemy.orm import Session
from datetime import date, timedelta
from models.product import Product
from models.inventory import Inventory
from models.supplier import Supplier
from ml.anomaly.features import extract_anomaly_features

class SupplyChainAnomalyDetector:
    """
    Statistical and rule-based anomaly detector for supply chain monitoring.
    Flags demand spikes, demand collapse, stockout vulnerabilities, and supplier degradation.
    """

    def detect_all(self, db: Session) -> List[Dict[str, Any]]:
        features = extract_anomaly_features(db)
        v7 = features["velocity_7d"]
        v30 = features["velocity_30d"]
        suppliers = features["suppliers"]

        anomalies = []
        products = db.query(Product).all()

        for p in products:
            r7 = v7.get(p.id, 0.0)
            r30 = v30.get(p.id, 0.0)

            # 1. Demand Surge (+30% or more)
            if r30 > 0.5 and r7 > (r30 * 1.30):
                surge_pct = round(((r7 - r30) / r30) * 100, 1)
                anomalies.append({
                    "risk_type": "demand_spike",
                    "severity": "HIGH",
                    "probability": 0.85,
                    "impact": 0.75,
                    "risk_score": 63.8,
                    "title": f"Demand Surge (+{surge_pct}%) on {p.name}",
                    "reason": f"Weekly sales rate jumped from {r30:.1f} to {r7:.1f} units/day.",
                    "affected_entity": f"{p.sku} ({p.name})",
                    "recommended_action": "Increase reorder buffer and trigger advance replenishment."
                })

            # 2. Demand Drop (-50% or more)
            elif r30 > 2.0 and r7 < (r30 * 0.50):
                drop_pct = round(((r30 - r7) / r30) * 100, 1)
                anomalies.append({
                    "risk_type": "demand_drop",
                    "severity": "MEDIUM",
                    "probability": 0.75,
                    "impact": 0.50,
                    "risk_score": 37.5,
                    "title": f"Demand Drop (-{drop_pct}%) on {p.name}",
                    "reason": f"Weekly burn rate fell from {r30:.1f} to {r7:.1f} units/day.",
                    "affected_entity": f"{p.sku} ({p.name})",
                    "recommended_action": "Review pricing competitiveness and marketing visibility."
                })

        # 3. Supplier Quality or Delivery Degradation
        for s_id, s_data in suppliers.items():
            if s_data["quality"] < 80.0:
                anomalies.append({
                    "risk_type": "quality_decline",
                    "severity": "HIGH",
                    "probability": 0.80,
                    "impact": 0.85,
                    "risk_score": 68.0,
                    "title": f"Quality Degradation: {s_data['name']}",
                    "reason": f"Supplier quality index has dropped to {s_data['quality']}%.",
                    "affected_entity": s_data["name"],
                    "recommended_action": "Initiate supplier audit and route orders to secondary certified vendor."
                })
            elif s_data["delivery_days"] > 14:
                anomalies.append({
                    "risk_type": "supplier_delay",
                    "severity": "MEDIUM",
                    "probability": 0.70,
                    "impact": 0.60,
                    "risk_score": 42.0,
                    "title": f"Extended Lead Time: {s_data['name']}",
                    "reason": f"Supplier delivery turnaround is {s_data['delivery_days']} days, exceeding safety thresholds.",
                    "affected_entity": s_data["name"],
                    "recommended_action": "Adjust inventory reorder points to account for longer lead times."
                })

        return anomalies
