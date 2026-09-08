from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.deps import get_db, require_admin
from models.system import AuditLog
from models.user import User
from schemas.system import AuditLogResponse

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs & Governance"])

@router.get("/", response_model=List[AuditLogResponse])
def get_audit_logs(
    entity: Optional[str] = None,
    action: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    query = db.query(AuditLog)
    if entity:
        query = query.filter(AuditLog.entity == entity)
    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))

    return query.order_by(AuditLog.id.desc()).limit(limit).all()
