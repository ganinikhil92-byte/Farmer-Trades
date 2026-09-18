@echo off
title Agro Trades - Backend Server
echo ===================================================
echo Starting Karnataka Agro Trades FastAPI Backend
echo Port: 8000
echo ===================================================
cd /d "%~dp0backend"
if exist ".\venv\Scripts\python.exe" (
    .\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
) else (
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
)
pause
