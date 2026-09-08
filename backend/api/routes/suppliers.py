from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from core.deps import get_db, require_admin_or_manager
from models.supplier import Supplier
from models.purchase_order import PurchaseOrder
from models.user import User
from schemas.supplier import (
    SupplierCreate,
    SupplierUpdate,
    SupplierResponse,
    SupplierComparisonResponse
)
from schemas.common import StandardResponse
from services.audit_service import log_audit_event
from agents.supplier_agent import evaluate_suppliers_for_product

router = APIRouter(prefix="/suppliers", tags=["Suppliers & Vendors"])

@router.get("/", response_model=List[SupplierResponse])
def get_suppliers(
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Supplier)

    if status and status != "all":
        query = query.filter(Supplier.status == status)

    if category and category != "All":
        query = query.filter(Supplier.category.ilike(f"%{category}%"))

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (Supplier.name.ilike(s)) |
            (Supplier.product_name.ilike(s)) |
            (Supplier.category.ilike(s))
        )

    suppliers = query.order_by(Supplier.overall_score.desc()).all()

    results = []
    for sup in suppliers:
        open_pos = db.query(PurchaseOrder).filter(
            PurchaseOrder.supplier_id == sup.id,
            PurchaseOrder.status.in_(["pending_approval", "approved", "sent"])
        ).count()

        sup_dict = {
            "id": sup.id,
            "name": sup.name,
            "product_name": sup.product_name,
            "price": sup.price,
            "quality_score": sup.quality_score,
            "delivery_days": sup.delivery_days,
            "reliability_score": sup.reliability_score,
            "email": sup.email or "",
            "phone": sup.phone or "",
            "address": sup.address or "",
            "category": sup.category or "Electronics & Hardware",
            "status": sup.status,
            "overall_score": sup.overall_score,
            "created_at": sup.created_at,
            "updated_at": sup.updated_at,
            "products_count": 1,
            "open_pos_count": open_pos
        }
        results.append(sup_dict)

    return results

@router.get("/compare", response_model=SupplierComparisonResponse)
def compare_suppliers_for_product(
    product_name: str = Query(..., description="Product name or query to evaluate"),
    db: Session = Depends(get_db)
):
    eval_res = evaluate_suppliers_for_product(db, product_name)
    best = eval_res.get("best_supplier")
    if not best:
        raise HTTPException(status_code=404, detail="No suppliers found for comparison.")

    return {
        "product_name": eval_res["product_name"],
        "recommended_supplier": best,
        "all_suppliers": eval_res.get("all_suppliers", []),
        "decision_rationale": eval_res.get("recommendation_reason", "")
    }

@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier_detail(supplier_id: int, db: Session = Depends(get_db)):
    sup = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not sup:
        raise HTTPException(status_code=404, detail="Supplier not found.")

    open_pos = db.query(PurchaseOrder).filter(
        PurchaseOrder.supplier_id == sup.id,
        PurchaseOrder.status.in_(["pending_approval", "approved", "sent"])
    ).count()

    return {
        "id": sup.id,
        "name": sup.name,
        "product_name": sup.product_name,
        "price": sup.price,
        "quality_score": sup.quality_score,
        "delivery_days": sup.delivery_days,
        "reliability_score": sup.reliability_score,
        "email": sup.email or "",
        "phone": sup.phone or "",
        "address": sup.address or "",
        "category": sup.category or "Electronics & Hardware",
        "status": sup.status,
        "overall_score": sup.overall_score,
        "created_at": sup.created_at,
        "updated_at": sup.updated_at,
        "products_count": 1,
        "open_pos_count": open_pos
    }

@router.post("/", response_model=SupplierResponse)
def create_supplier(
    data: SupplierCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    quality = data.quality_score or 90.0
    delivery = data.delivery_days or 5
    reliability = data.reliability_score or 90.0
    price = data.price or 10.0

    # Calculate AI overall score
    delivery_score = max(0.0, 100.0 - (delivery * 10.0))
    overall = round((quality * 0.40) + (delivery_score * 0.30) + (reliability * 0.30), 1)

    new_sup = Supplier(
        name=data.name.strip(),
        product_name=data.product_name or "General Components",
        price=price,
        quality_score=quality,
        delivery_days=delivery,
        reliability_score=reliability,
        email=data.email or "",
        phone=data.phone or "",
        address=data.address or "",
        category=data.category or "Electronics & Hardware",
        status=data.status or "active",
        overall_score=overall
    )
    db.add(new_sup)
    db.commit()
    db.refresh(new_sup)

    log_audit_event(
        db=db,
        user_email=admin.email,
        action="SUPPLIER_CREATED",
        entity="Supplier",
        entity_id=new_sup.id,
        new_state={"name": new_sup.name, "overall_score": overall}
    )

    return new_sup

@router.put("/{supplier_id}", response_model=SupplierResponse)
def update_supplier(
    supplier_id: int,
    data: SupplierUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    sup = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not sup:
        raise HTTPException(status_code=404, detail="Supplier not found.")

    if data.name is not None:
        sup.name = data.name.strip()
    if data.product_name is not None:
        sup.product_name = data.product_name
    if data.price is not None:
        sup.price = data.price
    if data.quality_score is not None:
        sup.quality_score = data.quality_score
    if data.delivery_days is not None:
        sup.delivery_days = data.delivery_days
    if data.reliability_score is not None:
        sup.reliability_score = data.reliability_score
    if data.email is not None:
        sup.email = data.email
    if data.phone is not None:
        sup.phone = data.phone
    if data.address is not None:
        sup.address = data.address
    if data.category is not None:
        sup.category = data.category
    if data.status is not None:
        sup.status = data.status

    delivery_score = max(0.0, 100.0 - (sup.delivery_days * 10.0))
    sup.overall_score = round((sup.quality_score * 0.40) + (delivery_score * 0.30) + (sup.reliability_score * 0.30), 1)

    db.commit()
    db.refresh(sup)

    log_audit_event(
        db=db,
        user_email=admin.email,
        action="SUPPLIER_UPDATED",
        entity="Supplier",
        entity_id=sup.id
    )

    return sup

@router.delete("/{supplier_id}", response_model=StandardResponse)
def delete_or_archive_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    sup = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not sup:
        raise HTTPException(status_code=404, detail="Supplier not found.")

    has_pos = db.query(PurchaseOrder).filter(PurchaseOrder.supplier_id == supplier_id).count() > 0
    if has_pos:
        sup.status = "archived"
        db.commit()
        return StandardResponse(message="Supplier has linked purchase orders and has been archived.")
    else:
        db.delete(sup)
        db.commit()
        return StandardResponse(message="Supplier deleted successfully.")
