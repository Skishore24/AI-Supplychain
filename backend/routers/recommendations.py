from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from services.supplier_service import (
    recommend_supplier,
    get_inventory_intelligence,
    get_supply_chain_summary
)


router = APIRouter(
    prefix="/recommendations",
    tags=["Supply Chain AI Agents"]
)


@router.get("/summary")
def get_ai_summary(
    db: Session = Depends(get_db)
):
    """
    Returns Master Multi-Agent overview KPI stats & system health.
    """
    return get_supply_chain_summary(db)


@router.get("/inventory-alerts")
def get_ai_inventory_alerts(
    db: Session = Depends(get_db)
):
    """
    Returns Inventory Optimization & Restock Risk Agent recommendations.
    """
    return get_inventory_intelligence(db)


@router.get("/supplier/{product_name}")
def get_supplier_recommendation(
    product_name: str,
    db: Session = Depends(get_db)
):
    """
    Returns AI Supplier Optimization Agent recommendation for a specific product.
    """
    recommendations = recommend_supplier(
        db=db,
        product_name=product_name
    )

    if not recommendations:
        raise HTTPException(
            status_code=404,
            detail=f"No suppliers found for '{product_name}'"
        )

    best_supplier = recommendations[0]

    return {
        "best_supplier": best_supplier,
        "all_suppliers": recommendations,
        "recommendation_reason": (
            f"'{best_supplier['name']}' is ranked #1 with an AI score of {best_supplier['overall_score']}/100. "
            f"It offers optimal balance: ${best_supplier['price']} price, {best_supplier['quality_score']}% quality rating, "
            f"and {best_supplier['delivery_days']}-day fulfillment time."
        )
    }