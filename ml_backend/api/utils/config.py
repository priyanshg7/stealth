import os

class Settings:
    PROJECT_NAME: str = "KisanMitra Disease Classification API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Path to models
    MODELS_DIR: str = os.getenv("MODELS_DIR", "models")
    
settings = Settings()
