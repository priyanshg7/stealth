@echo off
echo Starting KisanMitra ML Backend Pipeline...
cd /d "%~dp0ml_backend"
if exist "..\.venv\Scripts\python.exe" (
    "..\.venv\Scripts\python.exe" -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
) else (
    python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
)

