from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.ai.tools.base_tool import AITool, ToolPermissionLevel
from app.services.risk_service import risk_service

class GetRiskRadarTool(AITool):
    name = "get_risk_radar"
    description = "Compute and rank organization-wide supply chain risks across inventory, demand anomalies, and vendor bottlenecks."
    permission_level = ToolPermissionLevel.READ

    def execute(self, db: Session, user: Optional[Any] = None, organization_id: int = 1, **kwargs) -> Dict[str, Any]:
        return risk_service.generate_risk_radar(db, organization_id=organization_id)
