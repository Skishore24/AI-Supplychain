from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    severity: str
    is_read: bool
    link_url: Optional[str] = ""
    created_at: datetime

    class Config:
        from_attributes = True

class AuditLogResponse(BaseModel):
    id: int
    user_email: str
    action: str
    entity: str
    entity_id: str
    previous_state: Optional[str] = "{}"
    new_state: Optional[str] = "{}"
    ip_address: Optional[str] = "127.0.0.1"
    timestamp: datetime

    class Config:
        from_attributes = True

class SettingsUpdate(BaseModel):
    company_name: Optional[str] = "EMOX Supply Chain Enterprise"
    currency: Optional[str] = "INR"
    default_lead_time_days: Optional[int] = 5
    default_safety_stock_buffer: Optional[float] = 1.5
    stockout_warning_threshold_days: Optional[int] = 4
    enable_ai_auto_reorder_drafts: Optional[bool] = True
    notification_email: Optional[str] = "alerts@emox.ai"

class SettingsResponse(SettingsUpdate):
    system_version: str = "2.0.0"
    last_updated: datetime
