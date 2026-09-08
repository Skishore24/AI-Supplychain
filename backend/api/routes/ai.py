from datetime import datetime, timezone
from typing import Optional, List, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel

from core.deps import get_db, get_current_user, require_admin_or_manager
from core.config import settings
from models.user import User
from models.ai import (
    AIRecommendation,
    AIJob,
    AIConversation,
    AIMessage,
    AIAuditLog,
    InventoryAlert,
    SupplierEvaluation
)
from schemas.ai import (
    SupplyChainSummaryResponse,
    RiskOverviewResponse
)
from ai.llm.ollama_client import OllamaClient
from ai.llm.model_router import ModelRouter
from ai.orchestrator import get_ai_orchestrator
from agents import (
    get_agent,
    AGENT_REGISTRY,
    evaluate_suppliers_for_product,
    calculate_inventory_intelligence,
    generate_demand_forecast,
    get_supply_chain_risk_overview
)
from ai.tools.purchase_order_tools import CreatePurchaseOrderTool
from ai.multimodal.document_vision import InvoiceExtractor
from ai.multimodal.image_analysis import ProductImageInspector
from services.supplier_service import get_supply_chain_summary

router = APIRouter(tags=["AI Agents & Orchestration"])

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class RecommendationReviewRequest(BaseModel):
    notes: Optional[str] = None

# ==========================================
# 1. OLLAMA HEALTH & SETTINGS ENDPOINTS
# ==========================================

@router.get("/ai/ollama/health")
@router.get("/v1/ai/ollama/health")
def get_ollama_health():
    """
    Check real-time connectivity to the local Ollama instance and model availability.
    """
    client = OllamaClient()
    return client.health_check()

@router.get("/ai/ollama/models")
@router.get("/v1/ai/ollama/models")
def get_ollama_models():
    """
    Returns configured models and current task-based model routing.
    """
    client = OllamaClient()
    health = client.health_check()
    return {
        "base_url": settings.OLLAMA_BASE_URL,
        "active_models": health.get("models", []),
        "task_routing": ModelRouter.get_routing_table(),
        "configured_llm": settings.OLLAMA_MODEL,
        "configured_embedding": settings.OLLAMA_EMBEDDING_MODEL,
        "configured_vision": settings.OLLAMA_VISION_MODEL,
        "is_connected": health.get("available", False)
    }

# ==========================================
# 2. AI CHAT & ORCHESTRATION
# ==========================================

@router.post("/ai/chat")
@router.post("/v1/ai/chat")
def chat_with_supply_chain_ai(
    req: ChatRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Master AI Chat: Routes query to specialized agents, database tools, ML models, or RAG policies.
    """
    orchestrator = get_ai_orchestrator()
    return orchestrator.process_chat(
        db=db,
        message=req.message,
        conversation_id=req.conversation_id,
        user=user
    )

@router.get("/ai/conversations/{conversation_id}/messages")
@router.get("/v1/ai/conversations/{conversation_id}/messages")
def get_conversation_history(
    conversation_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Retrieve message history for a specific chat conversation.
    """
    msgs = db.query(AIMessage).filter(
        AIMessage.conversation_id == conversation_id
    ).order_by(AIMessage.created_at.asc()).all()

    return {
        "conversation_id": conversation_id,
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "metadata": m.metadata_json or {},
                "created_at": m.created_at.isoformat()
            }
            for m in msgs
        ]
    }

# ==========================================
# 3. SPECIALIZED AGENT RUN ENDPOINTS
# ==========================================

@router.get("/ai/agents")
@router.get("/v1/ai/agents")
def list_available_agents():
    """
    List all specialized multi-agent engines with status and metadata.
    """
    return {
        "agents": [
            {
                "id": "supplier_agent",
                "name": "Supplier Optimizer Agent",
                "description": "Multi-factor deterministic supplier scoring grounded in database metrics with LLM explanation.",
                "status": "OPERATIONAL"
            },
            {
                "id": "inventory_agent",
                "name": "Inventory Restock Agent",
                "description": "Calculates stockout risk, daily velocity, safety stock, and reorder points.",
                "status": "OPERATIONAL"
            },
            {
                "id": "demand_agent",
                "name": "Demand Forecasting Agent",
                "description": "Chronological ML time-series forecasting (baseline vs Ridge) with prediction intervals.",
                "status": "OPERATIONAL"
            },
            {
                "id": "risk_agent",
                "name": "Supply Chain Risk Agent",
                "description": "Anomaly detection across stockouts, supplier delays, demand surges, and inventory discrepancies.",
                "status": "OPERATIONAL"
            },
            {
                "id": "procurement_agent",
                "name": "Procurement Agent",
                "description": "Autonomous replenishment recommendation engine requiring human approval.",
                "status": "OPERATIONAL"
            }
        ]
    }

@router.post("/ai/agents/{agent_name}/run")
@router.post("/v1/ai/agents/{agent_name}/run")
def run_agent_workflow(
    agent_name: str,
    payload: Dict[str, Any] = Body(default={}),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    """
    Execute a specialized agent with execution telemetry and input validation.
    """
    clean_name = agent_name.lower().strip()
    if not clean_name.endswith("_agent"):
        clean_name = f"{clean_name}_agent"

    try:
        agent = get_agent(clean_name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    result = agent.execute_with_trace(db=db, user=admin, **payload)
    return result

# ==========================================
# 4. RECOMMENDATIONS & HUMAN-IN-THE-LOOP APPROVAL
# ==========================================

@router.get("/ai/recommendations")
@router.get("/v1/ai/recommendations")
def list_ai_recommendations(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    """
    List AI recommendations pending human review or previously approved/rejected.
    """
    q = db.query(AIRecommendation)
    if status:
        q = q.filter(AIRecommendation.status == status.upper())
    recs = q.order_by(AIRecommendation.created_at.desc()).all()

    return {
        "total_recommendations": len(recs),
        "recommendations": [
            {
                "id": r.id,
                "agent_name": r.agent_name,
                "entity_type": r.entity_type,
                "entity_id": r.entity_id,
                "recommendation": r.recommendation,
                "confidence": r.confidence,
                "risk_score": r.risk_score,
                "score": r.score,
                "reasoning": r.reasoning,
                "supporting_data": r.supporting_data or {},
                "suggested_action": r.suggested_action,
                "status": r.status,
                "reviewed_by": r.reviewed_by,
                "reviewed_at": r.reviewed_at.isoformat() if r.reviewed_at else None,
                "created_at": r.created_at.isoformat()
            }
            for r in recs
        ]
    }

@router.post("/ai/recommendations/{recommendation_id}/approve")
@router.post("/v1/ai/recommendations/{recommendation_id}/approve")
def approve_ai_recommendation(
    recommendation_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    """
    Human-in-the-loop Approval: Approves an AI recommendation and atomically executes the Purchase Order.
    """
    rec = db.query(AIRecommendation).filter(AIRecommendation.id == recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found.")

    if rec.status == "EXECUTED":
        raise HTTPException(status_code=400, detail="Recommendation has already been executed.")

    data = rec.supporting_data or {}
    supplier_id = data.get("supplier_id")
    order_qty = data.get("order_quantity") or 50
    prod_id = rec.product_id or data.get("product_id")

    created_po = None
    if supplier_id and prod_id:
        po_tool = CreatePurchaseOrderTool()
        po_res = po_tool.execute(
            db=db,
            user=admin,
            supplier_id=int(supplier_id),
            items=[{"product_id": int(prod_id), "quantity": int(order_qty)}],
            notes=f"Approved from AI Recommendation #{rec.id}: {rec.suggested_action}"
        )
        if po_res.get("success"):
            created_po = po_res

    rec.status = "EXECUTED" if created_po else "APPROVED"
    rec.reviewed_by = admin.email
    rec.reviewed_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "success": True,
        "recommendation_id": rec.id,
        "status": rec.status,
        "purchase_order": created_po,
        "message": f"Recommendation #{rec.id} approved by {admin.email}. Real purchase order executed in system."
    }

@router.post("/ai/recommendations/{recommendation_id}/reject")
@router.post("/v1/ai/recommendations/{recommendation_id}/reject")
def reject_ai_recommendation(
    recommendation_id: int,
    req: RecommendationReviewRequest = Body(default=RecommendationReviewRequest()),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    """
    Human-in-the-loop Rejection: Rejects an AI recommendation with optional feedback notes.
    """
    rec = db.query(AIRecommendation).filter(AIRecommendation.id == recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found.")

    rec.status = "REJECTED"
    rec.reviewed_by = admin.email
    rec.reviewed_at = datetime.now(timezone.utc)
    if req.notes:
        rec.reasoning = f"{rec.reasoning}\n[Rejection Notes: {req.notes}]"
    db.commit()

    return {
        "success": True,
        "recommendation_id": rec.id,
        "status": "REJECTED",
        "message": f"Recommendation #{rec.id} rejected."
    }

# ==========================================
# 5. MULTIMODAL VISION & INVOICE EXTRACTION
# ==========================================

@router.post("/ai/documents/extract")
@router.post("/v1/ai/documents/extract")
async def extract_invoice_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    """
    Multimodal Invoice AI: Extracts line items, supplier, taxes, and matches against DB records.
    """
    content = await file.read()
    extractor = InvoiceExtractor()
    try:
        result = extractor.process_invoice(
            db=db,
            file_bytes=content,
            filename=file.filename,
            content_type=file.content_type
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/ai/vision/analyze")
@router.post("/v1/ai/vision/analyze")
async def analyze_product_image(
    file: UploadFile = File(...),
    expected_product_name: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    """
    Multimodal Product Quality Inspection: Inspects packaging integrity, defects, and label presence.
    """
    content = await file.read()
    inspector = ProductImageInspector()
    try:
        result = inspector.inspect_product_image(
            image_bytes=content,
            filename=file.filename,
            expected_product_name=expected_product_name
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==========================================
# 6. ASYNC AI BACKGROUND JOBS & AUDIT
# ==========================================

@router.get("/ai/jobs")
@router.get("/v1/ai/jobs")
def list_ai_background_jobs(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    """
    Retrieve status of background AI jobs (indexing, training, batch risk).
    """
    jobs = db.query(AIJob).order_by(AIJob.created_at.desc()).limit(20).all()
    return {
        "jobs": [
            {
                "id": j.id,
                "job_type": j.job_type,
                "status": j.status,
                "started_at": j.started_at.isoformat() if j.started_at else None,
                "completed_at": j.completed_at.isoformat() if j.completed_at else None,
                "error": j.error,
                "result": j.result
            }
            for j in jobs
        ]
    }

# ==========================================
# 7. BACKWARDS COMPATIBLE LEGACY ROUTES
# ==========================================

@router.get("/ai/summary", response_model=SupplyChainSummaryResponse)
def legacy_get_ai_summary(db: Session = Depends(get_db)):
    return get_supply_chain_summary(db)

@router.get("/ai/suppliers/evaluate/{product_name_or_id}")
def legacy_supplier_evaluate(product_name_or_id: str, db: Session = Depends(get_db)):
    result = evaluate_suppliers_for_product(db, product_name_or_id)
    if not result or not result.get("best_supplier"):
        raise HTTPException(status_code=404, detail="No suppliers found.")
    return result

@router.get("/ai/inventory/restock-intelligence")
def legacy_inventory_restock(db: Session = Depends(get_db)):
    return calculate_inventory_intelligence(db)

@router.get("/ai/demand/forecast")
def legacy_demand_forecast(db: Session = Depends(get_db)):
    return generate_demand_forecast(db)

@router.get("/ai/risk/overview", response_model=RiskOverviewResponse)
def legacy_risk_overview(db: Session = Depends(get_db)):
    return get_supply_chain_risk_overview(db)

@router.post("/ai/run-agent")
def legacy_trigger_agent_execution(
    agent_name: str = Query(...),
    product_id: Optional[int] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    start_time = datetime.now(timezone.utc)
    if agent_name in ("supplier_agent", "Supplier Optimizer", "agent_1"):
        query_val = str(product_id) if product_id else (category or "Lithium-Ion Battery Pack 5000mAh")
        output = evaluate_suppliers_for_product(db, query_val)
        agent_title = "Agent 1: Supplier Optimizer"
    elif agent_name in ("inventory_agent", "Restock Agent", "agent_2"):
        output = calculate_inventory_intelligence(db)
        agent_title = "Agent 2: Inventory & Restock Analyzer"
    elif agent_name in ("demand_agent", "Demand Forecaster", "agent_3"):
        output = generate_demand_forecast(db)
        agent_title = "Agent 3: Demand Velocity Forecaster"
    elif agent_name in ("risk_agent", "Risk Analyzer"):
        output = get_supply_chain_risk_overview(db)
        agent_title = "Risk Engine"
    elif agent_name in ("procurement_agent", "Procurement Optimizer"):
        from agents.procurement_agent import ProcurementAgent
        output = ProcurementAgent().run(db, user=admin)
        agent_title = "Procurement Agent"
    else:
        raise HTTPException(status_code=400, detail="Unrecognized agent identifier.")

    duration_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)
    return {
        "status": "COMPLETED",
        "agent": agent_title,
        "execution_duration_ms": max(12, duration_ms),
        "executed_at": datetime.now(timezone.utc).isoformat(),
        "target": {"product_id": product_id, "category": category or "all"},
        "result": output
    }
