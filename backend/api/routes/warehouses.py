from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.deps import get_db, require_admin_or_manager
from models.warehouse import Warehouse
from models.user import User
from schemas.warehouse import WarehouseCreate, WarehouseResponse

router = APIRouter(prefix="/warehouses", tags=["Warehouses"])

@router.get("/", response_model=List[WarehouseResponse])
def get_warehouses(db: Session = Depends(get_db)):
    return db.query(Warehouse).all()

@router.post("/", response_model=WarehouseResponse)
def create_warehouse(
    data: WarehouseCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    code_norm = data.code.strip().upper()
    existing = db.query(Warehouse).filter(Warehouse.code == code_norm).first()
    if existing:
        raise HTTPException(status_code=400, detail="Warehouse code already in use.")

    wh = Warehouse(
        name=data.name.strip(),
        code=code_norm,
        location=data.location or "Central Hub",
        capacity=data.capacity or 50000
    )
    db.add(wh)
    db.commit()
    db.refresh(wh)
    return wh
