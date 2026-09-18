@echo off
title Start Agro Trades Fullstack
echo ===================================================
echo Starting Agro Trades (Backend + Frontend)
echo ===================================================

start "Agro Trades Backend" cmd /c "cd /d "%~dp0backend" && .\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
start "Agro Trades Frontend" cmd /c "cd /d "%~dp0frontend" && npm run dev"

echo Services launched:
echo   - Backend:  http://localhost:8000 (API: http://localhost:8000/api)
echo   - Frontend: http://localhost:5173
echo.
