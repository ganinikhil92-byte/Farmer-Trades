@echo off
echo ========================================================
echo           RALPH LOOP: AUTONOMOUS VERIFICATION
echo ========================================================
echo.

set FAILURES=0

:: 1. Backend Python Syntax & AST Check
echo [1/2] Verifying Backend Python Syntax...
call "backend\venv\Scripts\python.exe" -c "import ast, sys; [ast.parse(open(f, encoding='utf-8').read()) for f in ['backend/main.py', 'backend/routes.py', 'backend/database.py', 'backend/db_models.py', 'backend/auth.py']]; print('All backend modules passed AST parse cleanly.')"
if errorlevel 1 (
    echo [FAIL] Backend syntax verification failed!
    set FAILURES=1
) else (
    echo [PASS] Backend code syntax is clean.
)
echo.

:: 2. Frontend TypeScript Compilation Check
echo [2/2] Verifying Frontend TypeScript Compilation...
call npx --prefix frontend tsc --noEmit --project frontend/tsconfig.app.json
if errorlevel 1 (
    echo [FAIL] Frontend TypeScript verification failed!
    set FAILURES=1
) else (
    echo [PASS] Frontend TypeScript compiled with 0 errors.
)
echo.

echo ========================================================
if "%FAILURES%"=="0" (
    echo [RALPH LOOP] ALL CHECKS PASSED: SYSTEM IS GREEN!
    exit /b 0
)
echo [RALPH LOOP] FAILURES DETECTED: PLEASE SELF-HEAL AND RETRY.
exit /b 1
