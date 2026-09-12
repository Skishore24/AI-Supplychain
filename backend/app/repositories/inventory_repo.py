from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from app.models.inventory import Inventory, InventoryMovement
from app.models.product import Product
from app.repositories.base import BaseRepository

class InventoryRepository(BaseRepository[Inventory]):
    def __init__(self):
        super().__init__(Inventory)

    def get_by_product_id(self, db: Session, product_id: int, organization_id: Optional[int] = None) -> Optional[Inventory]:
        query = db.query(Inventory).filter(Inventory.product_id == product_id)
        if organization_id is not None:
            query = query.filter(Inventory.organization_id == organization_id)
        return query.first()

    def get_with_products(
        self,
        db: Session,
        organization_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Tuple[Inventory, Product]]:
        query = db.query(Inventory, Product).join(Product, Inventory.product_id == Product.id)
        if organization_id is not None:
            query = query.filter(Inventory.organization_id == organization_id)
        return query.offset(skip).limit(limit).all()

    def record_movement(
        self,
        db: Session,
        product_id: int,
        quantity: int,
        movement_type: str,
        organization_id: Optional[int] = None,
        reference_id: Optional[str] = None,
        notes: Optional[str] = None
    ) -> InventoryMovement:
        movement = InventoryMovement(
            product_id=product_id,
            quantity=quantity,
            movement_type=movement_type,
            organization_id=organization_id or 1,
            reference_id=reference_id,
            notes=notes
        )
        db.add(movement)
        db.commit()
        db.refresh(movement)
        return movement

inventory_repo = InventoryRepository()
