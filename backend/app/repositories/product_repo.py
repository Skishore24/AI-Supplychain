from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.product import Product
from app.repositories.base import BaseRepository

class ProductRepository(BaseRepository[Product]):
    def __init__(self):
        super().__init__(Product)

    def get_by_sku(self, db: Session, sku: str, organization_id: Optional[int] = None) -> Optional[Product]:
        query = db.query(Product).filter(Product.sku == sku)
        if organization_id is not None:
            query = query.filter(Product.organization_id == organization_id)
        return query.first()

    def search(
        self,
        db: Session,
        search_query: str,
        category: Optional[str] = None,
        organization_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[Product]:
        query = db.query(Product)
        if organization_id is not None:
            query = query.filter(Product.organization_id == organization_id)
        if category:
            query = query.filter(Product.category == category)
        if search_query:
            term = f"%{search_query}%"
            query = query.filter(Product.name.ilike(term) | Product.sku.ilike(term))
        return query.offset(skip).limit(limit).all()

product_repo = ProductRepository()
