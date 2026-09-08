from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.deps import get_db, require_admin_or_manager
from models.user import User
from models.product import Product
from models.ai import DemandForecast, ModelRegistry
from ml.forecasting.predict import generate_demand_prediction
from ml.forecasting.train import train_demand_forecaster

router = APIRouter(tags=["ML Demand Forecasting"])

@router.get("/forecast/products/{product_id}")
@router.get("/v1/forecast/products/{product_id}")
def get_product_forecast(
    product_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    """
    Retrieve latest stored demand forecast bounds and velocity for a product.
    """
    forecasts = db.query(DemandForecast).filter(
        DemandForecast.product_id == product_id
    ).order_by(DemandForecast.created_at.desc()).limit(3).all()

    if not forecasts:
        # Generate dynamically if none exist
        pred = generate_demand_prediction(db, product_id=product_id)
        return pred

    return {
        "product_id": product_id,
        "daily_velocity": forecasts[0].current_velocity,
        "trend_direction": forecasts[0].trend_direction,
        "growth_rate_pct": forecasts[0].growth_rate,
        "model_used": forecasts[0].model_name,
        "model_version": forecasts[0].model_version,
        "horizons": [
            {
                "horizon_days": f.horizon,
                "predicted_quantity": f.predicted_quantity,
                "lower_bound": f.lower_bound,
                "upper_bound": f.upper_bound,
                "confidence": f.confidence
            }
            for f in forecasts
        ]
    }

@router.post("/forecast/products/{product_id}/generate")
@router.post("/v1/forecast/products/{product_id}/generate")
def trigger_forecast_generation(
    product_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    """
    Triggers ML training and generates 7d, 30d, 90d demand projections.
    """
    try:
        res = generate_demand_prediction(db, product_id=product_id)
        return {
            "success": True,
            "forecast": res,
            "message": f"Demand forecast updated using {res.get('model_used')}."
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/forecast/products/{product_id}/accuracy")
@router.get("/v1/forecast/products/{product_id}/accuracy")
def get_forecast_accuracy(
    product_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    """
    Returns MAE, RMSE, MAPE metrics comparing baseline vs trained ML model.
    """
    reg = db.query(ModelRegistry).filter(
        ModelRegistry.model_name.ilike(f"%SKU_{product_id}%")
    ).order_by(ModelRegistry.training_date.desc()).first()

    if not reg:
        # Train now
        reg_data = train_demand_forecaster(db, product_id)
        return {
            "product_id": product_id,
            "chosen_model": reg_data.get("chosen_model"),
            "metrics": reg_data.get("metrics"),
            "baseline_metrics": reg_data.get("baseline_metrics"),
            "ml_metrics": reg_data.get("ml_metrics")
        }

    return {
        "product_id": product_id,
        "chosen_model": reg.model_name,
        "model_type": reg.model_type,
        "version": reg.version,
        "metrics": reg.metrics.get("winner_metrics") if isinstance(reg.metrics, dict) else {},
        "full_comparison": reg.metrics
    }
