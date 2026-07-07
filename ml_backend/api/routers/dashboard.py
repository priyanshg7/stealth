from fastapi import APIRouter
from api.services.dashboard_service import dashboard_service

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard API"])

@router.get("/overview")
def get_dashboard_overview():
    return dashboard_service.get_overview()
