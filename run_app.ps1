# QuakeGuard PowerShell App Launcher
$indexPath = Join-Path $PSScriptRoot "index.html"

$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"

if (Test-Path $edgePath) {
    Start-Process $edgePath -ArgumentList "--app=`"file:///$indexPath`" --window-size=1300,880"
} elseif (Test-Path $chromePath) {
    Start-Process $chromePath -ArgumentList "--app=`"file:///$indexPath`" --window-size=1300,880"
} else {
    Start-Process $indexPath
}
