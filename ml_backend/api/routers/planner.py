from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/api/v1/planner", tags=["Planner"])

@router.post("/tasks")
def add_planner_tasks(payload: Dict[str, Any]):
    """
    Mock endpoint to add tasks to the planner.
    In a real system, this would write to a planner database table.
    """
    return {"status": "success", "message": "Tasks added successfully"}
