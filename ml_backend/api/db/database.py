import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Connect to a local SQLite database for development, 
# easily swappable to PostgreSQL for production
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kisanmitra.db")

# In SQLite, we need connect_args={"check_same_thread": False} 
# because FastAPI can access the DB from multiple threads
engine_kwargs = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(SQLALCHEMY_DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
