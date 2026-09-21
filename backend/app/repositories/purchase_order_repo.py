from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.purchase_order import PurchaseOrder, PurchaseOrderItem
from app.repositories.base import BaseRepository

class PurchaseOrderRepository(BaseRepository[PurchaseOrder]):
    def __init__(self):
        super().__init__(PurchaseOrder)

    def get_by_po_number(self, db: Session, po_number: str, organization_id: Optional[int] = None) -> Optional[PurchaseOrder]:
        query = db.query(PurchaseOrder).filter(PurchaseOrder.po_number == po_number)
        if organization_id is not None:
            query = query.filter(PurchaseOrder.organization_id == organization_id)
        return query.first()

    def get_by_status(
        self,
        db: Session,
        status: str,
        organization_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[PurchaseOrder]:
        query = db.query(PurchaseOrder).filter(PurchaseOrder.status == status)
        if organization_id is not None:
            query = query.filter(PurchaseOrder.organization_id == organization_id)
        return query.order_by(PurchaseOrder.created_at.desc()).offset(skip).limit(limit).all()

purchase_order_repo = PurchaseOrderRepository()
