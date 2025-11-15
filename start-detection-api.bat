@echo off
echo ========================================
echo   AIMS - Starting Detection API Server
echo ========================================
echo.

cd /d "%~dp0ml-models"

echo [1/2] Activating Python virtual environment...
call ..\..\.venv\Scripts\activate.bat

echo.
echo [2/2] Starting Flask API on port 5001...
echo.
echo ┌─────────────────────────────────────────┐
echo │ Flask API will run at:                  │
echo │ http://localhost:5001                   │
echo │                                         │
echo │ Press Ctrl+C to stop the server         │
echo └─────────────────────────────────────────┘
echo.

python detection_api.py
