from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import date, timedelta

from database import Base, engine, get_db
from models.product import Product
from models.supplier import Supplier
from models.inventory import Inventory
from models.sales import Sale

from routers.recommendations import router as recommendation_router
from routers.products import router as product_router
from routers.suppliers import router as supplier_router
from routers.inventory import router as inventory_router
from routers.sales import router as sales_router

# Ensure tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Multi-Agent Supply Chain AI",
    description="AI-powered supply chain management, inventory tracking, and decision support system",
    version="1.0.0"
)

# Enable CORS for frontend web client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(product_router)
app.include_router(supplier_router)
app.include_router(inventory_router)
app.include_router(sales_router)
app.include_router(recommendation_router)


@app.get("/")
def home():
    return {
        "message": "Multi-Agent Supply Chain AI is running",
        "status": "success",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.post("/seed-data")
def seed_database(db: Session = Depends(get_db)):
    """
    Seeds initial sample supply chain products, suppliers, inventory, and sales data.
    """
    # Sample products
    sample_products = [
        {"name": "Lithium-Ion Battery Pack 5000mAh", "category": "Energy & Batteries", "sku": "BAT-LI-5000", "price": 45.99, "description": "High-density rechargeable lithium battery module for IoT & industrial devices."},
        {"name": "Microcontroller ARM Cortex-M4", "category": "Semiconductors", "sku": "MCU-ARM-M4", "price": 12.50, "description": "32-bit low-power RISC processor with integrated ADC and cryptographic acceleration."},
        {"name": "OLED Display 1.54-inch SPI", "category": "Displays & Optoelectronics", "sku": "DSP-OLED-154", "price": 8.75, "description": "High-contrast 128x64 graphic OLED display panel with SPI/I2C communication."},
        {"name": "Brushless DC Motor 24V", "category": "Motors & Actuators", "sku": "MTR-BLDC-24V", "price": 38.00, "description": "Precision high-torque brushless DC motor with Hall sensor feedback."},
        {"name": "Aluminum Heat Sink 40x40mm", "category": "Thermal & Mechanical", "sku": "THM-AL-4040", "price": 3.20, "description": "Anodized aluminum extruded cooling heatsink for power ICs."},
        {"name": "Smart Temperature & Humidity Sensor", "category": "Sensors", "sku": "SNS-TH-DIGI", "price": 6.40, "description": "High-precision digital temperature and humidity sensor with I2C interface."}
    ]

    for p in sample_products:
        existing = db.query(Product).filter(Product.sku == p["sku"]).first()
        if not existing:
            prod_obj = Product(
                name=p["name"],
                category=p["category"],
                sku=p["sku"],
                price=p["price"],
                description=p["description"]
            )
            db.add(prod_obj)
    db.commit()

    # Get created products
    all_products = db.query(Product).all()
    prod_map = {p.sku: p.id for p in all_products}

    # Sample Suppliers
    sample_suppliers = [
        {"name": "VoltTech Energy Ltd", "product_name": "Lithium-Ion Battery Pack 5000mAh", "price": 42.00, "quality_score": 94.0, "delivery_days": 4},
        {"name": "Apex Power Systems", "product_name": "Lithium-Ion Battery Pack 5000mAh", "price": 39.50, "quality_score": 88.0, "delivery_days": 7},
        {"name": "SiliconNexus Micro", "product_name": "Microcontroller ARM Cortex-M4", "price": 11.20, "quality_score": 96.0, "delivery_days": 3},
        {"name": "EastChip Foundry", "product_name": "Microcontroller ARM Cortex-M4", "price": 9.80, "quality_score": 85.0, "delivery_days": 10},
        {"name": "OptiVision Electronics", "product_name": "OLED Display 1.54-inch SPI", "price": 7.90, "quality_score": 92.0, "delivery_days": 5},
        {"name": "LumiDisplay Corp", "product_name": "OLED Display 1.54-inch SPI", "price": 8.40, "quality_score": 98.0, "delivery_days": 2},
        {"name": "TorqueMotion Global", "product_name": "Brushless DC Motor 24V", "price": 34.00, "quality_score": 95.0, "delivery_days": 6},
        {"name": "Dynamic Drive Mechanics", "product_name": "Brushless DC Motor 24V", "price": 36.50, "quality_score": 97.0, "delivery_days": 3},
        {"name": "ThermalCore Extrusions", "product_name": "Aluminum Heat Sink 40x40mm", "price": 2.80, "quality_score": 90.0, "delivery_days": 3},
        {"name": "Precision Sensor Systems", "product_name": "Smart Temperature & Humidity Sensor", "price": 5.75, "quality_score": 95.0, "delivery_days": 4}
    ]

    for s in sample_suppliers:
        existing_sup = db.query(Supplier).filter(
            Supplier.name == s["name"],
            Supplier.product_name == s["product_name"]
        ).first()
        if not existing_sup:
            db.add(Supplier(
                name=s["name"],
                product_name=s["product_name"],
                price=s["price"],
                quality_score=s["quality_score"],
                delivery_days=s["delivery_days"]
            ))
    db.commit()

    # Sample Inventory
    sample_inventory = [
        {"sku": "BAT-LI-5000", "stock": 4, "reorder": 10}, # Low stock
        {"sku": "MCU-ARM-M4", "stock": 45, "reorder": 20},
        {"sku": "DSP-OLED-154", "stock": 1, "reorder": 15}, # Low stock / critical
        {"sku": "MTR-BLDC-24V", "stock": 18, "reorder": 10},
        {"sku": "THM-AL-4040", "stock": 120, "reorder": 30},
        {"sku": "SNS-TH-DIGI", "stock": 8, "reorder": 12} # Low stock
    ]

    for inv_item in sample_inventory:
        p_id = prod_map.get(inv_item["sku"])
        if p_id:
            existing_inv = db.query(Inventory).filter(Inventory.product_id == p_id).first()
            if not existing_inv:
                db.add(Inventory(
                    product_id=p_id,
                    current_stock=inv_item["stock"],
                    reorder_level=inv_item["reorder"]
                ))
    db.commit()

    # Sample Sales History
    if db.query(Sale).count() == 0:
        for i in range(1, 8):
            sale_date = date.today() - timedelta(days=i)
            if "BAT-LI-5000" in prod_map:
                db.add(Sale(product_id=prod_map["BAT-LI-5000"], quantity_sold=3, sale_date=sale_date))
            if "MCU-ARM-M4" in prod_map:
                db.add(Sale(product_id=prod_map["MCU-ARM-M4"], quantity_sold=8, sale_date=sale_date))
            if "DSP-OLED-154" in prod_map:
                db.add(Sale(product_id=prod_map["DSP-OLED-154"], quantity_sold=5, sale_date=sale_date))
            if "MTR-BLDC-24V" in prod_map:
                db.add(Sale(product_id=prod_map["MTR-BLDC-24V"], quantity_sold=2, sale_date=sale_date))
        db.commit()

    return {
        "status": "success",
        "message": "Database seeded with sample supply chain records successfully.",
        "products_count": db.query(Product).count(),
        "suppliers_count": db.query(Supplier).count(),
        "inventory_count": db.query(Inventory).count(),
        "sales_count": db.query(Sale).count()
    }