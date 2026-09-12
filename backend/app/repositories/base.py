from typing import Generic, TypeVar, Type, Optional, List, Any, Dict
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    """
    Tenant-aware Base Repository:
    Enforces automatic organization_id scoping on all SELECT, UPDATE, and DELETE operations.
    Prevents cross-tenant information leakage.
    """

    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get(self, db: Session, id: Any, organization_id: Optional[int] = None) -> Optional[ModelType]:
        query = db.query(self.model).filter(self.model.id == id)
        if organization_id is not None and hasattr(self.model, "organization_id"):
            query = query.filter(self.model.organization_id == organization_id)
        return query.first()

    def list(
        self,
        db: Session,
        organization_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
        **filters
    ) -> List[ModelType]:
        query = db.query(self.model)
        if organization_id is not None and hasattr(self.model, "organization_id"):
            query = query.filter(self.model.organization_id == organization_id)
        for key, value in filters.items():
            if value is not None and hasattr(self.model, key):
                query = query.filter(getattr(self.model, key) == value)
        return query.offset(skip).limit(limit).all()

    def count(self, db: Session, organization_id: Optional[int] = None, **filters) -> int:
        query = db.query(func.count(self.model.id))
        if organization_id is not None and hasattr(self.model, "organization_id"):
            query = query.filter(self.model.organization_id == organization_id)
        for key, value in filters.items():
            if value is not None and hasattr(self.model, key):
                query = query.filter(getattr(self.model, key) == value)
        return query.scalar() or 0

    def create(self, db: Session, obj_in: Dict[str, Any], organization_id: Optional[int] = None) -> ModelType:
        if organization_id is not None and hasattr(self.model, "organization_id"):
            obj_in["organization_id"] = organization_id
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, id: Any, organization_id: Optional[int] = None) -> bool:
        obj = self.get(db, id, organization_id=organization_id)
        if not obj:
            return False
        db.delete(obj)
        db.commit()
        return True
