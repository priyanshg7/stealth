@echo off
echo Starting KisanMitra ML Backend Pipeline...
cd ml_backend
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
