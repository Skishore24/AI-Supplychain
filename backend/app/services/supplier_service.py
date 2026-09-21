from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.models.supplier import Supplier
from app.models.supplier_product import SupplierProduct
from app.models.product import Product
from app.core.exceptions import NotFoundError

class SupplierService:
    """
    Supplier Intelligence & Deterministic Multi-Factor Ranking Engine:
    - Normalizes supplier quote pricing, historical quality, lead-time velocity, and reliability.
    - Eliminates hallucinated scores by deriving metrics directly from stored supplier products and purchase records.
    """

    @staticmethod
    def calculate_score(
        price: float,
        min_price: float,
        max_price: float,
        quality: float,
        delivery_days: int,
        reliability: float
    ) -> float:
        if max_price == min_price:
            price_score = 100.0
        else:
            price_score = max(0.0, ((max_price - price) / (max_price - min_price)) * 100.0)

        quality_score = float(quality)
        delivery_score = max(0.0, 100.0 - (delivery_days * 8.0))
        rel_score = float(reliability)

        total_score = (
            (price_score * 0.40) +
            (quality_score * 0.35) +
            (delivery_score * 0.15) +
            (rel_score * 0.10)
        )
        return round(total_score, 1)

    def evaluate_suppliers_for_product(
        self,
        db: Session,
        organization_id: int,
        product_id: int
    ) -> Dict[str, Any]:
        product = db.query(Product).filter(
            Product.id == product_id,
            Product.organization_id == organization_id
        ).first()
        if not product:
            raise NotFoundError(f"Product {product_id} not found.")

        supplier_products = db.query(SupplierProduct, Supplier).join(
            Supplier, SupplierProduct.supplier_id == Supplier.id
        ).filter(
            SupplierProduct.product_id == product_id,
            Supplier.organization_id == organization_id,
            Supplier.status == "active"
        ).all()

        if not supplier_products:
            return {
                "product_id": product.id,
                "product_name": product.name,
                "sku": product.sku,
                "suppliers_evaluated": 0,
                "recommended_supplier": None,
                "alternatives": []
            }

        prices = [sp.unit_cost for sp, _ in supplier_products]
        min_p, max_p = min(prices), max(prices)

        ranked = []
        for sp, s in supplier_products:
            score = self.calculate_score(
                price=sp.unit_cost,
                min_price=min_p,
                max_price=max_p,
                quality=sp.quality_score or s.quality_score,
                delivery_days=sp.lead_time_days or s.delivery_days,
                reliability=sp.reliability_score or s.reliability_score
            )
            ranked.append({
                "supplier_id": s.id,
                "supplier_name": s.name,
                "unit_cost": sp.unit_cost,
                "lead_time_days": sp.lead_time_days or s.delivery_days,
                "quality_score": sp.quality_score or s.quality_score,
                "reliability_score": sp.reliability_score or s.reliability_score,
                "overall_score": score,
                "is_preferred": sp.is_preferred,
                "min_order_qty": sp.min_order_qty
            })

        ranked.sort(key=lambda x: x["overall_score"], reverse=True)
        recommended = ranked[0]
        alternatives = ranked[1:]

        return {
            "product_id": product.id,
            "product_name": product.name,
            "sku": product.sku,
            "suppliers_evaluated": len(ranked),
            "recommended_supplier": recommended,
            "alternatives": alternatives
        }

supplier_service = SupplierService()
