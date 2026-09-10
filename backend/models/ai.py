from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship

from db.base import Base

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    agent_name = Column(String, nullable=False)  # "Supplier Optimizer", "Inventory Agent", "Procurement Agent", etc.
    agent_type = Column(String, nullable=True)  # "supplier", "inventory", "demand", "risk", "procurement"
    entity_type = Column(String, nullable=False)  # "product", "supplier", "inventory", "purchase_order"
    entity_id = Column(Integer, nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True, default=1)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=True)
    recommendation = Column(Text, nullable=False)
    confidence = Column(Float, nullable=True, default=0.85)  # 0.0 - 1.0 (or null if insufficient data)
    risk_score = Column(Float, nullable=True, default=0.0)  # 0.0 - 100.0
    score = Column(Float, nullable=True, default=85.0)
    reasoning = Column(Text, nullable=False)  # JSON or structured explanation
    reasoning_summary = Column(Text, nullable=True)
    supporting_data = Column(JSON, nullable=True)  # Dict/JSON of underlying metrics
    source_documents = Column(JSON, nullable=True)  # List of citations/document chunks used
    suggested_action = Column(String, nullable=False)  # e.g. "Create Purchase Order for 250 units"
    status = Column(String, nullable=False, default="GENERATED")  # "GENERATED", "REVIEWED", "APPROVED", "REJECTED", "EXECUTED", "EXPIRED"
    reviewed_by = Column(String, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    product = relationship("Product", back_populates="ai_recommendations")


class InventoryAlert(Base):
    __tablename__ = "inventory_alerts"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True, default=1)
    severity = Column(String, nullable=False, default="WARNING")  # "CRITICAL", "WARNING", "INFO"
    title = Column(String, nullable=False)
    reason = Column(Text, nullable=False)
    affected_entity = Column(String, nullable=False)
    recommended_action = Column(String, nullable=False)
    status = Column(String, nullable=False, default="open")  # "open", "resolved"
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
    forecast_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    horizon = Column(Integer, nullable=False, default=30)  # 7, 30, 90 days
    horizon_days = Column(Integer, nullable=True, default=30)
    current_velocity = Column(Float, nullable=False, default=1.0)  # units / day
    predicted_quantity = Column(Float, nullable=False, default=0.0)
    projected_demand = Column(Float, nullable=True)
    lower_bound = Column(Float, nullable=False, default=0.0)
    upper_bound = Column(Float, nullable=False, default=0.0)
    confidence_lower = Column(Float, nullable=True)
    confidence_upper = Column(Float, nullable=True)
    trend_direction = Column(String, nullable=False, default="stable")  # "increasing", "stable", "decreasing"
    growth_rate = Column(Float, nullable=False, default=0.0)
    model_name = Column(String, nullable=False, default="moving_average_baseline")
    model_version = Column(String, nullable=False, default="1.0.0")
    confidence = Column(Float, nullable=True, default=0.85)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    product = relationship("Product")


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True, default=1)
    document_type = Column(String, nullable=False, default="policy")  # "contract", "policy", "sop", "manual", "certificate", "invoice"
    source = Column(String, nullable=True)  # filename or upload origin
    file_path = Column(String, nullable=False)
    mime_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=True, default=0)
    version = Column(String, nullable=False, default="1.0")
    status = Column(String, nullable=False, default="UPLOADED")  # "UPLOADED", "PROCESSING", "EXTRACTING", "CHUNKING", "EMBEDDING", "INDEXED", "FAILED"
    error_message = Column(Text, nullable=True)
    uploaded_by = Column(String, nullable=True)
    chunk_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("knowledge_documents.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    metadata_json = Column(JSON, nullable=True)  # page, section, supplier_id, product_id, document_type
    embedding = Column(JSON, nullable=True)  # Vector embedding stored as float list for universal compatibility
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    document = relationship("KnowledgeDocument", back_populates="chunks")


class AIJob(Base):
    __tablename__ = "ai_jobs"

    id = Column(Integer, primary_key=True, index=True)
    job_type = Column(String, nullable=False)  # "document_ingest", "forecast_training", "batch_risk", "reindex"
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True, default=1)
    status = Column(String, nullable=False, default="QUEUED")  # "QUEUED", "RUNNING", "COMPLETED", "FAILED"
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    error = Column(Text, nullable=True)
    result = Column(JSON, nullable=True)
    created_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(String, primary_key=True, index=True)  # UUID or custom ID
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True, default=1)
    title = Column(String, nullable=False, default="Supply Chain Intelligence Chat")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    messages = relationship("AIMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="AIMessage.created_at")


class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String, ForeignKey("ai_conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=False)  # "user", "assistant", "system", "tool"
    content = Column(Text, nullable=False)
    metadata_json = Column(JSON, nullable=True)  # sources, tool_results, agent, confidence
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    conversation = relationship("AIConversation", back_populates="messages")


class AIAuditLog(Base):
    __tablename__ = "ai_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True, default=1)
    agent = Column(String, nullable=False)
    tool = Column(String, nullable=True)
    action = Column(String, nullable=False)
    entity = Column(String, nullable=True)
    result = Column(JSON, nullable=True)
    model = Column(String, nullable=True)
    model_version = Column(String, nullable=True)
    prompt_version = Column(String, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)


class ModelRegistry(Base):
    __tablename__ = "model_registry"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, nullable=False)
    model_type = Column(String, nullable=False)  # "forecasting", "anomaly_detection", "embeddings", "llm"
    version = Column(String, nullable=False)
    training_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    metrics = Column(JSON, nullable=True)  # MAE, RMSE, MAPE, accuracy, R2
    status = Column(String, nullable=False, default="active")  # "active", "candidate", "deprecated"
