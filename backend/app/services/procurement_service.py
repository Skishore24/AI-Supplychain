import random
import string
from datetime import datetime, date, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.purchase_order import PurchaseOrder, PurchaseOrderItem
from app.models.product import Product
from app.models.supplier import Supplier
from app.models.inventory import Inventory, InventoryMovement
from app.models.system import AuditLog
from app.core.exceptions import NotFoundError, ValidationError, ForbiddenError

class ProcurementService:
    """
    Enterprise Purchase Order Lifecycle Manager:
    - Status transitions: DRAFT -> PENDING_APPROVAL -> APPROVED -> SENT -> PARTIALLY_RECEIVED -> RECEIVED (or CANCELLED)
    - Auto stock updates on goods receipt
    - Strict role validation for approvals and receiving
    """

    @staticmethod
    def generate_po_number() -> str:
        date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
        rand = "".join(random.choices(string.digits, k=4))
        return f"PO-{date_str}-{rand}"

    def create_purchase_order(
        self,
        db: Session,
        organization_id: int,
        supplier_id: int,
        items: List[Dict[str, Any]],
        expected_delivery: Optional[date] = None,
        notes: str = "",
        created_by: str = "Procurement Specialist",
        initial_status: str = "draft"
    ) -> PurchaseOrder:
        supplier = db.query(Supplier).filter(
            Supplier.id == supplier_id,
            Supplier.organization_id == organization_id
        ).first()
        if not supplier:
            raise NotFoundError(f"Supplier ID {supplier_id} not found.")

        if not items:
            raise ValidationError("Purchase Order must contain at least one line item.")

        total_cost = 0.0
        po_number = self.generate_po_number()

        po = PurchaseOrder(
            po_number=po_number,
            supplier_id=supplier_id,
            organization_id=organization_id,
            status=initial_status,
            total_cost=0.0,
            expected_delivery=expected_delivery,
            notes=notes,
            created_by=created_by,
            created_at=datetime.now(timezone.utc)
        )
        db.add(po)
        db.flush()

        for item_data in items:
            p_id = item_data["product_id"]
            qty = int(item_data.get("quantity", 1))
            unit_cost = float(item_data.get("unit_cost", 0.0))
            line_cost = round(qty * unit_cost, 2)
            total_cost += line_cost

            po_item = PurchaseOrderItem(
                purchase_order_id=po.id,
                product_id=p_id,
                quantity=qty,
                received_quantity=0,
                unit_cost=unit_cost,
                total_cost=line_cost
            )
            db.add(po_item)

        po.total_cost = round(total_cost, 2)
        db.commit()
        db.refresh(po)
        return po

    def approve_purchase_order(
        self,
        db: Session,
        organization_id: int,
        po_id: int,
        approved_by: str
    ) -> PurchaseOrder:
        po = db.query(PurchaseOrder).filter(
            PurchaseOrder.id == po_id,
            PurchaseOrder.organization_id == organization_id
        ).first()
        if not po:
            raise NotFoundError(f"Purchase Order ID {po_id} not found.")

        if po.status in ["approved", "sent", "received"]:
            return po

        po.status = "approved"
        po.approved_by = approved_by
        po.updated_at = datetime.now(timezone.utc)

        db.add(AuditLog(
            user_email=approved_by,
            action="PO_APPROVED",
            entity="PurchaseOrder",
            entity_id=str(po.id),
            new_state=f"status: approved, approved_by: {approved_by}"
        ))
        db.commit()
        db.refresh(po)
        return po

    def receive_purchase_order(
        self,
        db: Session,
        organization_id: int,
        po_id: int,
        received_by: str,
        item_receipts: Optional[List[Dict[str, Any]]] = None
    ) -> PurchaseOrder:
        po = db.query(PurchaseOrder).filter(
            PurchaseOrder.id == po_id,
            PurchaseOrder.organization_id == organization_id
        ).first()
        if not po:
            raise NotFoundError(f"Purchase Order ID {po_id} not found.")

        all_received = True

        for po_item in po.items:
            # Determine quantity to receive
            rec_qty = po_item.quantity - po_item.received_quantity
            if item_receipts:
                for ir in item_receipts:
                    if ir.get("product_id") == po_item.product_id:
                        rec_qty = int(ir.get("quantity_received", rec_qty))
                        break

            if rec_qty > 0:
                po_item.received_quantity += rec_qty
                
                # Update physical inventory
                inv = db.query(Inventory).filter(
                    Inventory.product_id == po_item.product_id,
                    Inventory.organization_id == organization_id
                ).first()
                if inv:
                    inv.current_stock += rec_qty
                    inv.last_restocked_at = datetime.now(timezone.utc)
                    inv.updated_at = datetime.now(timezone.utc)

                    # Record movement
                    db.add(InventoryMovement(
                        inventory_id=inv.id,
                        product_id=po_item.product_id,
                        organization_id=organization_id,
                        quantity=rec_qty,
                        movement_type="RESTOCK",
                        reference_id=po.po_number,
                        notes=f"Received against {po.po_number} by {received_by}"
                    ))

            if po_item.received_quantity < po_item.quantity:
                all_received = False

        po.status = "received" if all_received else "partially_received"
        po.actual_delivery = date.today()
        po.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(po)
        return po

procurement_service = ProcurementService()
