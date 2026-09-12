# Opens all three panels, each in its own PowerShell window.
#   5173 Trainee Panel   5174 Employer Panel   5175 Government Portal
$root = $PSScriptRoot
foreach ($panel in @("trainee-panel", "employer-panel", "gov-portal")) {
    $path = Join-Path $root "frontend\$panel"
    if (-not (Test-Path (Join-Path $path "node_modules"))) {
        Write-Host "Installing dependencies for $panel ..."
        Start-Process -Wait -NoNewWindow -WorkingDirectory $path -FilePath "npm" -ArgumentList "install"
    }
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$path'; npm run dev"
}
