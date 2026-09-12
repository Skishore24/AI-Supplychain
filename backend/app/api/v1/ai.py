from datetime import datetime, timezone
from typing import Optional, List, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.api.deps import get_db, get_current_user, require_admin_or_manager
from app.core.config import settings
from app.models.user import User
from app.models.product import Product
from app.models.ai import (
    AIRecommendation,
    AIJob,
    AIConversation,
    AIMessage,
    AIAuditLog,
    InventoryAlert,
    SupplierEvaluation
)
from app.ai.llm.ollama_client import OllamaClient
from app.ai.llm.model_router import ModelRouter
from app.ai.orchestration.orchestrator import supply_chain_orchestrator
from app.agents.registry import agent_registry
from app.agents.executor import agent_executor
from app.agents.base import AgentContext
from app.services.inventory_service import inventory_service
from app.services.supplier_service import supplier_service
from app.services.forecast_service import forecast_service
from app.services.risk_service import risk_service
from app.services.analytics_service import analytics_service

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
    return supply_chain_orchestrator.process_chat(
        db=db,
        message=req.message,
        conversation_id=req.conversation_id,
        user=user,
        organization_id=user.organization_id or 1
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
    return {"agents": agent_registry.list_agents()}

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
    agent = agent_registry.get(agent_name)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Specialized agent '{agent_name}' not found.")

    context = AgentContext(
        organization_id=admin.organization_id or 1,
        user_id=admin.id,
        user_email=admin.email,
        user_role=admin.role
    )
    result = agent_executor.execute(agent, db, context, **payload)
    return result.model_dump()

# ==========================================
# 4. RECOMMENDATIONS & HUMAN-IN-THE-LOOP
# ==========================================

@router.get("/ai/recommendations")
@router.get("/v1/ai/recommendations")
def list_ai_recommendations(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    q = db.query(AIRecommendation).filter(AIRecommendation.organization_id == (admin.organization_id or 1))
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
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in recs
        ]
    }

@router.post("/ai/recommendations/{rec_id}/approve")
@router.post("/v1/ai/recommendations/{rec_id}/approve")
def approve_recommendation(
    rec_id: int,
    req: Optional[RecommendationReviewRequest] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    rec = db.query(AIRecommendation).filter(
        AIRecommendation.id == rec_id,
        AIRecommendation.organization_id == (admin.organization_id or 1)
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found.")

    rec.status = "APPROVED"
    rec.reviewed_by = admin.email
    rec.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    return {"success": True, "message": f"Recommendation #{rec_id} approved.", "status": rec.status}

@router.post("/ai/recommendations/{rec_id}/reject")
@router.post("/v1/ai/recommendations/{rec_id}/reject")
def reject_recommendation(
    rec_id: int,
    req: Optional[RecommendationReviewRequest] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    rec = db.query(AIRecommendation).filter(
        AIRecommendation.id == rec_id,
        AIRecommendation.organization_id == (admin.organization_id or 1)
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found.")

    rec.status = "REJECTED"
    rec.reviewed_by = admin.email
    rec.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    return {"success": True, "message": f"Recommendation #{rec_id} rejected.", "status": rec.status}

# ==========================================
# 5. ASYNC JOBS & AUDIT
# ==========================================

@router.get("/ai/audit-logs")
@router.get("/v1/ai/audit-logs")
def list_ai_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    logs = db.query(AIAuditLog).filter(
        AIAuditLog.organization_id == (admin.organization_id or 1)
    ).order_by(AIAuditLog.timestamp.desc()).limit(limit).all()

    return {
        "audit_logs": [
            {
                "id": l.id,
                "user_email": l.user_email,
                "agent": l.agent,
                "action": l.action,
                "result": l.result,
                "timestamp": l.timestamp.isoformat() if l.timestamp else None
            }
            for l in logs
        ]
    }

@router.get("/ai/jobs")
@router.get("/v1/ai/jobs")
def list_ai_jobs(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    jobs = db.query(AIJob).filter(
        AIJob.organization_id == (admin.organization_id or 1)
    ).order_by(AIJob.created_at.desc()).limit(20).all()

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
# 6. LEGACY & DOMAIN COMPATIBILITY ROUTES
# ==========================================

@router.get("/ai/summary")
def get_ai_summary(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return analytics_service.get_overview(db, organization_id=user.organization_id or 1)

@router.get("/ai/suppliers/evaluate/{product_name_or_id}")
def evaluate_supplier(
    product_name_or_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    org_id = user.organization_id or 1
    # Try ID first
    if product_name_or_id.isdigit():
        p_id = int(product_name_or_id)
    else:
        prod = db.query(Product).filter(
            Product.name.ilike(f"%{product_name_or_id}%"),
            Product.organization_id == org_id
        ).first()
        if not prod:
            raise HTTPException(status_code=404, detail="Product not found.")
        p_id = prod.id

    return supplier_service.evaluate_suppliers_for_product(db, organization_id=org_id, product_id=p_id)

@router.get("/ai/inventory/restock-intelligence")
def get_inventory_restock_intelligence(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return inventory_service.get_inventory_status(db, organization_id=user.organization_id or 1)

@router.get("/ai/demand/forecast")
def get_demand_forecast(
    product_id: Optional[int] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    org_id = user.organization_id or 1
    if product_id:
        return forecast_service.run_forecast(db, organization_id=org_id, product_id=product_id)
    return forecast_service.list_forecasts(db, organization_id=org_id)

@router.get("/ai/risk/overview")
def get_risk_overview(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return risk_service.generate_risk_radar(db, organization_id=user.organization_id or 1)
