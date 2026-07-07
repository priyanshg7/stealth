from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from api.routers import diagnosis, system
from api.middleware.logging import log_requests
from api.utils.config import settings
import api.events.handlers # Register handlers

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production Inference Pipeline for Crop Diseases",
    version=settings.VERSION
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(BaseHTTPMiddleware, dispatch=log_requests)

# Include Routers
app.include_router(diagnosis.router)
app.include_router(system.router)
