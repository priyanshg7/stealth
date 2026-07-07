from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from api.db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Farmer(Base):
    __tablename__ = "farmers"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    farms = relationship("Farm", back_populates="farmer", cascade="all, delete-orphan")

class Farm(Base):
    __tablename__ = "farms"
    id = Column(String, primary_key=True, default=generate_uuid)
    farmer_id = Column(String, ForeignKey("farmers.id"), nullable=False)
    name = Column(String, nullable=False)
    crop = Column(String, nullable=False)
    area = Column(Float, nullable=False)
    area_unit = Column(String, nullable=False)
    location = Column(String)
    season = Column(String)
    current_crop_stage = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    farmer = relationship("Farmer", back_populates="farms")
    cases = relationship("DiagnosisCase", back_populates="farm", cascade="all, delete-orphan")

class DiagnosisCase(Base):
    __tablename__ = "diagnosis_cases"
    id = Column(String, primary_key=True, default=generate_uuid)
    farm_id = Column(String, ForeignKey("farms.id"), nullable=False)
    status = Column(String, default="Open") # Open, Monitoring, Recovered, Escalated, Closed
    disease = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    image_path = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    farm = relationship("Farm", back_populates="cases")
    history = relationship("DiagnosisHistory", back_populates="case", cascade="all, delete-orphan")
    treatments = relationship("Treatment", back_populates="case", cascade="all, delete-orphan")
    planner_tasks = relationship("PlannerTask", back_populates="case", cascade="all, delete-orphan")
    follow_ups = relationship("FollowUp", back_populates="case", cascade="all, delete-orphan")

class DiagnosisHistory(Base):
    __tablename__ = "diagnosis_history"
    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, ForeignKey("diagnosis_cases.id"), nullable=False)
    event_type = Column(String, nullable=False) # e.g. 'Status Change', 'Treatment Applied'
    description = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    case = relationship("DiagnosisCase", back_populates="history")

class Treatment(Base):
    __tablename__ = "treatments"
    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, ForeignKey("diagnosis_cases.id"), nullable=False)
    medicine = Column(String, nullable=False)
    cost = Column(Float)
    applied_on = Column(DateTime, nullable=True)
    status = Column(String, default="Suggested") # Suggested, Applied
    
    case = relationship("DiagnosisCase", back_populates="treatments")

class PlannerTask(Base):
    __tablename__ = "planner_tasks"
    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, ForeignKey("diagnosis_cases.id"), nullable=False)
    task = Column(String, nullable=False)
    category = Column(String, nullable=False)
    priority = Column(String, nullable=False)
    recommended_date = Column(DateTime, nullable=False)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    
    case = relationship("DiagnosisCase", back_populates="planner_tasks")

class FollowUp(Base):
    __tablename__ = "follow_ups"
    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, ForeignKey("diagnosis_cases.id"), nullable=False)
    farmer_notes = Column(Text)
    observed_symptoms = Column(Text)
    new_image_path = Column(String)
    new_disease_prediction = Column(String)
    confidence = Column(Float)
    evaluated_condition = Column(String) # Recovered, Improved, Worsened
    created_at = Column(DateTime, default=datetime.utcnow)
    
    case = relationship("DiagnosisCase", back_populates="follow_ups")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String, primary_key=True, default=generate_uuid)
    farmer_id = Column(String, ForeignKey("farmers.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    priority = Column(String, default="Low") # High, Medium, Low
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
