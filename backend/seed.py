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

try:
    from app.db.session import SessionLocal, engine
    from app.core.security import get_password_hash
    import app.models as models
    from app.models.organization import Organization, OrganizationMembership
    from app.models.user import User
    from app.models.category import Category
    from app.models.warehouse import Warehouse
    from app.models.product import Product
    from app.models.supplier import Supplier
    from app.models.supplier_product import SupplierProduct
    from app.models.inventory import Inventory
    from app.models.sales import Sale
    from app.models.order import Order, OrderItem
    from app.models.purchase_order import PurchaseOrder, PurchaseOrderItem
    from app.models.system import Notification, AuditLog
except ImportError:
    from db.session import SessionLocal, engine
    from core.security import get_password_hash
    import models
    from models.organization import Organization, OrganizationMembership
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

    # 0. Organizations
    orgs_data = [
        {"name": "Global Supply Chain Corp", "slug": "global-supply", "plan": "enterprise"},
        {"name": "Apex Advanced Manufacturing", "slug": "apex-mfg", "plan": "professional"}
    ]
    for od in orgs_data:
        existing_org = db.query(Organization).filter(Organization.slug == od["slug"]).first()
        if not existing_org:
            db.add(Organization(name=od["name"], slug=od["slug"], plan=od["plan"], is_active=True))
    db.commit()
    default_org = db.query(Organization).filter(Organization.slug == "global-supply").first()
    default_org_id = default_org.id if default_org else 1
    print(f"[OK] Organizations verified (Default Org ID: {default_org_id})")

    # 1. System Administrator
    users_data = [
        {
            "email": "admin@emox.ai",
            "password": "admin123",
            "full_name": "Alex Vance",
            "role": "SUPER_ADMIN",
            "phone": "+1 (555) 019-2831",
            "address": "450 Innovation Blvd, Enterprise Suite 10, Austin TX 78701"
        },
        {
            "email": "manager@emox.ai",
            "password": "manager123",
            "full_name": "Sarah Connor",
            "role": "MANAGER",
            "phone": "+1 (555) 019-2832",
            "address": "450 Innovation Blvd, Suite 12, Austin TX 78701"
        },
        {
            "email": "analyst@emox.ai",
            "password": "analyst123",
            "full_name": "David Miller",
            "role": "ANALYST",
            "phone": "+1 (555) 019-2833",
            "address": "450 Innovation Blvd, Suite 14, Austin TX 78701"
        }
    ]

    for u in users_data:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if not existing:
            user_obj = User(
                email=u["email"],
                hashed_password=get_password_hash(u["password"]),
                full_name=u["full_name"],
                role=u["role"],
                organization_id=default_org_id,
                phone=u["phone"],
                address=u["address"],
                is_active=True
            )
            db.add(user_obj)
            db.flush()
            db.add(OrganizationMembership(
                user_id=user_obj.id,
                organization_id=default_org_id,
                role=u["role"]
            ))
        else:
            if not existing.organization_id:
                existing.organization_id = default_org_id
            membership = db.query(OrganizationMembership).filter(
                OrganizationMembership.user_id == existing.id,
                OrganizationMembership.organization_id == default_org_id
            ).first()
            if not membership:
                db.add(OrganizationMembership(
                    user_id=existing.id,
                    organization_id=default_org_id,
                    role=existing.role or "ORG_ADMIN"
                ))
    db.commit()
    print("[OK] System Administrators and Roles verified (admin@emox.ai)")

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
            "name": "Smartphones & Mobiles",
            "slug": "smartphones-mobiles",
            "description": "Flagship 5G smartphones, pro multi-lens cameras, and next-generation mobile devices.",
            "image_url": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80"
        },
        {
            "name": "Laptops & Computers",
            "slug": "laptops-computers",
            "description": "High-performance AI creator workstations, ultra-slim laptops, and gaming rigs.",
            "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80"
        },
        {
            "name": "Tablets & E-Readers",
            "slug": "tablets-ereaders",
            "description": "Ultra Retina OLED tablets, precision stylus digitizers, and portable productivity tools.",
            "image_url": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80"
        },
        {
            "name": "Audio & Wearables",
            "slug": "audio-wearables",
            "description": "Industry-leading active noise-canceling headphones, spatial earbuds, and smartwatches.",
            "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
        },
        {
            "name": "Accessories & Power",
            "slug": "accessories-power",
            "description": "Next-gen GaN multi-port fast chargers, Thunderbolt 4 docking stations, and MagSafe accessories.",
            "image_url": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80"
        },
        {
            "name": "Smart Home & IoT",
            "slug": "smart-home-iot",
            "description": "Intelligent smart displays, Wi-Fi 7 mesh routers, and automated home IoT hubs.",
            "image_url": "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80"
        },
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
            existing.description = c["description"]
            db.commit()
            cat_map[c["name"]] = existing.id
    print("[OK] Product Categories seeded")

    # 4. Products (Premier Consumer Electronics + Industrial Benchmark)
    import json
    products_data = [
        # --- SMARTPHONES & MOBILES ---
        {
            "name": "Apple iPhone 15 Pro Max 256GB",
            "category": "Smartphones & Mobiles",
            "sku": "PHN-APL-15PM",
            "brand": "Apple",
            "price": 1199.00,
            "cost_price": 890.00,
            "description": "Natural Titanium finish with A17 Pro 3nm chip, customizable Action button, and 48MP Pro camera system with 5x Optical Zoom.",
            "image_url": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80",
            "reorder_point": 15,
            "safety_stock": 10,
            "lead_time_days": 3,
            "stock": 28,
            "specifications": json.dumps({
                "Display": "6.7-inch Super Retina XDR OLED ProMotion 120Hz",
                "Processor": "Apple A17 Pro (3nm)",
                "Storage": "256GB NVMe",
                "Camera": "48MP Main + 12MP Ultra-Wide + 12MP 5x Telephoto",
                "Battery": "Up to 29 hours video playback",
                "Connectivity": "5G, Wi-Fi 6E, USB-C 10Gbps"
            })
        },
        {
            "name": "Samsung Galaxy S24 Ultra 512GB",
            "category": "Smartphones & Mobiles",
            "sku": "PHN-SAM-S24U",
            "brand": "Samsung",
            "price": 1299.00,
            "cost_price": 920.00,
            "description": "Titanium Gray with built-in S Pen, Snapdragon 8 Gen 3 for Galaxy, Galaxy AI Live Translate, and 200MP Quad Telephoto zoom camera.",
            "image_url": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
            "reorder_point": 15,
            "safety_stock": 10,
            "lead_time_days": 3,
            "stock": 32,
            "specifications": json.dumps({
                "Display": "6.8-inch QHD+ Dynamic AMOLED 2X 2600 nits",
                "Processor": "Snapdragon 8 Gen 3 Mobile Platform",
                "Storage": "512GB UFS 4.0",
                "Camera": "200MP Main + 50MP 5x + 10MP 3x + 12MP Ultra-Wide",
                "Battery": "5000mAh, 45W Fast Charging",
                "S Pen": "Embedded Bluetooth stylus"
            })
        },
        {
            "name": "Google Pixel 8 Pro 128GB",
            "category": "Smartphones & Mobiles",
            "sku": "PHN-GGL-8PRO",
            "brand": "Google",
            "price": 999.00,
            "cost_price": 710.00,
            "description": "Obsidian finish powered by Google Tensor G3, full AI computational suite with Best Take, Magic Audio Eraser, and temperature sensor.",
            "image_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
            "reorder_point": 12,
            "safety_stock": 8,
            "lead_time_days": 4,
            "stock": 18,
            "specifications": json.dumps({
                "Display": "6.7-inch Super Actua LTPO OLED 120Hz",
                "Processor": "Google Tensor G3 with Titan M2",
                "Storage": "128GB UFS 3.1",
                "Camera": "50MP Octa PD + 48MP Quad PD Telephoto 5x",
                "Battery": "5050mAh, 30W Fast Charge"
            })
        },
        {
            "name": "OnePlus 12 5G 16GB/512GB",
            "category": "Smartphones & Mobiles",
            "sku": "PHN-OPL-125G",
            "brand": "OnePlus",
            "price": 799.00,
            "cost_price": 580.00,
            "description": "Silky Black powerhouse with Snapdragon 8 Gen 3, 16GB LPDDR5X RAM, 4th Gen Hasselblad Camera System, and 100W SUPERVOOC charging.",
            "image_url": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80",
            "reorder_point": 10,
            "safety_stock": 6,
            "lead_time_days": 4,
            "stock": 24,
            "specifications": json.dumps({
                "Display": "6.82-inch 2K 120Hz ProXDR with Aqua Touch",
                "Processor": "Qualcomm Snapdragon 8 Gen 3",
                "RAM/Storage": "16GB RAM / 512GB Storage",
                "Battery": "5400mAh dual-cell with 100W wired & 50W wireless",
                "Camera": "Sony LYT-808 50MP + 64MP 3x Periscope"
            })
        },

        # --- LAPTOPS & COMPUTERS ---
        {
            "name": "Apple MacBook Pro 16\" M3 Max",
            "category": "Laptops & Computers",
            "sku": "LAP-APL-MBP16",
            "brand": "Apple",
            "price": 3499.00,
            "cost_price": 2650.00,
            "description": "Space Black flagship laptop with 16-core CPU, 40-core GPU, 36GB Unified Memory, 1TB SSD, and Liquid Retina XDR display.",
            "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
            "reorder_point": 8,
            "safety_stock": 5,
            "lead_time_days": 5,
            "stock": 12,
            "specifications": json.dumps({
                "Chip": "Apple M3 Max (16-core CPU, 40-core GPU, 16-core Neural Engine)",
                "Memory": "36GB Unified Memory",
                "Storage": "1TB NVMe PCIe SSD",
                "Display": "16.2-inch Liquid Retina XDR (3456x2234, 1600 nits peak, 120Hz)",
                "Battery": "Up to 22 hours battery life",
                "Ports": "3x Thunderbolt 4, HDMI, SDXC, MagSafe 3"
            })
        },
        {
            "name": "Dell XPS 15 9530 OLED",
            "category": "Laptops & Computers",
            "sku": "LAP-DEL-XPS15",
            "brand": "Dell",
            "price": 2499.00,
            "cost_price": 1850.00,
            "description": "CNC machined aluminum chassis with 15.6\" 3.5K OLED InfinityEdge touch display, Intel Core i9-13900H, RTX 4070, and 32GB DDR5.",
            "image_url": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80",
            "reorder_point": 8,
            "safety_stock": 5,
            "lead_time_days": 4,
            "stock": 16,
            "specifications": json.dumps({
                "Processor": "13th Gen Intel Core i9-13900H (14 cores, up to 5.4 GHz)",
                "Graphics": "NVIDIA GeForce RTX 4070 8GB GDDR6",
                "Memory": "32GB DDR5-4800MHz",
                "Storage": "1TB PCIe NVMe SSD",
                "Display": "15.6\" 3.5K (3456x2160) OLED Touch Anti-Reflect 400 nits"
            })
        },
        {
            "name": "Lenovo ThinkPad X1 Carbon Gen 12",
            "category": "Laptops & Computers",
            "sku": "LAP-LNV-X1C12",
            "brand": "Lenovo",
            "price": 1899.00,
            "cost_price": 1380.00,
            "description": "Ultralight carbon-fiber business laptop with Intel Core Ultra 7 155H with integrated NPU AI engine, 32GB LPDDR5X, and 2.8K 120Hz OLED.",
            "image_url": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",
            "reorder_point": 10,
            "safety_stock": 6,
            "lead_time_days": 4,
            "stock": 20,
            "specifications": json.dumps({
                "Processor": "Intel Core Ultra 7 155H with Intel AI Boost NPU",
                "Memory": "32GB LPDDR5X-7500MHz",
                "Storage": "1TB PCIe Gen4 Performance SSD",
                "Display": "14.0\" 2.8K (2880x1800) OLED 120Hz DisplayHDR 500",
                "Weight": "1.09 kg (2.42 lbs)"
            })
        },
        {
            "name": "ASUS ROG Zephyrus G16 Gaming Laptop",
            "category": "Laptops & Computers",
            "sku": "LAP-ASU-ROG16",
            "brand": "ASUS",
            "price": 2699.00,
            "cost_price": 2050.00,
            "description": "Ultra-thin aluminum gaming powerhouse with 16\" 2.5K 240Hz ROG Nebula OLED, Intel Core Ultra 9, NVIDIA GeForce RTX 4080, and Slash Lighting.",
            "image_url": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80",
            "reorder_point": 8,
            "safety_stock": 5,
            "lead_time_days": 6,
            "stock": 3, # Low stock alert
            "specifications": json.dumps({
                "Processor": "Intel Core Ultra 9 185H (16 cores, 5.1 GHz)",
                "Graphics": "NVIDIA GeForce RTX 4080 12GB GDDR6",
                "Memory": "32GB LPDDR5X-7467",
                "Display": "16\" 2.5K OLED 240Hz 0.2ms G-SYNC 100% DCI-P3",
                "Storage": "1TB PCIe 4.0 NVMe M.2 SSD"
            })
        },

        # --- TABLETS & E-READERS ---
        {
            "name": "Apple iPad Pro 13\" M4 256GB",
            "category": "Tablets & E-Readers",
            "sku": "TAB-APL-IPD13",
            "brand": "Apple",
            "price": 1299.00,
            "cost_price": 960.00,
            "description": "Impossibly thin 5.1mm design with Apple M4 chip, Ultra Retina XDR Tandem OLED display, and Apple Pencil Pro support.",
            "image_url": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80",
            "reorder_point": 10,
            "safety_stock": 6,
            "lead_time_days": 4,
            "stock": 22,
            "specifications": json.dumps({
                "Display": "13.0\" Tandem OLED Ultra Retina XDR 1000 nits full-screen",
                "Processor": "Apple M4 Chip (9-core CPU, 10-core GPU, 16-core NPU)",
                "Storage": "256GB High-Speed Flash",
                "Camera": "12MP Wide with LiDAR Scanner, Landscape 12MP Ultra-Wide Front",
                "Thickness": "5.1 mm"
            })
        },
        {
            "name": "Samsung Galaxy Tab S9 Ultra 256GB",
            "category": "Tablets & E-Readers",
            "sku": "TAB-SAM-S9U",
            "brand": "Samsung",
            "price": 1199.00,
            "cost_price": 850.00,
            "description": "Massive 14.6\" Dynamic AMOLED 2X 120Hz display with Armor Aluminum casing, IP68 water resistance, and included S Pen.",
            "image_url": "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80",
            "reorder_point": 8,
            "safety_stock": 5,
            "lead_time_days": 4,
            "stock": 14,
            "specifications": json.dumps({
                "Display": "14.6\" Dynamic AMOLED 2X 120Hz HDR10+",
                "Processor": "Qualcomm Snapdragon 8 Gen 2 for Galaxy",
                "Memory/Storage": "12GB RAM / 256GB UFS (MicroSD up to 1TB)",
                "Protection": "IP68 Water and Dust Resistance"
            })
        },

        # --- AUDIO & WEARABLES ---
        {
            "name": "Sony WH-1000XM5 Wireless Headphones",
            "category": "Audio & Wearables",
            "sku": "AUD-SNY-XM5",
            "brand": "Sony",
            "price": 399.00,
            "cost_price": 260.00,
            "description": "Silver premium over-ear headphones with 8 microphones, Dual Noise Sensor technology, Auto NC Optimizer, and 30-hour battery life.",
            "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
            "reorder_point": 20,
            "safety_stock": 12,
            "lead_time_days": 3,
            "stock": 45,
            "specifications": json.dumps({
                "Noise Canceling": "HD Noise Canceling Processor QN1 + V1 Integrated Processor",
                "Battery Life": "Up to 30 hours with ANC on (3 min charge = 3 hours)",
                "Audio Codecs": "LDAC, AAC, SBC with DSEE Extreme AI upscaling",
                "Driver": "30mm precision carbon fiber composite dome"
            })
        },
        {
            "name": "Apple AirPods Pro 2nd Gen USB-C",
            "category": "Audio & Wearables",
            "sku": "AUD-APL-APP2",
            "brand": "Apple",
            "price": 249.00,
            "cost_price": 165.00,
            "description": "Up to 2x more Active Noise Cancellation, Adaptive Audio, Transparency mode, Personalized Spatial Audio with dynamic head tracking, and USB-C MagSafe case.",
            "image_url": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80",
            "reorder_point": 25,
            "safety_stock": 15,
            "lead_time_days": 3,
            "stock": 60,
            "specifications": json.dumps({
                "Chip": "Apple H2 Headphone chip, Apple U1 in MagSafe Case",
                "Audio": "Custom high-excursion Apple driver + custom high dynamic range amplifier",
                "Battery": "6 hours listening on single charge (30 hours with case)",
                "Case": "MagSafe Charging Case (USB-C) with speaker and lanyard loop"
            })
        },
        {
            "name": "Apple Watch Ultra 2 49mm",
            "category": "Audio & Wearables",
            "sku": "WRB-APL-WAT2",
            "brand": "Apple",
            "price": 799.00,
            "cost_price": 570.00,
            "description": "Rugged 49mm aerospace titanium case with flat sapphire front crystal, 3000-nit Always-On Retina display, S9 SiP chip, and precision dual-frequency GPS.",
            "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
            "reorder_point": 10,
            "safety_stock": 6,
            "lead_time_days": 4,
            "stock": 2, # Critical low stock alert
            "specifications": json.dumps({
                "Case": "49mm Titanium, 100m Water Resistant, EN13319 Dive Certified",
                "Display": "3000 nits Sapphire Crystal Always-On OLED",
                "Chip": "Apple S9 SiP with 4-core Neural Engine and Double Tap gesture",
                "Battery": "Up to 36 hours standard use (72 hours in Low Power Mode)"
            })
        },
        {
            "name": "Bose QuietComfort Ultra Earbuds",
            "category": "Audio & Wearables",
            "sku": "AUD-BOS-QCU",
            "brand": "Bose",
            "price": 299.00,
            "cost_price": 190.00,
            "description": "Breakthrough spatialized audio with Bose Immersive Audio, world-class noise cancellation, and CustomTune technology for personalized sound.",
            "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
            "reorder_point": 15,
            "safety_stock": 8,
            "lead_time_days": 3,
            "stock": 30,
            "specifications": json.dumps({
                "Technology": "Bose Immersive Audio & CustomTune Sound Calibration",
                "Battery": "Up to 6 hours (up to 24 hours total with charging case)",
                "Bluetooth": "Bluetooth 5.3 with Snapdragon Sound (aptX Adaptive)"
            })
        },

        # --- ACCESSORIES & POWER ---
        {
            "name": "Anker Prime 100W GaN Fast Charger",
            "category": "Accessories & Power",
            "sku": "ACC-ANK-100W",
            "brand": "Anker",
            "price": 84.99,
            "cost_price": 48.00,
            "description": "Ultra-compact 3-port GaN charger (2 USB-C, 1 USB-A) with 100W max output, ActiveShield 2.0 safety, capable of fast-charging a 16\" MacBook Pro.",
            "image_url": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
            "reorder_point": 30,
            "safety_stock": 20,
            "lead_time_days": 3,
            "stock": 85,
            "specifications": json.dumps({
                "Total Output": "100W Max (Single port up to 100W USB-PD 3.0)",
                "Ports": "2x USB-C + 1x USB-A",
                "Technology": "GaNPrime (Gallium Nitride) with PowerIQ 4.0",
                "Protection": "ActiveShield 2.0 intelligent temperature monitoring"
            })
        },
        {
            "name": "CalDigit TS4 Thunderbolt 4 Dock",
            "category": "Accessories & Power",
            "sku": "ACC-CDT-TS4",
            "brand": "CalDigit",
            "price": 399.99,
            "cost_price": 280.00,
            "description": "Ultimate 18-port Thunderbolt 4 workstation hub with 98W host charging, 2.5GbE Ethernet, 8x USB ports, UHS-II SD/microSD slots, and dual display support.",
            "image_url": "https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800&auto=format&fit=crop&q=80",
            "reorder_point": 10,
            "safety_stock": 6,
            "lead_time_days": 5,
            "stock": 18,
            "specifications": json.dumps({
                "Ports": "18 Ports total (3x Thunderbolt 4, 5x USB-A, 3x USB-C, 2.5GbE LAN)",
                "Power Delivery": "98W Power Delivery to host laptop",
                "Display Output": "Single 8K 60Hz or Dual 6K 60Hz displays"
            })
        },

        # --- INDUSTRIAL BENCHMARK (Preserved for compatibility) ---
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
            "stock": 4
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
            "stock": 1
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
            "stock": 7
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
                specifications=p.get("specifications", "{}"),
                organization_id=default_org_id,
                status="active"
            )
            db.add(prod_obj)
            db.commit()
            db.refresh(prod_obj)
            prod_map[p["sku"]] = prod_obj
        else:
            existing.cost_price = p["cost_price"]
            existing.price = p["price"]
            existing.reorder_point = p["reorder_point"]
            existing.safety_stock = p["safety_stock"]
            existing.lead_time_days = p["lead_time_days"]
            existing.image_url = p.get("image_url", "")
            existing.description = p["description"]
            if "specifications" in p:
                existing.specifications = p["specifications"]
            if not existing.organization_id:
                existing.organization_id = default_org_id
            db.commit()
            prod_map[p["sku"]] = existing

        # Inventory record
        p_item = prod_map[p["sku"]]
        inv = db.query(Inventory).filter(Inventory.product_id == p_item.id).first()
        if not inv:
            inv_obj = Inventory(
                product_id=p_item.id,
                warehouse_id=primary_warehouse.id if primary_warehouse else None,
                organization_id=default_org_id,
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
            if not inv.organization_id:
                inv.organization_id = default_org_id
        db.commit()

    print("[OK] Products & Warehouse Inventory levels seeded")

    # 5. Certified Suppliers (Tier 1 Consumer Electronics ODMs & Component Giants)
    suppliers_data = [
        # Electronics ODMs & Manufacturers
        {
            "name": "Foxconn Technology Group",
            "product_name": "Apple iPhone 15 Pro Max 256GB",
            "price": 875.00,
            "quality_score": 99.0,
            "delivery_days": 2,
            "reliability_score": 99.5,
            "category": "Smartphones & Mobiles",
            "email": "procurement@foxconn-global.com"
        },
        {
            "name": "Pegatron Electronics Corp",
            "product_name": "Apple iPhone 15 Pro Max 256GB",
            "price": 860.00,
            "quality_score": 95.0,
            "delivery_days": 5,
            "reliability_score": 96.0,
            "category": "Smartphones & Mobiles",
            "email": "b2b@pegatroncorp.com"
        },
        {
            "name": "Samsung Device Solutions",
            "product_name": "Samsung Galaxy S24 Ultra 512GB",
            "price": 905.00,
            "quality_score": 98.5,
            "delivery_days": 2,
            "reliability_score": 99.0,
            "category": "Smartphones & Mobiles",
            "email": "orders@samsungdevices.com"
        },
        {
            "name": "Quanta Computer International",
            "product_name": "Apple MacBook Pro 16\" M3 Max",
            "price": 2580.00,
            "quality_score": 99.2,
            "delivery_days": 3,
            "reliability_score": 99.0,
            "category": "Laptops & Computers",
            "email": "enterprise@quantatw.com"
        },
        {
            "name": "Compal Electronics ODM",
            "product_name": "Dell XPS 15 9530 OLED",
            "price": 1810.00,
            "quality_score": 96.5,
            "delivery_days": 4,
            "reliability_score": 97.0,
            "category": "Laptops & Computers",
            "email": "commercial@compal.com"
        },
        {
            "name": "Luxshare Precision Acoustics",
            "product_name": "Apple AirPods Pro 2nd Gen USB-C",
            "price": 158.00,
            "quality_score": 98.0,
            "delivery_days": 2,
            "reliability_score": 98.5,
            "category": "Audio & Wearables",
            "email": "sales@luxshare-ict.com"
        },
        {
            "name": "Sony Audio Systems Division",
            "product_name": "Sony WH-1000XM5 Wireless Headphones",
            "price": 250.00,
            "quality_score": 99.0,
            "delivery_days": 3,
            "reliability_score": 98.0,
            "category": "Audio & Wearables",
            "email": "direct@sonyproaudio.com"
        },
        {
            "name": "Anker Innovations Direct",
            "product_name": "Anker Prime 100W GaN Fast Charger",
            "price": 45.00,
            "quality_score": 97.0,
            "delivery_days": 2,
            "reliability_score": 98.0,
            "category": "Accessories & Power",
            "email": "supply@anker.com"
        },

        # Industrial Components
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
                organization_id=default_org_id,
                status="active"
            )
            db.add(sup_obj)
            db.commit()
            db.refresh(sup_obj)
            sup_map[s["name"]] = sup_obj
        else:
            existing.price = s["price"]
            existing.product_name = s["product_name"]
            existing.quality_score = s["quality_score"]
            existing.delivery_days = s["delivery_days"]
            existing.reliability_score = s["reliability_score"]
            existing.overall_score = ovr
            if not existing.organization_id:
                existing.organization_id = default_org_id
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
            organization_id=default_org_id,
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
