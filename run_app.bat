@echo off
title QuakeGuard AI Desktop Application
echo Starting QuakeGuard AI Platform...

:: Check if Microsoft Edge is available for App Mode
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app="file:///%~dp0index.html" --window-size=1280,850 --title="QuakeGuard AI"
    exit /b
)

:: Fallback to Chrome App Mode
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="file:///%~dp0index.html" --window-size=1280,850 --title="QuakeGuard AI"
    exit /b
)

:: Fallback to default browser
start "" "%~dp0index.html"
exit /b
