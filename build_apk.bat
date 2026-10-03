@echo off
title QuakeGuard APK Compiler
echo ===================================================
echo   QuakeGuard Android APK Automated Build Script
echo ===================================================

cd /d "%~dp0"

:: Step 1: Check Flutter SDK
where flutter >nul 2>nul
if %errorlevel% equ 0 (
    echo [1/2] Flutter SDK found. Compiling Flutter APK...
    flutter pub get
    flutter build apk --release
    echo.
    echo ===================================================
    echo SUCCESS: APK Generated at:
    echo %~dp0build\app\outputs\flutter-apk\app-release.apk
    echo ===================================================
    pause
    exit /b
)

:: Step 2: Check Gradle Wrapper
if exist "android\gradlew.bat" (
    echo [1/2] Compiling via Android Gradle...
    cd android
    call gradlew.bat assembleRelease
    echo.
    echo ===================================================
    echo SUCCESS: APK Generated at:
    echo %~dp0android\app\build\outputs\apk\release\app-release.apk
    echo ===================================================
    pause
    exit /b
)

echo [INFO] To compile the APK locally:
echo 1. Install Flutter SDK (https://docs.flutter.dev/get-started/install)
echo 2. Run 'flutter build apk --release' inside this folder.
echo.
echo Or use PWABuilder (https://www.pwabuilder.com) to generate the APK instantly from web manifest!
pause
