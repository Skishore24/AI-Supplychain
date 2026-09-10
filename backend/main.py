import logging
import time
from collections import defaultdict
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.base import BaseHTTPMiddleware

from core.config import settings
from db.session import engine
import models
from models import Base
from api import api_router, api_v1_router

# Ensure all database schema tables exist
Base.metadata.create_all(bind=engine)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("supply_chain_app")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise Multi-Tenant AI Supply Chain Intelligence, Inventory Optimization & SaaS Operations Platform",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# 1. Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# 2. Rate Limiting Middleware (Sliding Window in-memory)
class RateLimiterMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests: int = 150, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        # Only rate limit sensitive paths
        path = request.url.path
        if "/auth/login" in path or "/ai/chat" in path or "/upload" in path:
            client_ip = request.client.host if request.client else "127.0.0.1"
            now = time.time()
            timestamps = self.requests[client_ip]
            # Prune old timestamps
            self.requests[client_ip] = [ts for ts in timestamps if now - ts < self.window_seconds]
            
            # Stricter limit on login (30 per min)
            limit = 30 if "/auth/login" in path else self.max_requests
            if len(self.requests[client_ip]) >= limit:
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "success": False,
                        "message": "Too many requests. Please slow down and try again shortly.",
                        "code": "RATE_LIMIT_EXCEEDED",
                        "details": {"retry_after_seconds": 30}
                    }
                )
            self.requests[client_ip].append(now)

        return await call_next(request)

app.add_middleware(RateLimiterMiddleware)

# 3. CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Unified Structured Error Handling
@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": str(exc.detail),
            "code": f"HTTP_{exc.status_code}",
            "details": {}
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Input validation failed. Please check submitted fields.",
            "code": "VALIDATION_ERROR",
            "details": {"errors": exc.errors()}
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An internal server error occurred.",
            "code": "INTERNAL_SERVER_ERROR",
            "details": {}
        }
    )

# 5. Mount API Routers
# Mount Versioned v1 Router at /api/v1
app.include_router(api_v1_router, prefix="/api/v1")

# Mount Backwards-Compatible Legacy Router at /api
app.include_router(api_router, prefix=settings.API_PREFIX)

@app.get("/")
def home():
    return {
        "message": "Enterprise Multi-Tenant AI Supply Chain Platform is operational",
        "status": "success",
        "version": settings.VERSION,
        "api_v1": "/api/v1",
        "api_legacy": settings.API_PREFIX,
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "database": "postgresql" if "postgresql" in settings.DATABASE_URL else "sqlite"
    }

@app.post("/seed-data")
def trigger_seed():
    """
    Triggers controlled enterprise database seeding.
    """
    from seed import seed
    try:
        seed()
        return {
            "status": "success",
            "message": "Enterprise database seeded with benchmark supply chain records and organizations."
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Seeding failed: {str(e)}"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)