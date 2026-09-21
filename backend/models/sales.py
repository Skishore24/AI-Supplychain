from datetime import date, datetime, timezone
from sqlalchemy import Column, Integer, Float, String, ForeignKey, Date, DateTime
from sqlalchemy.orm import relationship

from db.base import Base

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True, default=1)
    quantity_sold = Column(Integer, nullable=False)
    sale_date = Column(Date, nullable=False, default=date.today)
    unit_price = Column(Float, nullable=False, default=0.0)
    total_amount = Column(Float, nullable=False, default=0.0)
    currency = Column(String, nullable=False, default="INR")
    transaction_ref = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    product = relationship("Product", back_populates="sales")
    order = relationship("Order", back_populates="sales_transactions")