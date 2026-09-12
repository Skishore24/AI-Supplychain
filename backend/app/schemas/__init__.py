from app.schemas.common import ApiResponse, PaginatedResponse, PaginatedMeta
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserOut
from app.schemas.organization import OrganizationCreate, OrganizationUpdate, OrganizationOut, OrganizationSwitchRequest
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut, ProductListItem
from app.schemas.inventory import InventoryAdjustRequest, InventoryOut, InventoryListItem
from app.schemas.supplier import SupplierCreate, SupplierUpdate, SupplierOut
from app.schemas.purchase_order import PurchaseOrderCreate, PurchaseOrderUpdate, PurchaseOrderOut, PurchaseOrderItemCreate
from app.schemas.sales import SaleCreate, SaleOut
from app.schemas.risk import RiskAlertOut, RiskRadarItem, RiskRadarResponse
from app.schemas.analytics import ExecutiveAnalyticsOverview, TopProductItem, CategoryBreakdownItem
from app.schemas.ai import (
    AIChatRequest,
    AIChatResponse,
    AIRecommendationItem,
    AIActionExecuteRequest,
    AIActionExecuteResponse
)

__all__ = [
    "ApiResponse",
    "PaginatedResponse",
    "PaginatedMeta",
    "LoginRequest",
    "RegisterRequest",
    "TokenResponse",
    "UserOut",
    "OrganizationCreate",
    "OrganizationUpdate",
    "OrganizationOut",
    "OrganizationSwitchRequest",
    "ProductCreate",
    "ProductUpdate",
    "ProductOut",
    "ProductListItem",
    "InventoryAdjustRequest",
    "InventoryOut",
    "InventoryListItem",
    "SupplierCreate",
    "SupplierUpdate",
    "SupplierOut",
    "PurchaseOrderCreate",
    "PurchaseOrderUpdate",
    "PurchaseOrderOut",
    "PurchaseOrderItemCreate",
    "SaleCreate",
    "SaleOut",
    "RiskAlertOut",
    "RiskRadarItem",
    "RiskRadarResponse",
    "ExecutiveAnalyticsOverview",
    "TopProductItem",
    "CategoryBreakdownItem",
    "AIChatRequest",
    "AIChatResponse",
    "AIRecommendationItem",
    "AIActionExecuteRequest",
    "AIActionExecuteResponse"
]
