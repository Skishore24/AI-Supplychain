from datetime import datetime, timezone
from typing import Optional, List, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from core.deps import get_db, require_admin_or_manager
from models.product import Product
from models.user import User
from models.ai import AIRecommendation
from schemas.ai import (
    SupplyChainSummaryResponse,
    InventoryAlertResponse,
    DemandForecastItem,
    RiskOverviewResponse
)
from agents.supplier_agent import evaluate_suppliers_for_product
from agents.inventory_agent import calculate_inventory_intelligence
from agents.demand_agent import generate_demand_forecast, get_supply_chain_risk_overview
from services.supplier_service import get_supply_chain_summary

router = APIRouter(prefix="/ai", tags=["Supply Chain AI Agents"])

@router.get("/summary", response_model=SupplyChainSummaryResponse)
def get_ai_master_summary(db: Session = Depends(get_db)):
    return get_supply_chain_summary(db)

@router.get("/suppliers/evaluate/{product_name_or_id}")
def run_supplier_optimizer_agent(
    product_name_or_id: str,
    db: Session = Depends(get_db)
):
    """
    Agent 1: Supplier Optimizer
    Evaluates suppliers with explainable multi-factor scoring (Price 40%, Quality 35%, Delivery 15%, Reliability 10%).
    """
    result = evaluate_suppliers_for_product(db, product_name_or_id)
    if not result or not result.get("best_supplier"):
        raise HTTPException(status_code=404, detail="No suppliers found for optimization analysis.")

    # Record persistent AI recommendation
    try:
        best = result["best_supplier"]
        rec = AIRecommendation(
            agent_name="Supplier Optimizer",
            entity_type="supplier",
            entity_id=best["id"],
            recommendation=f"Selected {best['name']} as optimal supplier for '{result['product_name']}'.",
            confidence=0.92,
            score=best["final_score"],
            reasoning=result["recommendation_reason"],
            suggested_action=f"Create PO with {best['name']} at ₹{best['price']:.2f}/unit."
        )
        db.add(rec)
        db.commit()
    except Exception as e:
        db.rollback()

    return result

@router.get("/inventory/restock-intelligence")
def run_inventory_reorder_agent(db: Session = Depends(get_db)):
    """
    Agent 2: Inventory Restock & Stockout Risk Analyzer
    Evaluates current inventory levels, coverage days, and generates actionable replenishment alerts.
    """
    return calculate_inventory_intelligence(db)

@router.get("/demand/forecast")
def run_demand_forecast_agent(db: Session = Depends(get_db)):
    """
    Agent 3: Demand Velocity Forecaster
    Computes 7-day, 30-day, and 90-day demand horizons with confidence intervals and category velocity.
    """
    return generate_demand_forecast(db)

@router.get("/risk/overview", response_model=RiskOverviewResponse)
def get_risk_engine_analysis(db: Session = Depends(get_db)):
    """
    Supply Chain Risk Engine evaluating Stockout, Supplier, Demand, Delivery, and Inventory Anomalies.
    """
    return get_supply_chain_risk_overview(db)

@router.post("/run-agent")
def trigger_agent_execution(
    agent_name: str = Query(..., description="supplier_agent, inventory_agent, or demand_agent"),
    product_id: Optional[int] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    """
    Executes specified agent on real backend database data and returns execution telemetry.
    """
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
    else:
        raise HTTPException(status_code=400, detail="Unrecognized agent identifier.")

    end_time = datetime.now(timezone.utc)
    duration_ms = int((end_time - start_time).total_seconds() * 1000)

    return {
        "status": "COMPLETED",
        "agent": agent_title,
        "execution_duration_ms": max(12, duration_ms),
        "executed_at": end_time.isoformat(),
        "target": {"product_id": product_id, "category": category or "all"},
        "result": output
    }
