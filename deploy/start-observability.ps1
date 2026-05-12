$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

docker compose up -d redis prometheus blackbox-exporter node-exporter
docker compose ps

Write-Host ""
Write-Host "Redis:      127.0.0.1:6379"
Write-Host "Prometheus: http://127.0.0.1:9090"
Write-Host "Blackbox:   http://127.0.0.1:9115"
Write-Host "Node exp:   http://127.0.0.1:9100/metrics"
