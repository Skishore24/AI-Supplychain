from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from db.base import Base

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    agent_name = Column(String, nullable=False) # "Supplier Optimizer", "Restock Agent", "Demand Forecaster"
    entity_type = Column(String, nullable=False) # "product", "supplier", "inventory"
    entity_id = Column(Integer, nullable=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=True)
    recommendation = Column(Text, nullable=False)
    confidence = Column(Float, nullable=False, default=0.85) # 0.0 - 1.0
    score = Column(Float, nullable=False, default=85.0)
    reasoning = Column(Text, nullable=False) # JSON or structured bullet points
    suggested_action = Column(String, nullable=False) # e.g. "Create Purchase Order for 150 units"
    status = Column(String, nullable=False, default="active") # "active", "accepted", "dismissed"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    product = relationship("Product", back_populates="ai_recommendations")

class InventoryAlert(Base):
    __tablename__ = "inventory_alerts"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    severity = Column(String, nullable=False, default="WARNING") # "CRITICAL", "WARNING", "INFO"
    title = Column(String, nullable=False)
    reason = Column(Text, nullable=False)
    affected_entity = Column(String, nullable=False)
    recommended_action = Column(String, nullable=False)
    status = Column(String, nullable=False, default="open") # "open", "resolved"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    product = relationship("Product")

class SupplierEvaluation(Base):
    __tablename__ = "supplier_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    price_score = Column(Float, nullable=False, default=80.0)
    quality_score = Column(Float, nullable=False, default=85.0)
    delivery_score = Column(Float, nullable=False, default=80.0)
    reliability_score = Column(Float, nullable=False, default=90.0)
    overall_score = Column(Float, nullable=False, default=84.0)
    reasoning = Column(Text, nullable=True, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    supplier = relationship("Supplier", back_populates="evaluations")
    product = relationship("Product")

class DemandForecast(Base):
    __tablename__ = "demand_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    horizon_days = Column(Integer, nullable=False, default=30) # 7, 30, 90
    current_velocity = Column(Float, nullable=False, default=1.0) # units / day
    projected_demand = Column(Float, nullable=False)
    confidence_lower = Column(Float, nullable=False)
    confidence_upper = Column(Float, nullable=False)
    trend_direction = Column(String, nullable=False, default="increasing") # "increasing", "stable", "decreasing"
    growth_rate = Column(Float, nullable=False, default=0.0) # percentage
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    product = relationship("Product")
