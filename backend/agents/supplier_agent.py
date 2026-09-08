import json
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from models.supplier import Supplier
from models.product import Product
from models.ai import AIRecommendation, SupplierEvaluation
from agents.base_agent import BaseAgent
from ai.tools.product_tools import GetProductTool, GetProductBySKUTool
from ai.tools.supplier_tools import GetSupplierTool, GetSupplierPerformanceTool
from ai.llm.provider import get_llm_provider
from ai.llm.prompts import SUPPLIER_EXPLANATION_PROMPT, SYSTEM_PROMPT_SUPPLY_CHAIN_BASE

class SupplierAgentInput(BaseModel):
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    sku: Optional[str] = None
    quantity: int = Field(default=100, ge=1)
    price_weight: float = 0.40
    quality_weight: float = 0.30
    delivery_weight: float = 0.20
    reliability_weight: float = 0.10

class SupplierAgent(BaseAgent):
    name = "supplier_agent"
    description = "Evaluates, scores, and ranks suppliers using multi-factor deterministic scoring and grounds AI explanation in actual database metrics."
    input_schema = SupplierAgentInput

    def __init__(self):
        super().__init__()
        self.tools = [
            GetProductTool(),
            GetProductBySKUTool(),
            GetSupplierTool(),
            GetSupplierPerformanceTool()
        ]

    def run(self, db: Session, user: Optional[Any] = None, **kwargs) -> Dict[str, Any]:
        product_id = kwargs.get("product_id")
        product_name = kwargs.get("product_name")
        sku = kwargs.get("sku")
        quantity = kwargs.get("quantity", 100)

        price_w = kwargs.get("price_weight", 0.40)
        qual_w = kwargs.get("quality_weight", 0.30)
        deliv_w = kwargs.get("delivery_weight", 0.20)
        rel_w = kwargs.get("reliability_weight", 0.10)

        # 1. Resolve product
        product = None
        if product_id:
            product = db.query(Product).filter(Product.id == product_id).first()
        elif sku:
            product = db.query(Product).filter(Product.sku.ilike(f"%{sku.strip()}%")).first()
        elif product_name:
            product = db.query(Product).filter(Product.name.ilike(f"%{product_name.strip()}%")).first()

        query_str = product.name if product else (product_name or (f"SKU-{sku}" if sku else "General Product"))

        # 2. Retrieve candidate suppliers
        suppliers_query = db.query(Supplier)
        if product:
            matched = suppliers_query.filter(
                (Supplier.product_name.ilike(f"%{product.name}%")) |
                (Supplier.category.ilike(f"%{product.category}%")) |
                (Supplier.name.ilike(f"%{product.name}%"))
            ).all()
        else:
            matched = suppliers_query.filter(
                (Supplier.product_name.ilike(f"%{query_str}%")) |
                (Supplier.name.ilike(f"%{query_str}%"))
            ).all()

        if not matched:
            matched = db.query(Supplier).filter(Supplier.status == "active").all()

        if not matched:
            return {
                "product_id": product.id if product else None,
                "product_name": query_str,
                "recommended_supplier": None,
                "alternative_suppliers": [],
                "score": 0.0,
                "confidence": None,
                "expected_cost": 0.0,
                "expected_delivery": 0,
                "risk": "HIGH",
                "reasoning": "No active suppliers currently registered in the database for this product.",
                "supporting_data": {}
            }

        # 3. Deterministic scoring
        prices = [s.price for s in matched if s.price > 0] or [1.0]
        min_price = min(prices)
        max_price = max(prices)

        scored_suppliers = []
        for s in matched:
            if max_price == min_price:
                price_score = 100.0
            else:
                price_score = max(0.0, ((max_price - s.price) / (max_price - min_price)) * 100.0)

            quality_score = float(s.quality_score)
            delivery_score = max(0.0, 100.0 - (s.delivery_days * 8.0))
            reliability_score = float(s.reliability_score)

            final_score = round(
                (price_score * price_w) +
                (quality_score * qual_w) +
                (delivery_score * deliv_w) +
                (reliability_score * rel_w),
                2
            )

            scored_suppliers.append({
                "supplier_id": s.id,
                "supplier_name": s.name,
                "unit_price": float(s.price),
                "total_cost": round(float(s.price) * quantity, 2),
                "quality_score": quality_score,
                "delivery_days": s.delivery_days,
                "reliability_score": reliability_score,
                "price_score": round(price_score, 1),
                "final_score": final_score,
                "email": s.email or "procurement@vendor.com",
                "phone": s.phone or "N/A",
                "status": s.status
            })

        scored_suppliers.sort(key=lambda x: x["final_score"], reverse=True)
        for idx, item in enumerate(scored_suppliers):
            item["rank"] = idx + 1

        best = scored_suppliers[0]
        alternatives = scored_suppliers[1:4]

        # Calculate separation / confidence
        if len(scored_suppliers) > 1:
            margin = best["final_score"] - scored_suppliers[1]["final_score"]
            confidence = round(min(0.98, max(0.65, 0.70 + (margin / 100.0))), 2)
        else:
            confidence = 0.85

        risk_level = "LOW" if best["final_score"] >= 80 else ("MEDIUM" if best["final_score"] >= 65 else "HIGH")

        # 4. Generate LLM explanation strictly grounded in deterministic data
        llm = get_llm_provider()
        table_rows = []
        for s in scored_suppliers[:4]:
            table_rows.append(
                f"- #{s['rank']} {s['supplier_name']}: Score {s['final_score']}/100, "
                f"Price ₹{s['unit_price']:.2f}, Quality {s['quality_score']}%, "
                f"Turnaround {s['delivery_days']}d, Reliability {s['reliability_score']}%"
            )
        suppliers_table_str = "\n".join(table_rows)

        prompt = SUPPLIER_EXPLANATION_PROMPT.format(
            product_name=query_str,
            quantity=quantity,
            suppliers_table=suppliers_table_str
        )

        llm_explanation = llm.generate(
            prompt=prompt,
            system=SYSTEM_PROMPT_SUPPLY_CHAIN_BASE,
            temperature=0.2
        )

        if not llm_explanation or "[AI Note:" in llm_explanation:
            reasoning = (
                f"{best['supplier_name']} ranked #1 with an optimization score of {best['final_score']}/100. "
                f"Unit price is ₹{best['unit_price']:.2f} (Price efficiency {best['price_score']}/100), "
                f"quality index {best['quality_score']}%, {best['delivery_days']} days lead time, and {best['reliability_score']}% fulfillment reliability."
            )
        else:
            reasoning = llm_explanation

        # 5. Record evaluation in database for auditability
        try:
            eval_record = SupplierEvaluation(
                supplier_id=best["supplier_id"],
                product_id=product.id if product else None,
                price_score=best["price_score"],
                quality_score=best["quality_score"],
                delivery_score=max(0.0, 100.0 - (best["delivery_days"] * 8.0)),
                reliability_score=best["reliability_score"],
                overall_score=best["final_score"],
                reasoning=reasoning[:500]
            )
            db.add(eval_record)
            db.commit()
        except Exception:
            db.rollback()

        return {
            "product_id": product.id if product else None,
            "product_name": query_str,
            "quantity_evaluated": quantity,
            "recommended_supplier": best,
            "alternative_suppliers": alternatives,
            "score": best["final_score"],
            "confidence": confidence,
            "expected_cost": best["total_cost"],
            "expected_delivery_days": best["delivery_days"],
            "risk": risk_level,
            "reasoning": reasoning,
            "supporting_data": {
                "criteria_weights": {
                    "price": price_w,
                    "quality": qual_w,
                    "delivery": deliv_w,
                    "reliability": rel_w
                },
                "total_suppliers_evaluated": len(scored_suppliers),
                "top_candidates": scored_suppliers[:3]
            }
        }

# Backwards compatible function for existing callers
def evaluate_suppliers_for_product(db: Session, product_name_or_id: Any) -> Dict[str, Any]:
    agent = SupplierAgent()
    if isinstance(product_name_or_id, int) or (isinstance(product_name_or_id, str) and product_name_or_id.isdigit()):
        res = agent.run(db, product_id=int(product_name_or_id))
    else:
        res = agent.run(db, product_name=str(product_name_or_id))
    
    # Adapt to legacy frontend format
    best = res.get("recommended_supplier") or {}
    legacy_best = {
        "id": best.get("supplier_id"),
        "name": best.get("supplier_name"),
        "price": best.get("unit_price", 0.0),
        "quality_score": best.get("quality_score", 0.0),
        "delivery_days": best.get("delivery_days", 0),
        "reliability_score": best.get("reliability_score", 0.0),
        "price_score": best.get("price_score", 0.0),
        "final_score": best.get("final_score", 0.0),
        "explanation": res.get("reasoning", "")
    } if best else None

    return {
        "product_name": res.get("product_name"),
        "best_supplier": legacy_best,
        "recommended_supplier": legacy_best,
        "all_suppliers": res.get("alternative_suppliers", []),
        "recommendation_reason": res.get("reasoning"),
        "score": res.get("score"),
        "confidence": res.get("confidence")
    }
