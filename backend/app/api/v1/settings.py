from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from app.api.deps import require_admin_or_manager
from app.models.user import User
from app.schemas.system import SettingsUpdate, SettingsResponse

router = APIRouter(prefix="/settings", tags=["System Settings"])

_CURRENT_SETTINGS = {
    "company_name": "EMOX Supply Chain Enterprise",
    "currency": "INR",
    "default_lead_time_days": 5,
    "default_safety_stock_buffer": 1.5,
    "stockout_warning_threshold_days": 4,
    "enable_ai_auto_reorder_drafts": True,
    "notification_email": "procurement@emox.ai",
    "system_version": "2.0.0",
    "last_updated": datetime.now(timezone.utc)
}

@router.get("/", response_model=SettingsResponse)
def get_settings():
    return SettingsResponse(**_CURRENT_SETTINGS)

@router.put("/", response_model=SettingsResponse)
def update_settings(
    data: SettingsUpdate,
    admin: User = Depends(require_admin_or_manager)
):
    global _CURRENT_SETTINGS
    updates = data.model_dump(exclude_unset=True)
    _CURRENT_SETTINGS.update(updates)
    _CURRENT_SETTINGS["last_updated"] = datetime.now(timezone.utc)
    return SettingsResponse(**_CURRENT_SETTINGS)
