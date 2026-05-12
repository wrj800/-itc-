$ErrorActionPreference = "Stop"

$distro = "Ubuntu-24.04"

Write-Host "Starting real Linux node in WSL: $distro"
wsl -d $distro -u root -- /usr/local/bin/start-node-exporter.sh
wsl -d $distro -u root -- /usr/local/bin/start-prometheus-wsl.sh

$ip = (wsl -d $distro -u root -- bash -lc "hostname -I | awk '{print `$1}'").Trim()
$prometheusUrl = "http://$ip`:19090"
$nodeExporterUrl = "http://$ip`:19100/metrics"

Write-Host ""
Write-Host "WSL IP:              $ip"
Write-Host "Node exporter:       $nodeExporterUrl"
Write-Host "WSL Prometheus:      $prometheusUrl"
Write-Host "Prometheus query up: $prometheusUrl/api/v1/query?query=up"
Write-Host ""

try {
  Write-Host "Checking WSL Prometheus readiness..."
  Invoke-RestMethod -Uri "$prometheusUrl/-/ready" -TimeoutSec 8

  Write-Host "Checking real Linux node target..."
  Invoke-RestMethod -Uri "$prometheusUrl/api/v1/query?query=up" -TimeoutSec 8 | ConvertTo-Json -Depth 8
} catch {
  Write-Host "WSL service started, but Windows HTTP check failed: $($_.Exception.Message)"
  Write-Host "You can still verify inside WSL with:"
  Write-Host "wsl -d $distro -u root -- curl -s http://127.0.0.1:19090/api/v1/query?query=up"
}
