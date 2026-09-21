from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.supplier import Supplier
from app.models.supplier_product import SupplierProduct
from app.repositories.base import BaseRepository

class SupplierRepository(BaseRepository[Supplier]):
    def __init__(self):
        super().__init__(Supplier)

    def get_suppliers_for_product(
        self,
        db: Session,
        product_id: int,
        organization_id: Optional[int] = None
    ) -> List[SupplierProduct]:
        query = db.query(SupplierProduct).join(Supplier, SupplierProduct.supplier_id == Supplier.id).filter(
            SupplierProduct.product_id == product_id
        )
        if organization_id is not None:
            query = query.filter(Supplier.organization_id == organization_id)
        return query.all()

supplier_repo = SupplierRepository()
