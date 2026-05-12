$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
. "$root\set-env.ps1"
Set-Location "$root"

try {
  $wslIp = (wsl -d Ubuntu-24.04 -u root -- bash -lc "hostname -I | awk '{print `$1}'").Trim()
  if ($wslIp) {
    $env:ICT_PROMETHEUS_WSL_BASE_URL = "http://$wslIp`:19090"
    Write-Host "ICT_PROMETHEUS_WSL_BASE_URL=$env:ICT_PROMETHEUS_WSL_BASE_URL"
  }
} catch {
  Write-Host "WSL Prometheus URL was not detected: $($_.Exception.Message)"
}

& "$env:MAVEN_HOME\bin\mvn.cmd" -pl backend spring-boot:run
