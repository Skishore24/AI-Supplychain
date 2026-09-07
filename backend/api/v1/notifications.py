from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.deps import get_db, require_admin_or_manager
from models.system import Notification
from schemas.system import NotificationResponse
from schemas.common import StandardResponse

router = APIRouter(prefix="/notifications", tags=["Notification Center"])

@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    return db.query(Notification).order_by(Notification.id.desc()).limit(limit).all()

@router.put("/{notif_id}/read", response_model=StandardResponse)
def mark_notification_read(notif_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return StandardResponse(message="Notification marked as read.")

@router.put("/mark-all-read", response_model=StandardResponse)
def mark_all_notifications_read(db: Session = Depends(get_db)):
    db.query(Notification).update({"is_read": True})
    db.commit()
    return StandardResponse(message="All notifications marked as read.")
