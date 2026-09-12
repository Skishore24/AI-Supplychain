import pytest
from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.services.procurement_service import procurement_service
from app.models.purchase_order import PurchaseOrder, PurchaseOrderItem
from app.models.inventory import Inventory
from app.models.supplier import Supplier
from app.models.product import Product
from app.core.exceptions import ValidationError

def test_purchase_order_full_lifecycle(db_session: Session):
    sup = db_session.query(Supplier).filter(Supplier.organization_id == 1).first()
    prod = db_session.query(Product).filter(Product.organization_id == 1).first()
    inv = db_session.query(Inventory).filter(Inventory.product_id == prod.id).first()
    initial_stock = inv.current_stock

    # 1. Create Purchase Order in DRAFT
    po = procurement_service.create_purchase_order(
        db=db_session,
        organization_id=1,
        supplier_id=sup.id,
        items_data=[{"product_id": prod.id, "quantity": 50, "unit_cost": 20.0}],
        notes="Automated restock order"
    )
    assert po.status == "DRAFT"
    assert po.total_cost == 1000.0

    # 2. Transition: DRAFT -> PENDING_APPROVAL
    po = procurement_service.update_status(db_session, organization_id=1, po_id=po.id, new_status="PENDING_APPROVAL")
    assert po.status == "PENDING_APPROVAL"

    # 3. Transition: PENDING_APPROVAL -> APPROVED
    po = procurement_service.update_status(
        db_session, organization_id=1, po_id=po.id, new_status="APPROVED", actor_id="admin"
    )
    assert po.status == "APPROVED"
    assert po.approved_by == "admin"

    # 4. Transition: APPROVED -> SENT
    po = procurement_service.update_status(db_session, organization_id=1, po_id=po.id, new_status="SENT")
    assert po.status == "SENT"

    # 5. Receive Partial Goods (30 out of 50 units)
    po_item = db_session.query(PurchaseOrderItem).filter(PurchaseOrderItem.purchase_order_id == po.id).first()
    po = procurement_service.receive_purchase_order_items(
        db=db_session,
        organization_id=1,
        po_id=po.id,
        receipts=[{"item_id": po_item.id, "quantity_received": 30}]
    )
    assert po.status == "PARTIALLY_RECEIVED"
    
    # Verify inventory was incremented by 30
    db_session.refresh(inv)
    assert inv.current_stock == initial_stock + 30

    # 6. Receive Remaining Goods (20 units)
    po = procurement_service.receive_purchase_order_items(
        db=db_session,
        organization_id=1,
        po_id=po.id,
        receipts=[{"item_id": po_item.id, "quantity_received": 20}]
    )
    assert po.status == "RECEIVED"

    # Verify inventory was incremented by another 20
    db_session.refresh(inv)
    assert inv.current_stock == initial_stock + 50

def test_invalid_status_transition_guardrail(db_session: Session):
    sup = db_session.query(Supplier).filter(Supplier.organization_id == 1).first()
    prod = db_session.query(Product).filter(Product.organization_id == 1).first()

    po = procurement_service.create_purchase_order(
        db=db_session,
        organization_id=1,
        supplier_id=sup.id,
        items_data=[{"product_id": prod.id, "quantity": 10, "unit_cost": 20.0}]
    )
    assert po.status == "DRAFT"

    # Cannot jump directly from DRAFT to RECEIVED
    with pytest.raises(ValidationError):
        procurement_service.update_status(db_session, organization_id=1, po_id=po.id, new_status="RECEIVED")
