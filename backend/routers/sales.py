from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models.sales import Sale
from models.product import Product
from models.inventory import Inventory

from schemas.sales import (
    SaleCreate,
    SaleResponse,
    BatchOrderCreate,
    EnrichedSaleResponse
)


router = APIRouter(
    prefix="/sales",
    tags=["Sales"]
)


@router.post("/", response_model=SaleResponse)
def create_sale(
    sale: SaleCreate,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == sale.product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    sale_date = sale.sale_date or date.today()
    new_sale = Sale(
        product_id=sale.product_id,
        quantity_sold=sale.quantity_sold,
        sale_date=sale_date
    )

    # Decrement inventory if available
    inv = db.query(Inventory).filter(Inventory.product_id == sale.product_id).first()
    if inv:
        inv.current_stock = max(0, inv.current_stock - sale.quantity_sold)

    db.add(new_sale)
    db.commit()
    db.refresh(new_sale)

    return new_sale


@router.post("/checkout")
def checkout_cart(
    order: BatchOrderCreate,
    db: Session = Depends(get_db)
):
    if not order.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    created_sales = []
    total_amount = 0.0
    order_items_summary = []

    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            continue

        sale_entry = Sale(
            product_id=product.id,
            quantity_sold=item.quantity,
            sale_date=date.today()
        )
        db.add(sale_entry)

        # Decrement inventory
        inv = db.query(Inventory).filter(Inventory.product_id == product.id).first()
        if inv:
            inv.current_stock = max(0, inv.current_stock - item.quantity)

        item_total = (product.price or 0.0) * item.quantity
        total_amount += item_total
        order_items_summary.append({
            "product_id": product.id,
            "product_name": product.name,
            "quantity": item.quantity,
            "unit_price": product.price or 0.0,
            "total_price": item_total
        })

    db.commit()

    total_inr = round(order.amount_inr if order.amount_inr is not None else (total_amount * 83.0), 2)
    method = (order.payment_method or "UPI").upper()
    
    if "UPI" in method:
        txn_id = f"UPI/UTR/{int(date.today().strftime('%Y%m%d'))}/{abs(hash(str(total_amount))) % 900000 + 100000}"
    elif "CARD" in method or "RUPAY" in method:
        txn_id = f"RUPAY-TXN-{int(date.today().strftime('%Y%m%d'))}-{abs(hash(str(total_amount))) % 900000 + 100000}"
    elif "NET" in method or "BANK" in method:
        txn_id = f"NB-REF-{int(date.today().strftime('%Y%m%d'))}-{abs(hash(str(total_amount))) % 900000 + 100000}"
    else:
        txn_id = f"COD-IN-{int(date.today().strftime('%Y%m%d'))}-{abs(hash(str(total_amount))) % 90000 + 10000}"

    return {
        "status": "success",
        "order_id": f"ORD-{int(date.today().strftime('%Y%m%d'))}-{len(order_items_summary)}",
        "customer_name": order.customer_name,
        "shipping_address": order.shipping_address,
        "total_amount": round(total_amount, 2),
        "total_inr": total_inr,
        "payment_method": order.payment_method or "UPI",
        "payment_currency": order.payment_currency or "INR",
        "transaction_id": txn_id,
        "items": order_items_summary,
        "date": str(date.today()),
        "message": "Order placed successfully in Indian Rupees (₹) and supply chain inventory updated."
    }



@router.get("/", response_model=list[SaleResponse])
def get_sales(
    db: Session = Depends(get_db)
):
    return db.query(Sale).order_by(Sale.id.desc()).all()


@router.get("/detailed", response_model=list[EnrichedSaleResponse])
def get_detailed_sales(
    db: Session = Depends(get_db)
):
    results = db.query(Sale, Product).join(
        Product, Sale.product_id == Product.id
    ).order_by(Sale.id.desc()).all()

    detailed_list = []
    for sale, prod in results:
        price = prod.price or 0.0
        detailed_list.append({
            "id": sale.id,
            "product_id": prod.id,
            "product_name": prod.name,
            "category": prod.category,
            "unit_price": price,
            "quantity_sold": sale.quantity_sold,
            "total_revenue": round(price * sale.quantity_sold, 2),
            "sale_date": sale.sale_date
        })
    return detailed_list


@router.get("/analytics")
def get_sales_analytics(
    db: Session = Depends(get_db)
):
    results = db.query(Sale, Product).join(
        Product, Sale.product_id == Product.id
    ).all()

    total_revenue = sum((prod.price or 0.0) * sale.quantity_sold for sale, prod in results)
    total_units_sold = sum(sale.quantity_sold for sale, prod in results)

    # Group by category
    category_map = {}
    for sale, prod in results:
        cat = prod.category
        if cat not in category_map:
            category_map[cat] = {"category": cat, "units": 0, "revenue": 0.0}
        category_map[cat]["units"] += sale.quantity_sold
        category_map[cat]["revenue"] += (prod.price or 0.0) * sale.quantity_sold

    return {
        "total_revenue": round(total_revenue, 2),
        "total_units_sold": total_units_sold,
        "total_orders": len(results),
        "category_breakdown": list(category_map.values())
    }


@router.get("/{product_id}", response_model=list[SaleResponse])
def get_product_sales(
    product_id: int,
    db: Session = Depends(get_db)
):
    return db.query(Sale).filter(
        Sale.product_id == product_id
    ).all()