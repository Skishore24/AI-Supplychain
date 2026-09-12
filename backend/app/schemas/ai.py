from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel

class AIRecommendationResponse(BaseModel):
    id: int
    agent_name: str
    entity_type: str
    entity_id: Optional[int] = None
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    recommendation: str
    confidence: float
    score: float
    reasoning: List[str]
    suggested_action: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class InventoryAlertResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    sku: str
    severity: str # "CRITICAL", "WARNING", "INFO"
    title: str
    reason: str
    affected_entity: str
    recommended_action: str
    status: str
    suggested_reorder_units: int
    recommended_supplier: str
    current_stock: int
    reorder_level: int
    created_at: datetime

class DemandForecastItem(BaseModel):
    product_id: int
    product_name: str
    sku: str
    category: str
    current_stock: int
    daily_velocity: float
    projected_7d: float
    projected_30d: float
    projected_90d: float
    confidence_lower: float
    confidence_upper: float
    trend_direction: str # "increasing", "stable", "decreasing"
    days_of_stock_left: float
    stockout_risk: str # "HIGH", "MEDIUM", "LOW"

class RiskItem(BaseModel):
    id: str
    category: str # "Stockout", "Supplier", "Demand", "Delivery", "Anomaly"
    severity: str # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    probability: float
    impact: float
    risk_score: float
    title: str
    reason: str
    affected_entity: str
    recommended_action: str

class RiskOverviewResponse(BaseModel):
    overall_risk_score: float # 0 - 100
    risk_level: str # "OPTIMAL", "MODERATE", "ELEVATED", "CRITICAL"
    critical_alerts_count: int
    warning_alerts_count: int
    risks: List[RiskItem]

class SupplyChainSummaryResponse(BaseModel):
    supply_chain_health_score: int
    total_products: int
    total_suppliers: int
    total_inventory_value: float
    total_stock_units: int
    total_revenue: float
    total_sales_units: int
    low_stock_alerts_count: int
    critical_out_of_stock_count: int
    active_purchase_orders_count: int
    system_status: str
    last_sync: str

AIRecommendationItem = AIRecommendationResponse

class AIChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    stream: bool = False
    context_data: Optional[dict] = None

class AIChatResponse(BaseModel):
    message: str
    conversation_id: str
    intent: Optional[str] = None
    route: Optional[str] = None
    agent_used: Optional[str] = None
    tool_calls: Optional[List[dict]] = None
    recommendations: Optional[List[dict]] = None
    metrics: Optional[dict] = None

class AIActionExecuteRequest(BaseModel):
    tool_name: str
    parameters: dict = {}
    reason: Optional[str] = None

class AIActionExecuteResponse(BaseModel):
    success: bool
    tool_name: str
    result: Any
    audit_id: Optional[int] = None
    message: str = "Action executed successfully"
