# Copies REACT_APP_API_URL from OOP/.env into both frontend apps.

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$source = Join-Path $root ".env"

if (-not (Test-Path $source)) {
  Write-Error "Missing file: $source"
  exit 1
}

$line = Get-Content $source | Where-Object { $_ -match '^\s*REACT_APP_API_URL\s*=' } | Select-Object -First 1
if (-not $line) {
  Write-Error "REACT_APP_API_URL not found in .env"
  exit 1
}

$targets = @(
  (Join-Path $root "oop-app\.env"),
  (Join-Path $root "oopAdmin\webinar-admin\.env")
)

foreach ($target in $targets) {
  $dir = Split-Path -Parent $target
  if (-not (Test-Path $dir)) {
    Write-Warning "Skip missing dir: $dir"
    continue
  }

  if (Test-Path $target) {
    $content = Get-Content $target
    $updated = $false
    $newContent = $content | ForEach-Object {
      if ($_ -match '^\s*REACT_APP_API_URL\s*=') {
        $updated = $true
        $line
      } else {
        $_
      }
    }
    if (-not $updated) {
      $newContent = @($line) + $newContent
    }
    Set-Content -Path $target -Value $newContent -Encoding utf8
  } else {
    Set-Content -Path $target -Value $line -Encoding utf8
  }

  Write-Host "Updated: $target"
}

Write-Host "Done. Restart npm start for both frontends."
