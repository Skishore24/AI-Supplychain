from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.ai.tools.base_tool import AITool, ToolPermissionLevel
from app.services.analytics_service import analytics_service

class GetAnalyticsInput(BaseModel):
    timeframe: str = Field("30d", description="Analysis window: 7d, 30d, 90d, 12m")

class GetExecutiveAnalyticsTool(AITool):
    name = "get_executive_analytics"
    description = "Retrieve aggregated revenue, order volumes, inventory valuation, and category distribution."
    input_schema = GetAnalyticsInput
    permission_level = ToolPermissionLevel.READ

    def execute(self, db: Session, user: Optional[Any] = None, organization_id: int = 1, **kwargs) -> Dict[str, Any]:
        params = self.validate_inputs(**kwargs)
        return analytics_service.get_overview(
            db=db,
            organization_id=organization_id,
            timeframe=params.get("timeframe", "30d")
        )
