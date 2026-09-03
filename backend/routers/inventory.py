from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.inventory import Inventory
from models.product import Product

from schemas.inventory import (
    InventoryCreate,
    InventoryUpdate,
    InventoryResponse,
    InventoryWithProduct
)


router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)


@router.post("/", response_model=InventoryResponse)
def create_inventory(
    inventory: InventoryCreate,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == inventory.product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # If inventory for product already exists, update it instead of creating duplicate
    existing_inv = db.query(Inventory).filter(
        Inventory.product_id == inventory.product_id
    ).first()

    if existing_inv:
        existing_inv.current_stock = inventory.current_stock
        existing_inv.reorder_level = inventory.reorder_level
        db.commit()
        db.refresh(existing_inv)
        return existing_inv

    new_inventory = Inventory(
        product_id=inventory.product_id,
        current_stock=inventory.current_stock,
        reorder_level=inventory.reorder_level
    )

    db.add(new_inventory)
    db.commit()
    db.refresh(new_inventory)

    return new_inventory


@router.get("/", response_model=list[InventoryResponse])
def get_inventory(
    db: Session = Depends(get_db)
):
    return db.query(Inventory).all()


@router.get("/detailed", response_model=list[InventoryWithProduct])
def get_detailed_inventory(
    db: Session = Depends(get_db)
):
    results = db.query(Inventory, Product).join(
        Product, Inventory.product_id == Product.id
    ).all()

    detailed_list = []
    for inv, prod in results:
        is_low = inv.current_stock <= inv.reorder_level
        reorder_qty = max(0, (inv.reorder_level * 2) - inv.current_stock) if is_low else 0
        detailed_list.append({
            "id": inv.id,
            "product_id": prod.id,
            "product_name": prod.name,
            "category": prod.category,
            "sku": prod.sku,
            "price": prod.price or 0.0,
            "current_stock": inv.current_stock,
            "reorder_level": inv.reorder_level,
            "is_low_stock": is_low,
            "reorder_needed": reorder_qty
        })
    return detailed_list


@router.get("/{product_id}", response_model=InventoryResponse)
def get_product_inventory(
    product_id: int,
    db: Session = Depends(get_db)
):
    inventory = db.query(Inventory).filter(
        Inventory.product_id == product_id
    ).first()

    if not inventory:
        raise HTTPException(
            status_code=404,
            detail="Inventory not found"
        )

    return inventory


@router.put("/{product_id}", response_model=InventoryResponse)
def update_product_inventory(
    product_id: int,
    inv_update: InventoryUpdate,
    db: Session = Depends(get_db)
):
    inventory = db.query(Inventory).filter(
        Inventory.product_id == product_id
    ).first()

    if not inventory:
        # If not found, auto-create if product exists
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        inventory = Inventory(
            product_id=product_id,
            current_stock=inv_update.current_stock or 0,
            reorder_level=inv_update.reorder_level or 10
        )
        db.add(inventory)
    else:
        if inv_update.current_stock is not None:
            inventory.current_stock = inv_update.current_stock
        if inv_update.reorder_level is not None:
            inventory.reorder_level = inv_update.reorder_level

    db.commit()
    db.refresh(inventory)
    return inventory


@router.delete("/{product_id}")
def delete_product_inventory(
    product_id: int,
    db: Session = Depends(get_db)
):
    inventory = db.query(Inventory).filter(
        Inventory.product_id == product_id
    ).first()

    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory record not found")

    db.delete(inventory)
    db.commit()
    return {"status": "success", "message": f"Inventory for product {product_id} deleted"}