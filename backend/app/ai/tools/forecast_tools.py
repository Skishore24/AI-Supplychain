from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.ai.tools.base_tool import AITool, ToolPermissionLevel
from app.services.forecast_service import forecast_service

class ForecastDemandInput(BaseModel):
    product_id: int = Field(..., description="ID of product to forecast")
    horizons: Optional[List[int]] = Field([7, 30, 90], description="Forecast horizons in days")

class ForecastDemandTool(AITool):
    name = "forecast_demand"
    description = "Execute chronological ML demand forecasting (Ridge Regression / EMA Baseline) with confidence bounds."
    input_schema = ForecastDemandInput
    permission_level = ToolPermissionLevel.READ

    def execute(self, db: Session, user: Optional[Any] = None, organization_id: int = 1, **kwargs) -> Dict[str, Any]:
        params = self.validate_inputs(**kwargs)
        result = forecast_service.run_forecast(
            db=db,
            organization_id=organization_id,
            product_id=params["product_id"],
            horizons=params.get("horizons")
        )
        return result
