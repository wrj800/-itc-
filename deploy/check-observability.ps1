$ErrorActionPreference = "Continue"

$checks = @(
  @{ Name = "Redis container"; Command = { docker exec ict-redis redis-cli ping } },
  @{ Name = "Prometheus ready"; Command = { Invoke-RestMethod -Uri "http://127.0.0.1:9090/-/ready" -TimeoutSec 5 } },
  @{ Name = "Node exporter metrics"; Command = { $c = (Invoke-WebRequest -Uri "http://127.0.0.1:9100/metrics" -TimeoutSec 5).Content; if ($c.Length -gt 120) { $c.Substring(0, 120) } else { $c } } },
  @{ Name = "Blackbox metrics"; Command = { $c = (Invoke-WebRequest -Uri "http://127.0.0.1:9115/metrics" -TimeoutSec 5).Content; if ($c.Length -gt 120) { $c.Substring(0, 120) } else { $c } } },
  @{ Name = "Prometheus query up"; Command = { Invoke-RestMethod -Uri "http://127.0.0.1:9090/api/v1/query?query=up" -TimeoutSec 5 | ConvertTo-Json -Depth 6 } }
)

foreach ($check in $checks) {
  Write-Host "==== $($check.Name) ===="
  try {
    & $check.Command
  } catch {
    Write-Host "FAILED: $($_.Exception.Message)"
  }
  Write-Host ""
}
