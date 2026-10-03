@echo off
title QuakeGuard + AI
cd /d "%~dp0ai_server"

where python >nul 2>nul || (echo Python was not found. Install Python 3.10+ from https://python.org and tick "Add to PATH". & pause & exit /b 1)

:: Delete a half-built environment from an earlier failed run
if exist .venv\Scripts\python.exe (
  .venv\Scripts\python -c "import uvicorn, fastapi, sklearn" 2>nul || rmdir /s /q .venv
)

if not exist .venv\Scripts\python.exe (
  echo Creating Python environment, first run only - this can take a few minutes...
  python -m venv .venv || (echo venv creation failed & pause & exit /b 1)
  .venv\Scripts\python -m pip install -r requirements.txt || (echo pip install failed - check your internet connection & pause & exit /b 1)
)

echo Training the chat model...
.venv\Scripts\python chatbot.py || (echo Training failed & pause & exit /b 1)

:: Open the browser only once the server answers /health (up to 60 s)
start "" /min cmd /c "for /l %%i in (1,1,60) do (curl -s http://127.0.0.1:8000/health >nul 2>&1 && (start http://127.0.0.1:8000/index.html & exit) || timeout /t 1 /nobreak >nul)"

echo.
echo QuakeGuard is starting at http://127.0.0.1:8000  (Ctrl+C to stop)
.venv\Scripts\python -m uvicorn api:app --host 127.0.0.1 --port 8000
echo.
echo The server stopped - read the error above.
pause
