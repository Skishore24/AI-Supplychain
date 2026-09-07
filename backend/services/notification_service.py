from sqlalchemy.orm import Session
from models.system import Notification

def create_system_notification(
    db: Session,
    title: str,
    message: str,
    notification_type: str = "info",
    severity: str = "info",
    link_url: str = ""
):
    try:
        notif = Notification(
            title=title,
            message=message,
            type=notification_type,
            severity=severity,
            link_url=link_url,
            is_read=False
        )
        db.add(notif)
        db.commit()
    except Exception as e:
        print(f"Warning: Notification creation failed: {e}")
