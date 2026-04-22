from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import settings


def create_app() -> FastAPI:
    app = FastAPI(
        title="Price Calculator Next API",
        version="0.1.0",
        description="新一代云产品价格计算平台后端骨架。",
    )
    app.include_router(api_router, prefix="/api")
    return app


app = create_app()
