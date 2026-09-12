from typing import Optional, Dict, Any, List
from pydantic import BaseModel

class RiskAlertOut(BaseModel):
    id: int
    product_id: int
    organization_id: int
    severity: str
    title: str
    reason: str
    affected_entity: str
    recommended_action: str
    status: str
    created_at: str

class RiskRadarItem(BaseModel):
    risk_type: str
    severity: str
    probability: float
    impact: float
    risk_score: float
    title: str
    reason: str
    affected_entity: str
    recommended_action: str
    supporting_data: Optional[Dict[str, Any]] = None

class RiskRadarResponse(BaseModel):
    total_risks: int
    critical_count: int
    warning_count: int
    overall_health_score: float
    items: List[RiskRadarItem]
