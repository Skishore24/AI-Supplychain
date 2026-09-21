from datetime import datetime, timezone, date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_db, require_admin_or_manager
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.warehouse import Warehouse
from app.models.sales import Sale
from app.models.user import User
from app.schemas.inventory import (
    InventoryCreate,
    InventoryUpdate,
    InventoryAdjustment,
    InventoryResponse,
    InventoryDetailedResponse
)
from app.schemas.common import StandardResponse
from app.services.audit_service import log_audit_event
from app.agents.inventory_agent import calculate_inventory_intelligence

router = APIRouter(prefix="/inventory", tags=["Warehouse Stock & Inventory"])

@router.get("/summary")
def get_inventory_summary(db: Session = Depends(get_db)):
    return calculate_inventory_intelligence(db)

@router.get("/detailed", response_model=List[InventoryDetailedResponse])
def get_detailed_inventory(
    search: Optional[str] = None,
    status_filter: Optional[str] = None, # "healthy", "low", "critical", "out_of_stock", "overstock"
    db: Session = Depends(get_db)
):
    results = db.query(Inventory, Product, Warehouse).join(
        Product, Inventory.product_id == Product.id
    ).outerjoin(
        Warehouse, Inventory.warehouse_id == Warehouse.id
    ).filter(Product.status == "active").all()

    fourteen_days_ago = date.today() - timedelta(days=14)
    detailed_list = []

    for inv, prod, wh in results:
        avail_stock = max(0, inv.current_stock - inv.reserved_stock)
        
        # Calculate recent velocity
        sales_14d = db.query(func.sum(Sale.quantity_sold)).filter(
            Sale.product_id == prod.id,
            Sale.sale_date >= fourteen_days_ago
        ).scalar() or 0
        daily_vel = max(0.5, round(sales_14d / 14.0, 2))
        days_rem = round(avail_stock / daily_vel, 1)

        lead_time = prod.lead_time_days or 5
        reorder = prod.reorder_point or inv.reorder_level or 15
        safety = prod.safety_stock or inv.safety_stock or 10

        if avail_stock == 0:
            status_tag = "Out of Stock"
        elif days_rem <= lead_time or avail_stock <= (safety // 2):
            status_tag = "Critical"
        elif avail_stock <= reorder or days_rem <= (lead_time * 1.5):
            status_tag = "Low"
        elif days_rem > 90:
            status_tag = "Overstock"
        else:
            status_tag = "Healthy"

        if status_filter:
            norm_filter = status_filter.lower().replace("_", " ")
            if norm_filter not in status_tag.lower():
                continue

        if search:
            st = search.lower()
            if st not in prod.name.lower() and st not in prod.sku.lower() and st not in prod.category.lower():
                continue

        target_qty = int((daily_vel * 30) + safety)
        reorder_qty = max(15, target_qty - avail_stock) if status_tag in ("Critical", "Low", "Out of Stock") else 0

        detailed_list.append({
            "id": inv.id,
            "product_id": prod.id,
            "product_name": prod.name,
            "sku": prod.sku,
            "category": prod.category,
            "brand": prod.brand or "Standard",
            "price": prod.price or 0.0,
            "cost_price": prod.cost_price or 0.0,
            "warehouse_name": wh.name if wh else "Central Warehouse",
            "current_stock": inv.current_stock,
            "reserved_stock": inv.reserved_stock,
            "available_stock": avail_stock,
            "reorder_level": reorder,
            "safety_stock": safety,
            "days_remaining": days_rem,
            "status": status_tag,
            "recommended_reorder_qty": reorder_qty,
            "recommended_supplier": "Auto Optimizer",
            "updated_at": inv.updated_at
        })

    return detailed_list

@router.get("/{product_id}", response_model=InventoryResponse)
def get_product_inventory(product_id: int, db: Session = Depends(get_db)):
    inv = db.query(Inventory).filter(Inventory.product_id == product_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory record not found.")
    return inv

@router.put("/{product_id}", response_model=InventoryResponse)
def update_inventory(
    product_id: int,
    data: InventoryUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    inv = db.query(Inventory).filter(Inventory.product_id == product_id).first()
    if not inv:
        # Create if missing
        prod = db.query(Product).filter(Product.id == product_id).first()
        if not prod:
            raise HTTPException(status_code=404, detail="Product does not exist.")
        inv = Inventory(
            product_id=product_id,
            current_stock=data.current_stock or 0,
            reserved_stock=data.reserved_stock or 0,
            reorder_level=data.reorder_level or prod.reorder_point or 10,
            safety_stock=data.safety_stock or prod.safety_stock or 10
        )
        db.add(inv)
    else:
        old_stock = inv.current_stock
        if data.current_stock is not None:
            inv.current_stock = data.current_stock
        if data.reserved_stock is not None:
            inv.reserved_stock = data.reserved_stock
        if data.reorder_level is not None:
            inv.reorder_level = data.reorder_level
        if data.safety_stock is not None:
            inv.safety_stock = data.safety_stock
        if data.warehouse_id is not None:
            inv.warehouse_id = data.warehouse_id
        inv.last_restocked_at = datetime.now(timezone.utc)

        log_audit_event(
            db=db,
            user_email=admin.email,
            action="INVENTORY_UPDATED",
            entity="Inventory",
            entity_id=inv.id,
            previous_state={"current_stock": old_stock},
            new_state={"current_stock": inv.current_stock}
        )

    db.commit()
    db.refresh(inv)
    return inv

@router.post("/{product_id}/adjust", response_model=InventoryResponse)
def adjust_inventory_stock(
    product_id: int,
    adj: InventoryAdjustment,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    inv = db.query(Inventory).filter(Inventory.product_id == product_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory record not found.")

    old_val = inv.current_stock
    new_val = max(0, inv.current_stock + adj.adjustment)
    inv.current_stock = new_val
    inv.last_restocked_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(inv)

    log_audit_event(
        db=db,
        user_email=admin.email,
        action="STOCK_ADJUSTMENT",
        entity="Inventory",
        entity_id=inv.id,
        previous_state={"current_stock": old_val},
        new_state={"current_stock": new_val, "adjustment": adj.adjustment, "reason": adj.reason}
    )

    return inv
