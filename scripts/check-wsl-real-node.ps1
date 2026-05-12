$ErrorActionPreference = "Continue"

$distro = "Ubuntu-24.04"
$ip = (wsl -d $distro -u root -- bash -lc "hostname -I | awk '{print `$1}'").Trim()

Write-Host "==== WSL process ===="
wsl -d $distro -u root -- bash -lc "pgrep -af node_exporter; pgrep -af '^/usr/local/bin/prometheus .*prometheus-wsl' || true"
Write-Host ""

Write-Host "==== WSL local query ===="
wsl -d $distro -u root -- bash -lc "curl -s http://127.0.0.1:19090/-/ready; echo; curl -s 'http://127.0.0.1:19090/api/v1/query?query=node_uname_info'"
Write-Host ""

Write-Host "==== Windows to WSL query ===="
Write-Host "WSL IP: $ip"
try {
  Invoke-RestMethod -Uri "http://$ip`:19090/api/v1/query?query=up" -TimeoutSec 8 | ConvertTo-Json -Depth 8
} catch {
  Write-Host "FAILED: $($_.Exception.Message)"
}
