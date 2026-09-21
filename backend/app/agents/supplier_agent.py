from typing import Dict, Any, Optional, Union
from sqlalchemy.orm import Session

from app.agents.specialized.supplier_agent import SupplierAgent
from app.agents.base import AgentContext
from app.services.supplier_service import supplier_service
from app.models.product import Product

def evaluate_suppliers_for_product(db: Session, product_name_or_id: Union[int, str], organization_id: int = 1) -> Dict[str, Any]:
    """
    Evaluates suppliers for a given product by id or name, returning formatted rankings and recommendation.
    """
    prod = None
    if isinstance(product_name_or_id, int) or (isinstance(product_name_or_id, str) and product_name_or_id.isdigit()):
        p_id = int(product_name_or_id)
        prod = db.query(Product).filter(Product.id == p_id).first()
    else:
        prod = db.query(Product).filter(Product.name.ilike(f"%{str(product_name_or_id).strip()}%")).first()

    if not prod:
        return {
            "product_name": str(product_name_or_id),
            "best_supplier": None,
            "recommended_supplier": None,
            "all_suppliers": [],
            "recommendation_reason": f"No product found matching '{product_name_or_id}'.",
            "score": 0.0,
            "confidence": 0.0
        }

    org_id = prod.organization_id or organization_id
    try:
        eval_data = supplier_service.evaluate_suppliers_for_product(db, organization_id=org_id, product_id=prod.id)
        rec = eval_data.get("recommended_supplier") or {}
        best_supplier = {
            "id": rec.get("supplier_id"),
            "name": rec.get("supplier_name"),
            "price": rec.get("unit_cost", 0.0),
            "quality_score": rec.get("quality_score", 0.0),
            "delivery_days": rec.get("lead_time_days", 0),
            "reliability_score": rec.get("reliability_score", 0.0),
            "price_score": rec.get("price_score", 0.0),
            "final_score": rec.get("overall_score", 0.0),
            "explanation": f"Optimal vendor based on balanced score ({rec.get('overall_score', 0)}/100)."
        } if rec else None

        return {
            "product_name": prod.name,
            "best_supplier": best_supplier,
            "recommended_supplier": best_supplier,
            "all_suppliers": eval_data.get("all_evaluated", []),
            "recommendation_reason": f"Evaluated {eval_data.get('suppliers_evaluated', 0)} vendors for {prod.name}.",
            "score": rec.get("overall_score", 0.0) if rec else 0.0,
            "confidence": 0.94 if rec else 0.0
        }
    except Exception as e:
        return {
            "product_name": prod.name,
            "best_supplier": None,
            "recommended_supplier": None,
            "all_suppliers": [],
            "recommendation_reason": f"Supplier evaluation encountered: {str(e)}",
            "score": 0.0,
            "confidence": 0.0
        }

__all__ = ["SupplierAgent", "evaluate_suppliers_for_product"]
