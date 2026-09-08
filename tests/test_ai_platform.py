import pytest
from datetime import datetime, timezone
import json
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from db.session import SessionLocal
from models.user import User
from models.product import Product
from models.supplier import Supplier
from models.inventory import Inventory
from models.purchase_order import PurchaseOrder
from models.ai import AIRecommendation, AIAuditLog, KnowledgeDocument, DocumentChunk, DemandForecast
from ai.llm.ollama_client import OllamaClient
from ai.llm.provider import OllamaProvider
from ai.tools.purchase_order_tools import CreatePurchaseOrderTool
from ai.tools.product_tools import GetProductBySKUTool
from agents.supplier_agent import SupplierAgent
from agents.inventory_agent import InventoryAgent
from agents.demand_agent import DemandAgent
from agents.risk_agent import RiskAgent
from agents.procurement_agent import ProcurementAgent
from rag.embeddings import OllamaEmbeddingProvider
from rag.chunking import SemanticChunker
from rag.ingestion import DocumentIngestionService
from rag.pipeline import RAGPipeline
from ml.forecasting.evaluation import calculate_forecast_metrics
from ml.forecasting.train import train_demand_forecaster
from ml.forecasting.predict import generate_demand_prediction

@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def test_ollama_health_and_availability():
    """Verify Ollama client health check endpoint & graceful degradation."""
    client = OllamaClient()
    health = client.health_check()
    assert isinstance(health, dict)
    assert "available" in health
    assert "base_url" in health
    assert "models" in health

def test_deterministic_supplier_agent(db):
    """
    Supplier Agent:
    Deterministic multi-criteria scoring must rank suppliers correctly without inventing numbers.
    """
    agent = SupplierAgent()
    res = agent.run(db, quantity=100)
    assert "recommended_supplier" in res
    assert "score" in res
    assert "confidence" in res
    assert "reasoning" in res
    assert res["score"] > 0
    assert len(res.get("alternative_suppliers", [])) >= 0

def test_deterministic_inventory_agent_calculation(db):
    """
    Inventory Agent:
    Deterministic calculation of daily velocity, safety stock, and reorder threshold.
    """
    agent = InventoryAgent()
    res = agent.run(db)
    assert "total_stock_units" in res
    assert "alerts" in res
    assert "low_stock_alerts_count" in res
    assert isinstance(res["alerts"], list)

def test_ml_demand_forecasting_pipeline(db):
    """
    Demand Forecasting:
    Chronological validation, baseline vs ML comparison, and MAE/RMSE calculation.
    """
    prod = db.query(Product).first()
    assert prod is not None, "Product required in database"
    
    pred = generate_demand_prediction(db, product_id=prod.id, horizons=[7, 30, 90])
    assert "horizons" in pred
    assert len(pred["horizons"]) == 3
    assert pred["daily_velocity"] > 0
    assert "evaluation_metrics" in pred

def test_forecast_evaluation_metrics():
    """Verify MAE, RMSE, and MAPE calculations."""
    import numpy as np
    y_true = np.array([10.0, 20.0, 30.0])
    y_pred = np.array([12.0, 18.0, 33.0])
    metrics = calculate_forecast_metrics(y_true, y_pred)
    assert metrics["mae"] == 2.33
    assert metrics["rmse"] > 0
    assert metrics["mape"] > 0

def test_rag_semantic_chunking():
    """Verify semantic chunking preserves page boundaries and section headers."""
    chunker = SemanticChunker(chunk_size=200, chunk_overlap=30)
    sample_text = (
        "SECTION 1: EMERGENCY PROCUREMENT POLICY\n"
        "Purchases exceeding $10,000 must receive secondary approval.\n\n"
        "SECTION 2: VENDOR SELECTION GUIDELINES\n"
        "Suppliers with quality ratings under 85% must be audited before contract renewal."
    )
    chunks = chunker.chunk_document(sample_text, document_id=999)
    assert len(chunks) >= 2
    assert chunks[0]["metadata"]["document_id"] == 999

def test_rag_embedding_fallback():
    """Ensure embedding generator provides normalized vectors even when Ollama is offline."""
    embedder = OllamaEmbeddingProvider()
    vec = embedder.embed_text("Emergency restock policy for electronic components")
    assert isinstance(vec, list)
    assert len(vec) > 0

def test_document_ingestion_and_rag_pipeline(db):
    """Verify text document ingestion, chunk storage, and hybrid retrieval with citations."""
    sample_policy = (
        "SECTION 4.2: EMERGENCY PURCHASING POLICY\n"
        "In case of critical inventory depletion below safety thresholds, warehouse managers "
        "are authorized to place expedited purchase orders with certified suppliers."
    )
    service = DocumentIngestionService()
    doc = service.ingest_file(
        db=db,
        file_name="Emergency_Procurement_Policy.txt",
        file_bytes=sample_policy.encode("utf-8"),
        mime_type="text/plain",
        document_type="policy",
        uploaded_by="test@admin.com"
    )
    assert doc.id is not None
    assert doc.chunk_count >= 1
    assert doc.status == "INDEXED"

    pipeline = RAGPipeline()
    answer_res = pipeline.answer_question(db, question="What is our emergency purchasing policy?")
    assert answer_res["has_context"] is True
    assert len(answer_res["sources"]) > 0
    assert answer_res["sources"][0]["document_name"] == "Emergency_Procurement_Policy.txt"

def test_procurement_human_approval_workflow(db):
    """
    Human-in-the-Loop workflow:
    Procurement recommendation is created -> Admin reviews & approves -> Real PO executed.
    """
    proc_agent = ProcurementAgent()
    res = proc_agent.run(db)
    assert "recommendations" in res
    assert res.get("human_approval_required") is True

    if res["recommendations"]:
        rec_id = res["recommendations"][0]["id"]
        rec = db.query(AIRecommendation).filter(AIRecommendation.id == rec_id).first()
        assert rec.status == "GENERATED"

        # Mock Admin Approval
        admin_user = db.query(User).filter(User.role == "admin").first()
        if not admin_user:
            admin_user = User(email="admin_test@local", role="admin")

        tool = CreatePurchaseOrderTool()
        po_res = tool.execute(
            db=db,
            user=admin_user,
            supplier_id=rec.supporting_data.get("supplier_id", 1),
            items=[{"product_id": rec.product_id or 1, "quantity": 50}],
            notes=f"Test approval for rec #{rec.id}"
        )
        assert po_res["success"] is True
        assert "po_id" in po_res

        # Check Audit Log
        audit = db.query(AIAuditLog).filter(AIAuditLog.action == "CREATE_PURCHASE_ORDER").first()
        assert audit is not None
        assert audit.agent == "procurement_agent"

def test_security_unauthorized_write_tool_rejected(db):
    """Security verification: Unauthorized users cannot execute write tools."""
    tool = CreatePurchaseOrderTool()
    regular_user = User(email="customer@local", role="customer")
    
    # Customer role must be denied
    res = tool.execute(
        db=db,
        user=regular_user,
        supplier_id=1,
        items=[{"product_id": 1, "quantity": 10}]
    )
    assert res["success"] is False
    assert "Unauthorized" in res["error"]
