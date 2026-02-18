@echo off
TITLE Network Intrusion Detection System
ECHO ======================================================
ECHO Starting Network Intrusion Detection System (Full Stack)
ECHO ======================================================

REM Check Python
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    ECHO Python is not installed or not in PATH.
    PAUSE
    EXIT /B
)

REM Check Node.js
node --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    ECHO Node.js is not installed. Please install Node.js for the frontend.
    PAUSE
    EXIT /B
)

ECHO.
ECHO [1/3] Installing Backend Dependencies...
pip install -r backend/requirements.txt
IF %ERRORLEVEL% NEQ 0 (
    ECHO Failed to install backend dependencies.
    PAUSE
    EXIT /B
)

ECHO.
ECHO [2/3] Installing Frontend Dependencies...
cd frontend
call npm install
REM call npm install lucide-react recharts axios socket.io-client framer-motion clsx tailwind-merge  -D tailwindcss postcss autoprefixer
REM call npx tailwindcss init -p
cd ..

ECHO.
ECHO [3/3] Starting Application...
ECHO Starting Flask Backend (Port 5000) and React Frontend (Port 5173)...

start "Flask Backend" cmd /k "cd backend && python app.py"
start "React Frontend" cmd /k "cd frontend && npm run dev"

ECHO.
ECHO Application is starting...
ECHO Backend: http://127.0.0.1:5000
ECHO Frontend: http://localhost:5173
ECHO.
PAUSE
