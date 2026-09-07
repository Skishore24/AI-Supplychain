from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from db.base import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, nullable=False, default="info") # "low_stock", "po_approved", "supplier_delay", "order_received", "ai_alert"
    severity = Column(String, nullable=False, default="info") # "critical", "warning", "info"
    is_read = Column(Boolean, default=False, nullable=False)
    link_url = Column(String, nullable=True, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_email = Column(String, nullable=False, default="system@emox.ai")
    action = Column(String, nullable=False) # e.g. "PRODUCT_UPDATED", "STOCK_ADJUSTED", "PO_APPROVED"
    entity = Column(String, nullable=False) # "Product", "Inventory", "Supplier", "PurchaseOrder"
    entity_id = Column(String, nullable=False)
    previous_state = Column(Text, nullable=True, default="{}")
    new_state = Column(Text, nullable=True, default="{}")
    ip_address = Column(String, nullable=True, default="127.0.0.1")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="audit_logs")
