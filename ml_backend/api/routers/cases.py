from fastapi import APIRouter, HTTPException
from typing import List
from api.services.case_manager import case_manager
from api.schemas.case import Case, CaseDetails
from api.schemas.followup import FollowUpRequest, FollowUpResponse

router = APIRouter(prefix="/api/v1/cases", tags=["Case Management"])

@router.get("", response_model=List[Case])
def get_active_cases():
    return case_manager.get_all_cases()

@router.get("/{case_id}", response_model=Case)
def get_case(case_id: str):
    case = case_manager.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@router.post("/{case_id}/followup", response_model=FollowUpResponse)
def post_followup(case_id: str, request: FollowUpRequest):
    case = case_manager.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    # In a full flow, we would run inference on a newly uploaded image here.
    # For now, we rely on the farmer's observation parameter in FollowUpRequest.
    
    current_disease = case.case_details.disease # Placeholder unless image is run
    
    condition = case_manager.process_followup(
        case_id, 
        current_disease=current_disease, 
        confidence=case.case_details.confidence,
        farmer_notes=request.farmer_notes
    )
    
    return FollowUpResponse(
        case_id=case_id,
        previous_disease=case.case_details.disease,
        current_disease=current_disease,
        condition_evaluation=condition,
        message=f"Case status updated to {condition} based on feedback.",
        new_planner_tasks=[] # Would be populated if disease escalated
    )
