from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.models.product import Product
from app.models.ai import DemandForecast
from app.ml.forecasting.predict import generate_demand_prediction
from app.core.exceptions import NotFoundError

class ForecastService:
    """
    Demand Forecasting Service:
    Coordinates ML time-series predictions (Ridge / EMA Baseline),
    computes confidence intervals, and stores forecast records scoped by tenant.
    """

    def run_forecast(
        self,
        db: Session,
        organization_id: int,
        product_id: int,
        horizons: Optional[List[int]] = None
    ) -> Dict[str, Any]:
        if horizons is None:
            horizons = [7, 30, 90]

        product = db.query(Product).filter(
            Product.id == product_id,
            Product.organization_id == organization_id
        ).first()
        if not product:
            raise NotFoundError(f"Product {product_id} not found in this organization.")

        pred = generate_demand_prediction(db, product_id=product.id, horizons=horizons)

        return {
            "product_id": product.id,
            "product_name": product.name,
            "sku": product.sku,
            "organization_id": organization_id,
            "daily_velocity": pred.get("daily_velocity", 1.0),
            "trend": pred.get("trend", "stable"),
            "growth_rate": pred.get("growth_rate", 0.0),
            "chosen_model": pred.get("chosen_model", "EMA_Baseline"),
            "model_version": pred.get("version", "1.0.0"),
            "metrics": pred.get("metrics", {}),
            "horizons": pred.get("horizons", []),
            "generated_at": datetime.now(timezone.utc).isoformat()
        }

    def list_forecasts(
        self,
        db: Session,
        organization_id: int,
        product_id: Optional[int] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        query = db.query(DemandForecast, Product).join(
            Product, DemandForecast.product_id == Product.id
        ).filter(Product.organization_id == organization_id)

        if product_id:
            query = query.filter(DemandForecast.product_id == product_id)

        records = query.order_by(DemandForecast.forecast_date.desc()).limit(limit).all()

        return [
            {
                "id": f.id,
                "product_id": f.product_id,
                "product_name": p.name,
                "sku": p.sku,
                "forecast_date": f.forecast_date.isoformat(),
                "horizon_days": f.horizon_days or f.horizon,
                "daily_velocity": f.current_velocity,
                "predicted_quantity": f.predicted_quantity,
                "lower_bound": f.lower_bound,
                "upper_bound": f.upper_bound,
                "trend": f.trend_direction,
                "model_name": f.model_name,
                "confidence": f.confidence
            }
            for f, p in records
        ]

forecast_service = ForecastService()
