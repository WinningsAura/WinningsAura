$ErrorActionPreference = 'Stop'

$root = 'C:\Users\yagna\.openclaw\workspace\winnings-web'
$runDir = Join-Path $root '.run'
$outLog = Join-Path $runDir 'watchdog.out.log'
$errLog = Join-Path $runDir 'watchdog.err.log'
$pidFile = Join-Path $runDir 'watchdog.pid'

New-Item -ItemType Directory -Force -Path $runDir | Out-Null

function Write-Log($msg) {
  $line = "[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] $msg"
  Add-Content -Path $outLog -Value $line
}

# Single-instance guard
if (Test-Path $pidFile) {
  try {
    $existingPid = [int](Get-Content $pidFile -Raw).Trim()
    $existingProc = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
    if ($existingProc) {
      Write-Log "Watchdog already running (PID $existingPid). Exiting duplicate launcher."
      exit 0
    }
  } catch {}
}

$PID | Set-Content -Path $pidFile
Write-Log "Watchdog started (PID $PID)."

while ($true) {
  try {
    $portInUse = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue

    if (-not $portInUse) {
      Write-Log 'Port 3000 not listening. Starting npm run dev...'
      Start-Process -FilePath 'cmd.exe' `
        -ArgumentList '/c','npm run dev' `
        -WorkingDirectory $root `
        -WindowStyle Hidden `
        -RedirectStandardOutput $outLog `
        -RedirectStandardError $errLog
      Start-Sleep -Seconds 4
    }
  } catch {
    Add-Content -Path $errLog -Value "[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] $($_.Exception.Message)"
  }

  Start-Sleep -Seconds 10
}
