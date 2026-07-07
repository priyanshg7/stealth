import pytest
from api.db.database import Base, engine, SessionLocal
from api.db.models import DiagnosisCase, DiagnosisHistory, PlannerTask, Notification
from api.services.case_manager import case_manager
from api.schemas.decision import PlannerTask as SchemaPlannerTask
import api.events.handlers # Register handlers

# Initialize DB for tests
Base.metadata.create_all(bind=engine)

@pytest.fixture
def db():
    db_session = SessionLocal()
    yield db_session
    db_session.close()
    
def test_create_case_workflow(db):
    farm_id = "test_farm_123"
    disease = "wheat_rust"
    confidence = 0.92
    
    tasks = [
        SchemaPlannerTask(task="Spray", priority="High", recommended_date="Day 0", estimated_duration="2h", category="Action", reason="Cure")
    ]
    
    case = case_manager.create_case(farm_id, disease, confidence, tasks)
    
    assert case is not None
    assert case.disease == disease
    assert case.farm_id == farm_id
    
    # Verify History
    history = db.query(DiagnosisHistory).filter(DiagnosisHistory.case_id == case.id).all()
    assert len(history) == 1
    assert history[0].event_type == "Diagnosis"
    
    # Verify Planner
    db_tasks = db.query(PlannerTask).filter(PlannerTask.case_id == case.id).all()
    assert len(db_tasks) == 1
    assert db_tasks[0].task == "Spray"
    
def test_process_followup(db):
    # Creating a test case
    case = case_manager.create_case("farm_xyz", "rice_blast", 0.88, [])
    
    # Scenario 1: Recovered
    result = case_manager.process_followup(case.id, "healthy", 0.95, "Looks good", farmer_id="farmer_abc")
    assert result == "Recovered"
    
    db_case = db.query(DiagnosisCase).filter(DiagnosisCase.id == case.id).first()
    assert db_case.status == "Recovered"
    
    # Check if notification was published via Event Bus
    notifications = db.query(Notification).filter(Notification.farmer_id == "farmer_abc").all()
    assert len(notifications) > 0
    
    # Scenario 2: Escalated
    case2 = case_manager.create_case("farm_xyz", "rice_blast", 0.88, [])
    result2 = case_manager.process_followup(case2.id, "rice_brown_spot", 0.90, "Spread to brown spot", farmer_id="farmer_abc")
    assert result2 == "Escalated"
    db_case2 = db.query(DiagnosisCase).filter(DiagnosisCase.id == case2.id).first()
    assert db_case2.status == "Escalated"
