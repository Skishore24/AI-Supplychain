from app.repositories.base import BaseRepository
from app.repositories.product_repo import product_repo, ProductRepository
from app.repositories.inventory_repo import inventory_repo, InventoryRepository
from app.repositories.supplier_repo import supplier_repo, SupplierRepository
from app.repositories.purchase_order_repo import purchase_order_repo, PurchaseOrderRepository

__all__ = [
    "BaseRepository",
    "product_repo",
    "ProductRepository",
    "inventory_repo",
    "InventoryRepository",
    "supplier_repo",
    "SupplierRepository",
    "purchase_order_repo",
    "PurchaseOrderRepository"
]
