from datetime import datetime, timezone, date, timedelta
from typing import List, Optional
import random
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_admin_or_manager
from app.models.purchase_order import PurchaseOrder, PurchaseOrderItem
from app.models.supplier import Supplier
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.user import User
from app.schemas.purchase_order import (
    PurchaseOrderCreate,
    PurchaseOrderStatusUpdate,
    PurchaseOrderReceiveRequest,
    PurchaseOrderResponse,
    PurchaseOrderDetailResponse,
    POItemResponse
)
from app.schemas.common import StandardResponse
from app.services.audit_service import log_audit_event
from app.services.notification_service import create_system_notification

router = APIRouter(prefix="/purchase-orders", tags=["Purchase Orders & Procurement"])

@router.get("/", response_model=List[PurchaseOrderResponse])
def get_purchase_orders(
    status: Optional[str] = None,
    supplier_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(PurchaseOrder)
    if status and status != "all":
        query = query.filter(PurchaseOrder.status == status)
    if supplier_id:
        query = query.filter(PurchaseOrder.supplier_id == supplier_id)

    pos = query.order_by(PurchaseOrder.id.desc()).all()

    result = []
    for po in pos:
        result.append({
            "id": po.id,
            "po_number": po.po_number,
            "supplier_id": po.supplier_id,
            "supplier_name": po.supplier.name if po.supplier else "Unknown Vendor",
            "status": po.status,
            "total_cost": po.total_cost,
            "expected_delivery": po.expected_delivery,
            "actual_delivery": po.actual_delivery,
            "created_by": po.created_by,
            "approved_by": po.approved_by,
            "notes": po.notes or "",
            "created_at": po.created_at,
            "updated_at": po.updated_at,
            "items_count": len(po.items)
        })
    return result

@router.get("/{po_id}", response_model=PurchaseOrderDetailResponse)
def get_purchase_order_detail(po_id: int, db: Session = Depends(get_db)):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found.")

    items_list = [
        POItemResponse(
            id=it.id,
            product_id=it.product_id,
            product_name=it.product.name if it.product else f"Product #{it.product_id}",
            sku=it.product.sku if it.product else "N/A",
            quantity=it.quantity,
            received_quantity=it.received_quantity,
            unit_cost=it.unit_cost,
            total_cost=it.total_cost
        )
        for it in po.items
    ]

    return {
        "id": po.id,
        "po_number": po.po_number,
        "supplier_id": po.supplier_id,
        "supplier_name": po.supplier.name if po.supplier else "Unknown Vendor",
        "status": po.status,
        "total_cost": po.total_cost,
        "expected_delivery": po.expected_delivery,
        "actual_delivery": po.actual_delivery,
        "created_by": po.created_by,
        "approved_by": po.approved_by,
        "notes": po.notes or "",
        "created_at": po.created_at,
        "updated_at": po.updated_at,
        "items_count": len(items_list),
        "items": items_list
    }

@router.post("/", response_model=PurchaseOrderDetailResponse)
def create_purchase_order(
    data: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    supplier = db.query(Supplier).filter(Supplier.id == data.supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found.")

    if not data.items:
        raise HTTPException(status_code=400, detail="PO must contain at least one item.")

    po_number = f"PO-{date.today().strftime('%Y%m%d')}-{random.randint(100, 999)}"
    delivery_date = data.expected_delivery or (date.today() + timedelta(days=supplier.delivery_days or 5))

    total_cost = 0.0
    po_items_to_add = []

    for item in data.items:
        prod = db.query(Product).filter(Product.id == item.product_id).first()
        if not prod:
            raise HTTPException(status_code=404, detail=f"Product #{item.product_id} not found.")

        line_cost = round(item.unit_cost * item.quantity, 2)
        total_cost += line_cost
        po_items_to_add.append({
            "product_id": prod.id,
            "quantity": item.quantity,
            "unit_cost": item.unit_cost,
            "total_cost": line_cost
        })

    po = PurchaseOrder(
        po_number=po_number,
        supplier_id=supplier.id,
        status="pending_approval",
        total_cost=round(total_cost, 2),
        expected_delivery=delivery_date,
        notes=data.notes or "",
        created_by=admin.full_name or admin.email
    )
    db.add(po)
    db.flush()

    for item_data in po_items_to_add:
        po_item = PurchaseOrderItem(
            purchase_order_id=po.id,
            product_id=item_data["product_id"],
            quantity=item_data["quantity"],
            received_quantity=0,
            unit_cost=item_data["unit_cost"],
            total_cost=item_data["total_cost"]
        )
        db.add(po_item)

    db.commit()
    db.refresh(po)

    create_system_notification(
        db=db,
        title=f"New Purchase Order Created: {po.po_number}",
        message=f"Purchase order for {len(po.items)} item(s) created for vendor {supplier.name}.",
        notification_type="po_created",
        severity="info",
        link_url="/admin/purchase-orders"
    )

    log_audit_event(
        db=db,
        user_email=admin.email,
        action="PO_CREATED",
        entity="PurchaseOrder",
        entity_id=po.id,
        new_state={"po_number": po.po_number, "total_cost": po.total_cost, "supplier": supplier.name}
    )

    return get_purchase_order_detail(po.id, db)

@router.put("/{po_id}/status", response_model=PurchaseOrderDetailResponse)
def update_purchase_order_status(
    po_id: int,
    data: PurchaseOrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found.")

    old_status = po.status
    new_status = data.status.lower()
    valid_statuses = [
        "draft", "pending_approval", "approved", "sent",
        "partially_received", "received", "cancelled", "rejected"
    ]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status '{new_status}'.")

    po.status = new_status
    if new_status == "approved":
        po.approved_by = admin.full_name or admin.email
    if data.notes:
        po.notes = data.notes

    # If marked as received directly through status update, replenish all remaining items
    if new_status == "received" and old_status != "received":
        po.actual_delivery = date.today()
        for it in po.items:
            qty_to_add = it.quantity - it.received_quantity
            if qty_to_add > 0:
                it.received_quantity = it.quantity
                inv = db.query(Inventory).filter(Inventory.product_id == it.product_id).first()
                if inv:
                    inv.current_stock += qty_to_add
                    inv.last_restocked_at = datetime.now(timezone.utc)
                else:
                    new_inv = Inventory(
                        product_id=it.product_id,
                        current_stock=qty_to_add,
                        reorder_level=15
                    )
                    db.add(new_inv)

        create_system_notification(
            db=db,
            title=f"Stock Received for {po.po_number}",
            message=f"Purchase order {po.po_number} marked as fully received. Warehouse inventory automatically replenished.",
            notification_type="stock_replenished",
            severity="success",
            link_url="/admin/inventory"
        )

    db.commit()
    db.refresh(po)

    log_audit_event(
        db=db,
        user_email=admin.email,
        action="PO_STATUS_CHANGED",
        entity="PurchaseOrder",
        entity_id=po.id,
        previous_state={"status": old_status},
        new_state={"status": po.status}
    )

    return get_purchase_order_detail(po.id, db)

@router.post("/{po_id}/receive", response_model=PurchaseOrderDetailResponse)
def receive_purchase_order_items(
    po_id: int,
    req: PurchaseOrderReceiveRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    """
    Receives specific quantities of items on a Purchase Order.
    Automatically increments physical warehouse inventory on hand!
    """
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found.")

    if po.status in ("cancelled", "rejected"):
        raise HTTPException(status_code=400, detail="Cannot receive items for cancelled/rejected PO.")

    total_received_qty = 0
    item_map = {item.id: item for item in po.items}

    for rec_item in req.received_items:
        if rec_item.item_id not in item_map:
            continue
        po_item = item_map[rec_item.item_id]
        add_qty = rec_item.received_quantity
        if add_qty <= 0:
            continue

        po_item.received_quantity = min(po_item.quantity, po_item.received_quantity + add_qty)
        total_received_qty += add_qty

        # Atomically update inventory stock
        inv = db.query(Inventory).filter(Inventory.product_id == po_item.product_id).first()
        if inv:
            inv.current_stock += add_qty
            inv.last_restocked_at = datetime.now(timezone.utc)
        else:
            new_inv = Inventory(
                product_id=po_item.product_id,
                current_stock=add_qty,
                reorder_level=15
            )
            db.add(new_inv)

    # Determine updated PO status
    all_complete = all(it.received_quantity >= it.quantity for it in po.items)
    any_received = any(it.received_quantity > 0 for it in po.items)

    if all_complete:
        po.status = "received"
        po.actual_delivery = date.today()
    elif any_received:
        po.status = "partially_received"

    db.commit()
    db.refresh(po)

    create_system_notification(
        db=db,
        title=f"Stock Intake Confirmed ({po.po_number})",
        message=f"Received +{total_received_qty} units into central warehouse inventory from {po.supplier.name}.",
        notification_type="stock_replenished",
        severity="success",
        link_url="/admin/inventory"
    )

    log_audit_event(
        db=db,
        user_email=admin.email,
        action="PO_STOCK_RECEIVED",
        entity="PurchaseOrder",
        entity_id=po.id,
        new_state={"units_received": total_received_qty, "po_status": po.status}
    )

    return get_purchase_order_detail(po.id, db)
