import json
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from models.supplier import Supplier
from models.product import Product
from models.ai import AIRecommendation, SupplierEvaluation

def evaluate_suppliers_for_product(db: Session, product_name_or_id: Any) -> Dict[str, Any]:
    """
    Agent 1: Multi-Criteria Supplier Optimizer
    Evaluates suppliers with explainable weighted scoring:
    - Price Score: 40% (relative to min/max market quotes)
    - Quality Score: 35% (vendor quality certification & defect control)
    - Delivery Speed: 15% (turnaround days)
    - Historical Reliability: 10% (on-time delivery completion rate)
    """
    # Find matching product
    product = None
    if isinstance(product_name_or_id, int) or (isinstance(product_name_or_id, str) and product_name_or_id.isdigit()):
        product = db.query(Product).filter(Product.id == int(product_name_or_id)).first()
    else:
        product = db.query(Product).filter(Product.name.ilike(f"%{product_name_or_id}%")).first()

    query_str = product.name if product else str(product_name_or_id)

    suppliers = db.query(Supplier).filter(
        (Supplier.product_name.ilike(f"%{query_str}%")) |
        (Supplier.category.ilike(f"%{product.category}%") if product else False) |
        (Supplier.name.ilike(f"%{query_str}%"))
    ).all()

    # Fallback to all active suppliers if product-specific match is narrow
    if not suppliers:
        suppliers = db.query(Supplier).filter(Supplier.status == "active").all()

    if not suppliers:
        return {
            "product_name": query_str,
            "best_supplier": None,
            "all_suppliers": [],
            "recommendation_reason": "No certified suppliers currently registered in the database."
        }

    prices = [s.price for s in suppliers if s.price > 0] or [1.0]
    min_price = min(prices)
    max_price = max(prices)

    ranked_list = []
    for s in suppliers:
        # Price Score (40%)
        if max_price == min_price:
            price_score = 100.0
        else:
            price_score = max(0.0, ((max_price - s.price) / (max_price - min_price)) * 100.0)

        quality_score = float(s.quality_score)
        delivery_score = max(0.0, 100.0 - (s.delivery_days * 10.0))
        reliability_score = float(s.reliability_score)

        final_score = round(
            (price_score * 0.40) +
            (quality_score * 0.35) +
            (delivery_score * 0.15) +
            (reliability_score * 0.10),
            2
        )

        ranked_list.append({
            "id": s.id,
            "name": s.name,
            "price": s.price,
            "quality_score": quality_score,
            "delivery_days": s.delivery_days,
            "reliability_score": reliability_score,
            "price_score": round(price_score, 1),
            "final_score": final_score,
            "email": s.email or "procurement@vendor.com",
            "phone": s.phone or "+1 (555) 019-2831",
            "status": s.status
        })

    # Sort descending by final score
    ranked_list.sort(key=lambda x: x["final_score"], reverse=True)

    for idx, item in enumerate(ranked_list):
        item["rank"] = idx + 1
        item["is_recommended"] = idx == 0

    best = ranked_list[0]
    reasoning_points = [
        f"Ranked #1 overall with an AI optimization score of {best['final_score']}/100.",
        f"Unit cost is ₹{best['price']:.2f} (Price efficiency score: {best['price_score']}/100).",
        f"Verified quality rating of {best['quality_score']}% with {best['delivery_days']}-day turnaround.",
        f"Historical fulfillment reliability indexed at {best['reliability_score']}%."
    ]

    best["explanation"] = " ".join(reasoning_points)

    return {
        "product_name": query_str,
        "best_supplier": best,
        "all_suppliers": ranked_list,
        "recommendation_reason": best["explanation"],
        "reasoning_points": reasoning_points
    }
