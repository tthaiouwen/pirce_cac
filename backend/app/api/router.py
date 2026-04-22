from fastapi import APIRouter

from app.api.v1.endpoints import analytics, catalog, health, quotes

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(catalog.router, prefix="/catalog", tags=["catalog"])
api_router.include_router(quotes.router, prefix="/quotes", tags=["quotes"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
