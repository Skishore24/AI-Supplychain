from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from models.ai import DemandForecast
from models.product import Product
from ai.tools.base_tool import AITool

class GetDemandForecastTool(AITool):
    name = "get_demand_forecast"
    description = "Retrieve stored demand forecasting records with confidence intervals and horizon bounds."
    is_write = False
    requires_auth = False

    def execute(self, db: Session, user: Optional[Any] = None, product_id: int = 0, horizon: int = 30, **kwargs) -> Dict[str, Any]:
        forecast = db.query(DemandForecast).filter(
            DemandForecast.product_id == product_id,
            DemandForecast.horizon == horizon
        ).order_by(DemandForecast.created_at.desc()).first()

        if not forecast:
            prod = db.query(Product).filter(Product.id == product_id).first()
            prod_name = prod.name if prod else f"Product #{product_id}"
            return {
                "found": False,
                "product_id": product_id,
                "product_name": prod_name,
                "message": f"No precomputed {horizon}-day forecast found for {prod_name}."
            }

        return {
            "found": True,
            "product_id": forecast.product_id,
            "horizon_days": forecast.horizon,
            "predicted_quantity": forecast.predicted_quantity,
            "lower_bound": forecast.lower_bound,
            "upper_bound": forecast.upper_bound,
            "current_velocity": forecast.current_velocity,
            "trend_direction": forecast.trend_direction,
            "growth_rate": forecast.growth_rate,
            "model_name": forecast.model_name,
            "confidence": forecast.confidence
        }
