$projectRoot = $PSScriptRoot
$backendPath = Join-Path $projectRoot 'backend'
$frontendPath = Join-Path $projectRoot 'frontend'

Start-Process powershell.exe -ArgumentList @(
    '-NoExit'
    '-Command'
    "Set-Location -LiteralPath '$backendPath'; php artisan serve --host=192.168.100.147"
)

Start-Process powershell.exe -ArgumentList @(
    '-NoExit'
    '-Command'
    "Set-Location -LiteralPath '$frontendPath'; npm.cmd start"
)

Write-Host 'Backend and frontend terminals started.' -ForegroundColor Green
