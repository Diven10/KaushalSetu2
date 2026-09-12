# Starts the KaushalSetu API on http://localhost:8000
Set-Location "$PSScriptRoot\backend"
if (-not (Test-Path .env)) {
    Write-Host "backend\.env is missing. Copy backend\.env.example to backend\.env first."
    exit 1
}
python -m uvicorn app.main:app --reload --port 8000
