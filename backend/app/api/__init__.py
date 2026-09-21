from app.api.v1 import api_v1_router

# api_router serves as legacy/compatibility router pointing to the same endpoints
api_router = api_v1_router

__all__ = ["api_v1_router", "api_router"]
