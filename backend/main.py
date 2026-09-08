import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from core.config import settings
from db.session import engine
import models
from models import Base
from api import api_router

# Ensure all database schema tables exist
Base.metadata.create_all(bind=engine)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("supply_chain_app")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise Multi-Agent Supply Chain Intelligence, Inventory Optimization & E-Commerce Operations Platform",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Unified Structured Error Handling
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

# Mount Clean Centralized REST API Router
app.include_router(api_router, prefix=settings.API_PREFIX)

@app.get("/")
def home():
    return {
        "message": "Enterprise Multi-Agent Supply Chain AI is operational",
        "status": "success",
        "version": settings.VERSION,
        "api": settings.API_PREFIX,
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
            "message": "Enterprise database seeded with benchmark supply chain records."
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Seeding failed: {str(e)}"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)