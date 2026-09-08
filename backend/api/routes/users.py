from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.deps import get_db, require_admin
from models.user import User
from schemas.auth import UserResponse
from schemas.common import StandardResponse
from services.audit_service import log_audit_event

router = APIRouter(prefix="/users", tags=["Users Management"])

@router.get("/", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    return db.query(User).order_by(User.id.asc()).all()

@router.put("/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    new_role: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    if new_role not in ("admin", "manager", "customer"):
        raise HTTPException(status_code=400, detail="Invalid role specified.")

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    old_role = target_user.role
    target_user.role = new_role
    db.commit()
    db.refresh(target_user)

    log_audit_event(
        db=db,
        user_email=admin.email,
        action="USER_ROLE_UPDATED",
        entity="User",
        entity_id=user_id,
        previous_state={"role": old_role},
        new_state={"role": new_role}
    )

    return target_user

@router.put("/{user_id}/toggle-status", response_model=UserResponse)
def toggle_user_status(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    if target_user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account.")

    target_user.is_active = not target_user.is_active
    db.commit()
    db.refresh(target_user)

    log_audit_event(
        db=db,
        user_email=admin.email,
        action="USER_STATUS_TOGGLED",
        entity="User",
        entity_id=user_id,
        new_state={"is_active": target_user.is_active}
    )

    return target_user

@router.delete("/{user_id}", response_model=StandardResponse)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    if target_user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own administrator account.")

    user_email = target_user.email
    db.delete(target_user)
    db.commit()

    log_audit_event(
        db=db,
        user_email=admin.email,
        action="USER_DELETED",
        entity="User",
        entity_id=user_id,
        previous_state={"email": user_email}
    )

    return StandardResponse(message=f"User {user_email} has been permanently deleted.")
