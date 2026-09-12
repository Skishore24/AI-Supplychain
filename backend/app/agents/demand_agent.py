from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.agents.specialized.demand_forecast_agent import DemandForecastAgent
from app.services.forecast_service import forecast_service
from app.services.risk_service import risk_service

def generate_demand_forecast(db: Session, organization_id: int = 1) -> Dict[str, Any]:
    """
    Generates time-series demand predictions across all active catalog products.
    """
    try:
        data = forecast_service.generate_all_forecasts(db, organization_id=organization_id)
        return data
    except Exception as e:
        return {
            "forecast_horizon_days": 30,
            "items": [],
            "forecasts": [],
            "category_run_rates": []
        }

def get_supply_chain_risk_overview(db: Session, organization_id: int = 1) -> Dict[str, Any]:
    """
    Multi-echelon risk radar calculation across inventory depletion, suppliers, and demand.
    """
    try:
        radar = risk_service.generate_risk_radar(db, organization_id=organization_id)
        # Adapt for frontend format expected by alerts page
        risks = []
        for r in radar.get("items", []):
            risks.append({
                "id": r.get("risk_type"),
                "category": r.get("risk_type", "").split("_")[0].capitalize(),
                "severity": r.get("severity"),
                "probability": r.get("probability"),
                "impact": r.get("impact"),
                "risk_score": r.get("risk_score"),
                "title": r.get("title"),
                "reason": r.get("reason"),
                "affected_entity": r.get("affected_entity"),
                "recommended_action": r.get("recommended_action")
            })
        
        health = radar.get("overall_health_score", 85.0)
        risk_level = "CRITICAL" if health < 50 else ("ELEVATED" if health < 70 else ("MODERATE" if health < 85 else "OPTIMAL"))

        return {
            "overall_risk_score": round(100.0 - health, 1),
            "risk_level": risk_level,
            "critical_alerts_count": radar.get("critical_count", 0),
            "warning_alerts_count": radar.get("warning_count", 0),
            "risks": risks
        }
    except Exception as e:
        return {
            "overall_risk_score": 0.0,
            "risk_level": "OPTIMAL",
            "critical_alerts_count": 0,
            "warning_alerts_count": 0,
            "risks": []
        }

__all__ = ["DemandForecastAgent", "generate_demand_forecast", "get_supply_chain_risk_overview"]
