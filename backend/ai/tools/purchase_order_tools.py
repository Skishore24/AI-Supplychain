from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import random
import string

from models.purchase_order import PurchaseOrder, PurchaseOrderItem
from models.product import Product
from models.supplier import Supplier
from models.warehouse import Warehouse
from models.system import AuditLog
from models.ai import AIAuditLog
from ai.tools.base_tool import AITool

class GetOpenPurchaseOrdersTool(AITool):
    name = "get_open_purchase_orders"
    description = "Retrieve all active or pending purchase orders in draft, pending, approved, or sent status."
    is_write = False
    requires_auth = False

    def execute(self, db: Session, user: Optional[Any] = None, supplier_id: Optional[int] = None, **kwargs) -> Dict[str, Any]:
        query = db.query(PurchaseOrder).filter(PurchaseOrder.status.in_(["draft", "pending", "approved", "sent"]))
        if supplier_id:
            query = query.filter(PurchaseOrder.supplier_id == supplier_id)
        
        pos = query.order_by(PurchaseOrder.created_at.desc()).all()
        return {
            "open_purchase_orders_count": len(pos),
            "orders": [
                {
                    "id": p.id,
                    "po_number": p.po_number,
                    "supplier_id": p.supplier_id,
                    "status": p.status,
                    "total_cost": p.total_cost,
                    "created_at": p.created_at.isoformat() if p.created_at else None
                }
                for p in pos
            ]
        }

class CreatePurchaseOrderTool(AITool):
    name = "create_purchase_order"
    description = "Authorized backend tool to create a real Purchase Order following human approval."
    is_write = True
    requires_auth = True
    allowed_roles = ["admin", "manager"]

    def execute(
        self,
        db: Session,
        user: Optional[Any] = None,
        supplier_id: int = 0,
        warehouse_id: Optional[int] = None,
        items: Optional[List[Dict[str, Any]]] = None,
        notes: str = "Created via AI Procurement Recommendation",
        **kwargs
    ) -> Dict[str, Any]:
        if not self.check_authorization(user):
            return {"success": False, "error": "Unauthorized: Only admin or manager can execute purchase orders."}

        supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not supplier:
            return {"success": False, "error": f"Supplier ID {supplier_id} not found."}

        if not items:
            return {"success": False, "error": "No line items specified for purchase order."}

        po_code = f"PO-AI-{datetime.now().strftime('%y%m%d')}-{''.join(random.choices(string.ascii_uppercase + string.digits, k=4))}"
        po = PurchaseOrder(
            po_number=po_code,
            supplier_id=supplier_id,
            status="pending_approval",
            total_cost=0.0,
            notes=notes,
            created_by="AI Procurement Recommendation"
        )
        db.add(po)
        db.flush()

        total_cost = 0.0
        for it in items:
            prod_id = it.get("product_id")
            qty = it.get("quantity", 0)
            unit_cost = it.get("unit_cost") or it.get("unit_price") or supplier.price or 100.0
            line_total = qty * unit_cost
            total_cost += line_total

            poi = PurchaseOrderItem(
                purchase_order_id=po.id,
                product_id=prod_id,
                quantity=qty,
                received_quantity=0,
                unit_cost=unit_cost,
                total_cost=line_total
            )
            db.add(poi)

        po.total_cost = total_cost

        # Record Audit Logs
        user_email = getattr(user, "email", "system@local")
        audit = AIAuditLog(
            user_email=user_email,
            agent="procurement_agent",
            tool="create_purchase_order",
            action="CREATE_PURCHASE_ORDER",
            entity=f"PO #{po.po_number} (Supplier: {supplier.name})",
            result={"po_id": po.id, "total_cost": total_cost, "items_count": len(items)},
            model="deterministic_backend"
        )
        db.add(audit)
        db.commit()
        db.refresh(po)

        return {
            "success": True,
            "po_id": po.id,
            "po_number": po.po_number,
            "supplier_name": supplier.name,
            "total_cost": po.total_cost,
            "status": po.status,
            "message": f"Purchase order {po.po_number} successfully registered in system."
        }
