import json
from typing import Optional, Any, Dict
from sqlalchemy.orm import Session
from app.models.system import AuditLog

def log_audit_event(
    db: Session,
    user_email: str,
    action: str,
    entity: str,
    entity_id: Any,
    previous_state: Optional[Dict[str, Any]] = None,
    new_state: Optional[Dict[str, Any]] = None,
    ip_address: str = "127.0.0.1"
) -> None:
    try:
        prev_str = json.dumps(previous_state or {}) if isinstance(previous_state, dict) else str(previous_state or "{}")
        new_str = json.dumps(new_state or {}) if isinstance(new_state, dict) else str(new_state or "{}")

        audit_entry = AuditLog(
            user_email=user_email or "system@emox.ai",
            action=action,
            entity=entity,
            entity_id=str(entity_id),
            previous_state=prev_str,
            new_state=new_str,
            ip_address=ip_address
        )
        db.add(audit_entry)
        db.commit()
    except Exception as e:
        print(f"Warning: Audit log recording failed: {e}")
