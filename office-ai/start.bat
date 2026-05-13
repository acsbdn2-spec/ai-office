@echo off
echo.
echo  =========================================
echo   Office AI - Starting Up
echo  =========================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found. Install Python 3.10+ from python.org
    pause & exit /b 1
)

:: Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Install Node.js from nodejs.org
    pause & exit /b 1
)

:: Setup backend venv if needed
if not exist "backend\venv" (
    echo [1/4] Creating Python virtual environment...
    python -m venv backend\venv
)

:: Install backend deps
echo [2/4] Installing backend packages...
backend\venv\Scripts\pip install -r backend\requirements.txt --quiet

:: Install frontend deps
if not exist "frontend\node_modules" (
    echo [3/4] Installing frontend packages...
    cd frontend && npm install --silent && cd ..
) else (
    echo [3/4] Frontend packages already installed.
)

echo [4/4] Starting servers...
echo.
echo  Backend  -> http://localhost:8000
echo  Frontend -> http://localhost:3000
echo.
echo  Press Ctrl+C to stop.
echo.

:: Start backend in new window
start "Office AI - Backend" cmd /k "cd backend && venv\Scripts\python -m uvicorn main:app --reload --port 8000"

:: Give backend 3 seconds to start
timeout /t 3 /nobreak >nul

:: Start frontend
cd frontend && npm run dev
