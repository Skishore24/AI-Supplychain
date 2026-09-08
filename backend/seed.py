"""
Controlled Idempotent Database Seed Script
Populates benchmark categories, products, inventory, suppliers, supplier quotes,
purchase orders, historical sales, and standard authentication users.
"""
import sys
from pathlib import Path
from datetime import date, timedelta, datetime, timezone

# Ensure backend root on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from db.session import SessionLocal, engine
from core.security import get_password_hash
import models
from models.user import User
from models.category import Category
from models.warehouse import Warehouse
from models.product import Product
from models.supplier import Supplier
from models.supplier_product import SupplierProduct
from models.inventory import Inventory
from models.sales import Sale
from models.order import Order, OrderItem
from models.purchase_order import PurchaseOrder, PurchaseOrderItem
from models.system import Notification, AuditLog

def seed():
    db = SessionLocal()
    print("Starting controlled enterprise database seeding...")

    # 1. System Administrator
    users_data = [
        {
            "email": "admin@emox.ai",
            "password": "admin123",
            "full_name": "Alex Vance",
            "role": "admin",
            "phone": "+1 (555) 019-2831",
            "address": "450 Innovation Blvd, Enterprise Suite 10, Austin TX 78701"
        }
    ]

    for u in users_data:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if not existing:
            db.add(User(
                email=u["email"],
                hashed_password=get_password_hash(u["password"]),
                full_name=u["full_name"],
                role=u["role"],
                phone=u["phone"],
                address=u["address"],
                is_active=True
            ))
    db.commit()
    print("[OK] System Administrator verified (admin@emox.ai)")

    # 2. Warehouses
    warehouses_data = [
        {"name": "Central Distribution Center #1", "code": "CDC-01", "location": "Austin, Texas", "capacity": 100000},
        {"name": "East Coast Logistics Hub", "code": "ECL-02", "location": "Atlanta, Georgia", "capacity": 75000},
        {"name": "West Coast Express Depot", "code": "WCE-03", "location": "Reno, Nevada", "capacity": 50000}
    ]
    for w in warehouses_data:
        existing = db.query(Warehouse).filter(Warehouse.code == w["code"]).first()
        if not existing:
            db.add(Warehouse(
                name=w["name"],
                code=w["code"],
                location=w["location"],
                capacity=w["capacity"]
            ))
    db.commit()
    primary_warehouse = db.query(Warehouse).filter(Warehouse.code == "CDC-01").first()
    print("[OK] Warehouses seeded")

    # 3. Categories
    categories_data = [
        {
            "name": "Energy & Batteries",
            "slug": "energy-batteries",
            "description": "High-density lithium cells, BMS modules, and industrial battery packs.",
            "image_url": "https://images.unsplash.com/photo-1619725002198-6a689b72f41d?w=800&auto=format&fit=crop&q=80"
        },
        {
            "name": "Semiconductors",
            "slug": "semiconductors",
            "description": "32-bit ARM RISC microcontrollers, FPGA processors, and power management ICs.",
            "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80"
        },
        {
            "name": "Displays & Optoelectronics",
            "slug": "displays-optoelectronics",
            "description": "High-contrast SPI OLED panels, IPS TFT displays, and camera sensors.",
            "image_url": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80"
        },
        {
            "name": "Motors & Actuators",
            "slug": "motors-actuators",
            "description": "High-torque brushless DC motors, precision servos, and stepper drivers.",
            "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80"
        },
        {
            "name": "Thermal & Mechanical",
            "slug": "thermal-mechanical",
            "description": "Extruded aluminum heatsinks, cooling fans, and structural brackets.",
            "image_url": "https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=800&auto=format&fit=crop&q=80"
        },
        {
            "name": "Sensors & IoT",
            "slug": "sensors-iot",
            "description": "Industrial temperature, humidity, pressure, and multi-axis IMU sensors.",
            "image_url": "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&auto=format&fit=crop&q=80"
        }
    ]
    cat_map = {}
    for c in categories_data:
        existing = db.query(Category).filter(Category.slug == c["slug"]).first()
        if not existing:
            cat_obj = Category(name=c["name"], slug=c["slug"], description=c["description"], image_url=c["image_url"])
            db.add(cat_obj)
            db.commit()
            db.refresh(cat_obj)
            cat_map[c["name"]] = cat_obj.id
        else:
            existing.image_url = c["image_url"]
            db.commit()
            cat_map[c["name"]] = existing.id
    print("[OK] Product Categories seeded")

    # 4. Products
    products_data = [
        {
            "name": "Lithium-Ion Battery Pack 5000mAh",
            "category": "Energy & Batteries",
            "sku": "BAT-LI-5000",
            "brand": "VoltTech",
            "price": 45.99,
            "cost_price": 32.00,
            "description": "High-density rechargeable lithium polymer module for IoT gateways and portable robotic systems.",
            "image_url": "https://images.unsplash.com/photo-1619725002198-6a689b72f41d?w=800&auto=format&fit=crop&q=80",
            "reorder_point": 20,
            "safety_stock": 10,
            "lead_time_days": 4,
            "stock": 4 # Intentionally low for demo alert
        },
        {
            "name": "Microcontroller ARM Cortex-M4",
            "category": "Semiconductors",
            "sku": "MCU-ARM-M4",
            "brand": "SiliconNexus",
            "price": 12.50,
            "cost_price": 8.20,
            "description": "32-bit low-power RISC processor with integrated ADC, hardware FPU, and cryptographic acceleration.",
            "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
            "reorder_point": 25,
            "safety_stock": 15,
            "lead_time_days": 3,
            "stock": 65
        },
        {
            "name": "OLED Display 1.54-inch SPI",
            "category": "Displays & Optoelectronics",
            "sku": "DSP-OLED-154",
            "brand": "OptiVision",
            "price": 8.75,
            "cost_price": 5.40,
            "description": "Ultra-sharp 128x64 graphic OLED panel with dual SPI/I2C communication interface.",
            "image_url": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80",
            "reorder_point": 15,
            "safety_stock": 10,
            "lead_time_days": 3,
            "stock": 1 # Intentionally critical stockout risk
        },
        {
            "name": "Brushless DC Motor 24V",
            "category": "Motors & Actuators",
            "sku": "MTR-BLDC-24V",
            "brand": "TorqueMotion",
            "price": 38.00,
            "cost_price": 26.50,
            "description": "Industrial high-torque brushless DC motor with integrated Hall-effect sensor feedback.",
            "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
            "reorder_point": 12,
            "safety_stock": 8,
            "lead_time_days": 5,
            "stock": 24
        },
        {
            "name": "Aluminum Heat Sink 40x40mm",
            "category": "Thermal & Mechanical",
            "sku": "THM-AL-4040",
            "brand": "ThermalCore",
            "price": 3.20,
            "cost_price": 1.75,
            "description": "Anodized aluminum extruded cooling heatsink for high-current power MOSFETs and processors.",
            "image_url": "https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=800&auto=format&fit=crop&q=80",
            "reorder_point": 30,
            "safety_stock": 20,
            "lead_time_days": 3,
            "stock": 140
        },
        {
            "name": "Digital Temperature & Humidity Sensor",
            "category": "Sensors & IoT",
            "sku": "SNS-TH-DIGI",
            "brand": "PrecisionSensors",
            "price": 6.40,
            "cost_price": 3.80,
            "description": "Factory-calibrated digital temperature and relative humidity sensor with high noise immunity.",
            "image_url": "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&auto=format&fit=crop&q=80",
            "reorder_point": 18,
            "safety_stock": 12,
            "lead_time_days": 4,
            "stock": 7 # Low stock warning
        }
    ]

    prod_map = {}
    for p in products_data:
        existing = db.query(Product).filter(Product.sku == p["sku"]).first()
        cat_id = cat_map.get(p["category"])
        if not existing:
            prod_obj = Product(
                name=p["name"],
                category=p["category"],
                category_id=cat_id,
                sku=p["sku"],
                brand=p["brand"],
                price=p["price"],
                cost_price=p["cost_price"],
                description=p["description"],
                image_url=p.get("image_url", ""),
                reorder_point=p["reorder_point"],
                safety_stock=p["safety_stock"],
                lead_time_days=p["lead_time_days"],
                status="active"
            )
            db.add(prod_obj)
            db.commit()
            db.refresh(prod_obj)
            prod_map[p["sku"]] = prod_obj
        else:
            existing.cost_price = p["cost_price"]
            existing.reorder_point = p["reorder_point"]
            existing.safety_stock = p["safety_stock"]
            existing.lead_time_days = p["lead_time_days"]
            existing.image_url = p.get("image_url", "")
            db.commit()
            prod_map[p["sku"]] = existing

        # Inventory record
        p_item = prod_map[p["sku"]]
        inv = db.query(Inventory).filter(Inventory.product_id == p_item.id).first()
        if not inv:
            inv_obj = Inventory(
                product_id=p_item.id,
                warehouse_id=primary_warehouse.id if primary_warehouse else None,
                current_stock=p["stock"],
                reserved_stock=0,
                reorder_level=p["reorder_point"],
                safety_stock=p["safety_stock"],
                last_restocked_at=datetime.now(timezone.utc)
            )
            db.add(inv_obj)
        else:
            inv.current_stock = p["stock"]
            inv.reorder_level = p["reorder_point"]
            inv.safety_stock = p["safety_stock"]
        db.commit()

    print("[OK] Products & Warehouse Inventory levels seeded")

    # 5. Certified Suppliers
    suppliers_data = [
        {"name": "VoltTech Energy Ltd", "product_name": "Lithium-Ion Battery Pack 5000mAh", "price": 31.50, "quality_score": 96.0, "delivery_days": 3, "reliability_score": 98.0, "category": "Energy & Batteries", "email": "sales@volttech.com"},
        {"name": "Apex Power Systems", "product_name": "Lithium-Ion Battery Pack 5000mAh", "price": 28.90, "quality_score": 88.0, "delivery_days": 7, "reliability_score": 89.0, "category": "Energy & Batteries", "email": "orders@apexpower.com"},
        {"name": "SiliconNexus Micro", "product_name": "Microcontroller ARM Cortex-M4", "price": 8.10, "quality_score": 97.0, "delivery_days": 2, "reliability_score": 99.0, "category": "Semiconductors", "email": "procure@siliconnexus.com"},
        {"name": "EastChip Foundry", "product_name": "Microcontroller ARM Cortex-M4", "price": 7.40, "quality_score": 84.0, "delivery_days": 9, "reliability_score": 85.0, "category": "Semiconductors", "email": "supply@eastchip.com"},
        {"name": "OptiVision Electronics", "product_name": "OLED Display 1.54-inch SPI", "price": 5.20, "quality_score": 94.0, "delivery_days": 4, "reliability_score": 93.0, "category": "Displays & Optoelectronics", "email": "sales@optivision.io"},
        {"name": "LumiDisplay Corp", "product_name": "OLED Display 1.54-inch SPI", "price": 5.80, "quality_score": 98.0, "delivery_days": 2, "reliability_score": 97.0, "category": "Displays & Optoelectronics", "email": "express@lumidisplay.com"},
        {"name": "TorqueMotion Global", "product_name": "Brushless DC Motor 24V", "price": 25.50, "quality_score": 95.0, "delivery_days": 5, "reliability_score": 96.0, "category": "Motors & Actuators", "email": "info@torquemotion.com"},
        {"name": "Dynamic Drive Mechanics", "product_name": "Brushless DC Motor 24V", "price": 27.00, "quality_score": 97.0, "delivery_days": 3, "reliability_score": 98.0, "category": "Motors & Actuators", "email": "support@dynamicdrive.com"},
        {"name": "ThermalCore Extrusions", "product_name": "Aluminum Heat Sink 40x40mm", "price": 1.65, "quality_score": 92.0, "delivery_days": 3, "reliability_score": 94.0, "category": "Thermal & Mechanical", "email": "orders@thermalcore.com"},
        {"name": "Precision Sensor Systems", "product_name": "Digital Temperature & Humidity Sensor", "price": 3.60, "quality_score": 96.0, "delivery_days": 3, "reliability_score": 97.0, "category": "Sensors & IoT", "email": "sales@precisionsensors.com"}
    ]

    sup_map = {}
    for s in suppliers_data:
        existing = db.query(Supplier).filter(Supplier.name == s["name"]).first()
        del_score = max(0.0, 100.0 - (s["delivery_days"] * 10.0))
        ovr = round((s["quality_score"] * 0.40) + (del_score * 0.30) + (s["reliability_score"] * 0.30), 1)

        if not existing:
            sup_obj = Supplier(
                name=s["name"],
                product_name=s["product_name"],
                price=s["price"],
                quality_score=s["quality_score"],
                delivery_days=s["delivery_days"],
                reliability_score=s["reliability_score"],
                category=s["category"],
                email=s["email"],
                overall_score=ovr,
                status="active"
            )
            db.add(sup_obj)
            db.commit()
            db.refresh(sup_obj)
            sup_map[s["name"]] = sup_obj
        else:
            existing.price = s["price"]
            existing.quality_score = s["quality_score"]
            existing.delivery_days = s["delivery_days"]
            existing.reliability_score = s["reliability_score"]
            existing.overall_score = ovr
            db.commit()
            sup_map[s["name"]] = existing

    print("[OK] Suppliers & Competitive Quotes seeded")

    # 6. Purchase Orders
    if db.query(PurchaseOrder).count() == 0 and "VoltTech Energy Ltd" in sup_map:
        vt = sup_map["VoltTech Energy Ltd"]
        bat_prod = prod_map["BAT-LI-5000"]

        po1 = PurchaseOrder(
            po_number=f"PO-{date.today().strftime('%Y%m%d')}-001",
            supplier_id=vt.id,
            status="pending_approval",
            total_cost=round(bat_prod.cost_price * 150, 2),
            expected_delivery=date.today() + timedelta(days=4),
            notes="AI Auto-Generated replenishment recommendation to mitigate battery module stockout.",
            created_by="Agent 2: Restock Analyzer"
        )
        db.add(po1)
        db.flush()

        db.add(PurchaseOrderItem(
            purchase_order_id=po1.id,
            product_id=bat_prod.id,
            quantity=150,
            received_quantity=0,
            unit_cost=bat_prod.cost_price,
            total_cost=round(bat_prod.cost_price * 150, 2)
        ))
        db.commit()
        print("[OK] Benchmark Purchase Orders seeded")

    # 7. Customer Orders & Historical Sales Records
    if db.query(Order).count() == 0:
        customer_user = db.query(User).filter(User.email == "customer@emox.ai").first()

        # Seed 14 days of realistic sales transactions
        for day_offset in range(14, 0, -1):
            sale_date = date.today() - timedelta(days=day_offset)

            # Daily sales batches
            daily_transactions = [
                ("BAT-LI-5000", 3),
                ("MCU-ARM-M4", 8),
                ("DSP-OLED-154", 5),
                ("MTR-BLDC-24V", 2),
                ("THM-AL-4040", 12),
                ("SNS-TH-DIGI", 4)
            ]

            order_subtotal = 0.0
            order_items_cache = []

            for sku, qty in daily_transactions:
                if sku in prod_map:
                    p = prod_map[sku]
                    tot = round(p.price * qty, 2)
                    order_subtotal += tot
                    order_items_cache.append((p, qty, tot))

            # Create an Order every 2 days
            if day_offset % 2 == 0:
                ord_no = f"ORD-{sale_date.strftime('%Y%m%d')}-{day_offset}"
                order_obj = Order(
                    order_number=ord_no,
                    customer_id=customer_user.id if customer_user else None,
                    customer_name="David Miller",
                    customer_email="customer@emox.ai",
                    shipping_address="88 Market St, San Francisco CA 94103",
                    payment_method="UPI",
                    payment_currency="INR",
                    payment_status="paid",
                    transaction_id=f"UPI-TXN-{sale_date.strftime('%Y%m%d')}-{day_offset}",
                    status="delivered" if day_offset > 3 else "shipped",
                    subtotal=order_subtotal,
                    tax=round(order_subtotal * 0.18, 2),
                    shipping_cost=0.0,
                    total_amount=round(order_subtotal * 1.18, 2),
                    created_at=datetime.combine(sale_date, datetime.min.time(), timezone.utc)
                )
                db.add(order_obj)
                db.flush()

                for p, qty, tot in order_items_cache:
                    db.add(OrderItem(
                        order_id=order_obj.id,
                        product_id=p.id,
                        product_name=p.name,
                        sku=p.sku,
                        quantity=qty,
                        unit_price=p.price,
                        total_price=tot
                    ))

            for p, qty, tot in order_items_cache:
                db.add(Sale(
                    product_id=p.id,
                    quantity_sold=qty,
                    sale_date=sale_date,
                    unit_price=p.price,
                    total_amount=tot,
                    currency="INR",
                    transaction_ref=f"TXN-{sale_date.strftime('%Y%m%d')}"
                ))

        db.commit()
        print("[OK] Historical Customer Orders & Sales Ledger seeded")

    # 8. Notifications
    if db.query(Notification).count() == 0:
        db.add(Notification(
            title="CRITICAL: Low Stock on OLED Displays",
            message="OLED Display 1.54-inch SPI has reached 1 unit remaining. Immediate replenishment required.",
            type="low_stock",
            severity="critical",
            link_url="/admin/inventory"
        ))
        db.add(Notification(
            title="AI Reorder Draft Ready",
            message="Restock Analyzer prepared Purchase Order PO-20260907-001 for Lithium-Ion battery modules.",
            type="ai_alert",
            severity="warning",
            link_url="/admin/purchase-orders"
        ))
        db.commit()
        print("[OK] System Notifications seeded")

    # 9. Audit Log
    import json
    db.add(AuditLog(
        user_email="system@emox.ai",
        action="DATABASE_SEEDED",
        entity="System",
        entity_id="0",
        new_state=json.dumps({"status": "Production-ready benchmark records initialized"})
    ))
    db.commit()

    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed()
