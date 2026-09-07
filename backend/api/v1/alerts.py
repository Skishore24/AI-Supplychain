from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.deps import get_db
from agents.inventory_agent import calculate_inventory_intelligence
from agents.demand_agent import get_supply_chain_risk_overview

router = APIRouter(prefix="/alerts", tags=["Risk & Operational Alerts"])

@router.get("/needs-attention")
def get_needs_attention_alerts(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Section 8: "Needs Attention" area:
    Automatically detects:
    - low-stock products & stockout risks
    - delayed suppliers & pending POs
    - demand spikes
    Each alert includes: Severity, Title, Reason, Affected entity, Recommended action, CTA.
    """
    inv_intel = calculate_inventory_intelligence(db)
    risk_overview = get_supply_chain_risk_overview(db)

    return {
        "count": len(inv_intel.get("alerts", [])),
        "critical_count": inv_intel.get("critical_out_of_stock_count", 0),
        "warning_count": inv_intel.get("warning_count", 0),
        "alerts": inv_intel.get("alerts", []),
        "risks": risk_overview.get("risks", []),
        "overall_risk_score": risk_overview.get("overall_risk_score", 15.0),
        "risk_level": risk_overview.get("risk_level", "OPTIMAL")
    }
