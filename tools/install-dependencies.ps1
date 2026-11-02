$ErrorActionPreference = 'Stop'
$adminRoot = Split-Path -Parent $PSScriptRoot
$gitConfigRoot = Join-Path $adminRoot '.build-tools'
$priorXdgConfig = $env:XDG_CONFIG_HOME
Push-Location $adminRoot
try {
    $env:XDG_CONFIG_HOME = $gitConfigRoot
    npm install --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { throw 'npm install failed' }
} finally {
    $env:XDG_CONFIG_HOME = $priorXdgConfig
    Pop-Location
}
