# Ralph Loop — Autonomous Self-Healing Verification Runner (PowerShell)
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "          RALPH LOOP: AUTONOMOUS VERIFICATION          " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$failures = 0

# 1. Backend Syntax & Integrity Check
Write-Host "[1/2] Verifying Backend Python Syntax..." -ForegroundColor Yellow
$pyOutput = & "backend\venv\Scripts\python.exe" -m py_compile backend\main.py backend\routes.py backend\database.py backend\db_models.py backend\auth.py 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Backend syntax verification failed:" -ForegroundColor Red
    Write-Host $pyOutput -ForegroundColor Red
    $failures++
} else {
    Write-Host "[PASS] Backend code syntax is clean." -ForegroundColor Green
}
Write-Host ""

# 2. Frontend TypeScript Build Check
Write-Host "[2/2] Verifying Frontend TypeScript Compilation..." -ForegroundColor Yellow
Push-Location frontend
$npmOutput = & npm run build 2>&1
$frontendExit = $LASTEXITCODE
Pop-Location

if ($frontendExit -ne 0) {
    Write-Host "[FAIL] Frontend build verification failed:" -ForegroundColor Red
    Write-Host $npmOutput -ForegroundColor Red
    $failures++
} else {
    Write-Host "[PASS] Frontend build compiled successfully." -ForegroundColor Green
}
Write-Host ""

Write-Host "========================================================" -ForegroundColor Cyan
if ($failures -eq 0) {
    Write-Host "[RALPH LOOP] ALL CHECKS PASSED: SYSTEM IS GREEN!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "[RALPH LOOP] FAILURES DETECTED: PLEASE SELF-HEAL AND RETRY." -ForegroundColor Red
    exit 1
}
