from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.middleware.cors import CORSMiddleware
import os

from api.routers import diagnosis, system
from api.middleware.logging import log_requests
from api.utils.config import settings
import api.events.handlers  # Register event handlers

def create_app() -> FastAPI:
    """
    Application factory for KisanMitra ML Backend.
    Configures middleware, routes, event handlers, and global exception handlers.
    """
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description="Production Inference & Risk Assessment Pipeline for Crop Diseases",
        version=settings.VERSION,
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # Configure CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS if hasattr(settings, 'CORS_ORIGINS') else ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Configure Request Logging Middleware
    app.add_middleware(BaseHTTPMiddleware, dispatch=log_requests)

    # Register API Routers
    app.include_router(diagnosis.router)
    app.include_router(system.router)

    return app

app = create_app()
