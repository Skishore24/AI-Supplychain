from fastapi import APIRouter

from api.routes.auth import router as auth_router
from api.routes.users import router as users_router
from api.routes.organizations import router as organizations_router
from api.routes.products import router as products_router
from api.routes.categories import router as categories_router
from api.routes.inventory import router as inventory_router
from api.routes.warehouses import router as warehouses_router
from api.routes.suppliers import router as suppliers_router
from api.routes.orders import router as orders_router
from api.routes.sales import router as sales_router
from api.routes.purchase_orders import router as purchase_orders_router
from api.routes.ai import router as ai_router
from api.routes.knowledge import router as knowledge_router
from api.routes.forecast import router as forecast_router
from api.routes.alerts import router as alerts_router
from api.routes.analytics import router as analytics_router
from api.routes.notifications import router as notifications_router
from api.routes.audit_logs import router as audit_logs_router
from api.routes.settings import router as settings_router
from api.routes.jobs import router as jobs_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(organizations_router)
api_v1_router.include_router(products_router)
api_v1_router.include_router(categories_router)
api_v1_router.include_router(inventory_router)
api_v1_router.include_router(warehouses_router)
api_v1_router.include_router(suppliers_router)
api_v1_router.include_router(orders_router)
api_v1_router.include_router(sales_router)
api_v1_router.include_router(purchase_orders_router)
api_v1_router.include_router(ai_router)
api_v1_router.include_router(knowledge_router)
api_v1_router.include_router(forecast_router)
api_v1_router.include_router(alerts_router)
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(notifications_router)
api_v1_router.include_router(audit_logs_router)
api_v1_router.include_router(settings_router)
api_v1_router.include_router(jobs_router)

@api_v1_router.get("/health")
def api_v1_health():
    from core.config import settings
    return {
        "status": "healthy",
        "api_version": "v1",
        "platform_version": settings.VERSION,
        "database": "postgresql" if "postgresql" in settings.DATABASE_URL else "sqlite"
    }

__all__ = ["api_v1_router"]
