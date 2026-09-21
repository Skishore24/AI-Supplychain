from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func

from app.api.deps import get_db, require_admin_or_manager
from app.models.product import Product
from app.models.category import Category
from app.models.inventory import Inventory
from app.models.sales import Sale
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductDetailResponse
from app.schemas.common import PaginatedResponse, StandardResponse
from app.services.audit_service import log_audit_event
from app.agents.supplier_agent import evaluate_suppliers_for_product

router = APIRouter(prefix="/products", tags=["Products Catalog"])

@router.get("/", response_model=List[ProductResponse])
def get_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = "active",
    stock_status: Optional[str] = None, # "low", "out_of_stock", "healthy"
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(Product, Inventory).outerjoin(
        Inventory, Product.id == Inventory.product_id
    )

    if status and status != "all":
        query = query.filter(Product.status == status)

    if category and category != "All":
        query = query.filter(Product.category.ilike(f"%{category}%"))

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.sku.ilike(search_term),
                Product.category.ilike(search_term),
                Product.brand.ilike(search_term),
                Product.description.ilike(search_term)
            )
        )

    results = query.order_by(Product.id.asc()).offset(skip).limit(limit).all()

    enriched_products = []
    for prod, inv in results:
        curr_stock = inv.current_stock if inv else 0
        avail_stock = max(0, curr_stock - (inv.reserved_stock if inv else 0))
        reorder = prod.reorder_point or (inv.reorder_level if inv else 15)

        if avail_stock == 0:
            s_status = "Out of Stock"
        elif avail_stock <= reorder:
            s_status = "Low Stock"
        else:
            s_status = "Healthy"

        if stock_status:
            if stock_status == "out_of_stock" and s_status != "Out of Stock":
                continue
            if stock_status == "low" and s_status != "Low Stock":
                continue
            if stock_status == "healthy" and s_status != "Healthy":
                continue

        prod_dict = {
            "id": prod.id,
            "name": prod.name,
            "category": prod.category,
            "category_id": prod.category_id,
            "sku": prod.sku,
            "brand": prod.brand or "Standard",
            "price": prod.price or 0.0,
            "cost_price": prod.cost_price or 0.0,
            "description": prod.description or "",
            "image_url": prod.image_url or "",
            "status": prod.status or "active",
            "reorder_point": prod.reorder_point or 15,
            "safety_stock": prod.safety_stock or 10,
            "lead_time_days": prod.lead_time_days or 5,
            "specifications": prod.specifications or "{}",
            "created_at": prod.created_at,
            "updated_at": prod.updated_at,
            "current_stock": curr_stock,
            "available_stock": avail_stock,
            "stock_status": s_status
        }
        enriched_products.append(prod_dict)

    return enriched_products

@router.get("/{product_id}", response_model=ProductDetailResponse)
def get_product_details(product_id: int, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found.")

    inv = db.query(Inventory).filter(Inventory.product_id == prod.id).first()
    curr_stock = inv.current_stock if inv else 0
    reserved_stock = inv.reserved_stock if inv else 0
    avail_stock = max(0, curr_stock - reserved_stock)

    # Sales calculation
    sales = db.query(Sale).filter(Sale.product_id == prod.id).all()
    total_units = sum(s.quantity_sold for s in sales)
    total_rev = sum((s.unit_price or prod.price or 0.0) * s.quantity_sold for s in sales)
    daily_vel = max(0.5, round(total_units / 30.0, 2)) if total_units > 0 else 0.5
    days_inv = round(avail_stock / daily_vel, 1) if daily_vel > 0 else 99.0

    # Supplier comparison
    sup_eval = evaluate_suppliers_for_product(db, prod.name)

    return {
        "id": prod.id,
        "name": prod.name,
        "category": prod.category,
        "category_id": prod.category_id,
        "sku": prod.sku,
        "brand": prod.brand or "Standard",
        "price": prod.price or 0.0,
        "cost_price": prod.cost_price or 0.0,
        "description": prod.description or "",
        "image_url": prod.image_url or "",
        "status": prod.status or "active",
        "reorder_point": prod.reorder_point or 15,
        "safety_stock": prod.safety_stock or 10,
        "lead_time_days": prod.lead_time_days or 5,
        "specifications": prod.specifications or "{}",
        "created_at": prod.created_at,
        "updated_at": prod.updated_at,
        "current_stock": curr_stock,
        "reserved_stock": reserved_stock,
        "available_stock": avail_stock,
        "stock_status": "Out of Stock" if avail_stock == 0 else ("Low Stock" if avail_stock <= prod.reorder_point else "Healthy"),
        "days_of_inventory": days_inv,
        "daily_velocity": daily_vel,
        "total_sales_units": total_units,
        "total_revenue": round(total_rev, 2),
        "suppliers_count": len(sup_eval.get("all_suppliers", [])),
        "suppliers_comparison": sup_eval.get("all_suppliers", [])
    }

@router.post("/", response_model=ProductResponse)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    sku_normalized = data.sku.strip().upper()
    existing = db.query(Product).filter(Product.sku == sku_normalized).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Product with SKU '{sku_normalized}' already exists.")

    new_product = Product(
        name=data.name.strip(),
        category=data.category.strip(),
        category_id=data.category_id,
        sku=sku_normalized,
        brand=data.brand or "Standard",
        price=data.price,
        cost_price=data.cost_price or 0.0,
        description=data.description or "",
        image_url=data.image_url or "",
        status=data.status or "active",
        reorder_point=data.reorder_point or 15,
        safety_stock=data.safety_stock or 10,
        lead_time_days=data.lead_time_days or 5,
        specifications=data.specifications or "{}"
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    # Initialize inventory record automatically for new product
    inv = Inventory(
        product_id=new_product.id,
        current_stock=0,
        reorder_level=new_product.reorder_point,
        safety_stock=new_product.safety_stock
    )
    db.add(inv)
    db.commit()

    log_audit_event(
        db=db,
        user_email=admin.email,
        action="PRODUCT_CREATED",
        entity="Product",
        entity_id=new_product.id,
        new_state={"sku": new_product.sku, "name": new_product.name, "price": new_product.price}
    )

    return new_product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found.")

    old_state = {"sku": prod.sku, "price": prod.price, "reorder_point": prod.reorder_point}

    if data.sku is not None:
        sku_norm = data.sku.strip().upper()
        if sku_norm != prod.sku:
            existing = db.query(Product).filter(Product.sku == sku_norm).first()
            if existing:
                raise HTTPException(status_code=400, detail="SKU already in use.")
            prod.sku = sku_norm

    if data.name is not None:
        prod.name = data.name.strip()
    if data.category is not None:
        prod.category = data.category.strip()
    if data.category_id is not None:
        prod.category_id = data.category_id
    if data.brand is not None:
        prod.brand = data.brand
    if data.price is not None:
        prod.price = data.price
    if data.cost_price is not None:
        prod.cost_price = data.cost_price
    if data.description is not None:
        prod.description = data.description
    if data.image_url is not None:
        prod.image_url = data.image_url
    if data.status is not None:
        prod.status = data.status
    if data.reorder_point is not None:
        prod.reorder_point = data.reorder_point
    if data.safety_stock is not None:
        prod.safety_stock = data.safety_stock
    if data.lead_time_days is not None:
        prod.lead_time_days = data.lead_time_days
    if data.specifications is not None:
        prod.specifications = data.specifications

    db.commit()
    db.refresh(prod)

    log_audit_event(
        db=db,
        user_email=admin.email,
        action="PRODUCT_UPDATED",
        entity="Product",
        entity_id=prod.id,
        previous_state=old_state,
        new_state={"sku": prod.sku, "price": prod.price, "reorder_point": prod.reorder_point}
    )

    return prod

@router.delete("/{product_id}", response_model=StandardResponse)
def archive_or_delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found.")

    # Check for historical sales linkage -> Archive instead of hard delete
    has_sales = db.query(Sale).filter(Sale.product_id == product_id).count() > 0

    if has_sales:
        prod.status = "archived"
        db.commit()
        log_audit_event(
            db=db,
            user_email=admin.email,
            action="PRODUCT_ARCHIVED",
            entity="Product",
            entity_id=product_id,
            new_state={"status": "archived"}
        )
        return StandardResponse(message="Product has historical sales records. It has been safely archived.")
    else:
        db.delete(prod)
        db.commit()
        log_audit_event(
            db=db,
            user_email=admin.email,
            action="PRODUCT_DELETED",
            entity="Product",
            entity_id=product_id
        )
        return StandardResponse(message=f"Product {product_id} deleted successfully.")
