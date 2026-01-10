@echo off
title Ward Pollution Dashboard - Backend + Frontend

REM Go to project directory (IMPORTANT)
cd /d "%~dp0"

echo ================================
echo Ward Pollution Dashboard
echo Backend + Frontend Setup
echo ================================
echo.

REM -------------------------------
REM [1/6] Check Node.js
REM -------------------------------
echo [1/6] Checking Node.js...
node -v >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js is not installed.
  echo Please install Node.js 18+ from https://nodejs.org/
  pause
  exit /b 1
)
node -v
echo [OK] Node.js found
echo.

REM -------------------------------
REM [2/6] Install Frontend Dependencies
REM -------------------------------
echo [2/6] Installing Frontend Dependencies...
if not exist node_modules (
  echo Installing npm packages for frontend...
  call npm install
  if errorlevel 1 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
  )
  echo [OK] Frontend dependencies installed
) else (
  echo [SKIP] Frontend dependencies already installed
)
echo.

REM -------------------------------
REM [3/6] Install Backend Dependencies
REM -------------------------------
echo [3/6] Installing Backend Dependencies...
cd backend
if not exist node_modules (
  echo Installing npm packages for backend...
  call npm install
  if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
  )
  echo [OK] Backend dependencies installed
) else (
  echo [SKIP] Backend dependencies already installed
)
cd ..
echo.

REM -------------------------------
REM [4/6] Check Environment Files
REM -------------------------------
echo [4/6] Checking Environment Configuration...
if not exist backend\.env (
  echo [WARNING] backend\.env file not found!
  echo Please create backend\.env with your PostgreSQL credentials.
  echo See SETUP_BACKEND.md for instructions.
  echo.
  echo The app will still run, but may not connect to database.
  echo.
) else (
  echo [OK] Backend .env file found
)

if not exist .env (
  echo [INFO] Frontend .env not found - using defaults
  echo To configure API URL, create .env with:
  echo   VITE_API_URL=http://localhost:3001/api
) else (
  echo [OK] Frontend .env file found
)
echo.

REM -------------------------------
REM [5/6] Database Info (Optional)
REM -------------------------------
echo [5/6] Checking Database Connection...
echo [INFO] Make sure PostgreSQL is running if you want to use the backend API.
echo [INFO] Frontend will work with mock data if backend DB is unavailable.
echo.

REM -------------------------------
REM [6/6] Start Servers (PORT SAFE)
REM -------------------------------
echo [6/6] Starting Servers...
echo.

REM ---- Backend ----
echo Starting Backend Server (Port 3001)...

netstat -ano | findstr :3001 >nul
if %errorlevel%==0 (
  echo [SKIP] Backend already running on port 3001
) else (
  cd backend
  start "Ward Dashboard - Backend Server" cmd /k ^
  "echo Backend Server Running on http://localhost:3001 && ^
   echo. && ^
   echo To stop: Close this window && ^
   echo. && ^
   npm run dev"
  cd ..
  echo [OK] Backend server starting...
)

REM Give backend time to initialize
timeout /t 3 > nul

REM ---- Frontend ----
echo Starting Frontend Server (Port 5173)...

netstat -ano | findstr :5173 >nul
if %errorlevel%==0 (
  echo [SKIP] Frontend already running on port 5173
) else (
  start "Ward Dashboard - Frontend Server" cmd /k ^
  "echo Frontend Server Running on http://localhost:5173 && ^
   echo. && ^
   echo To stop: Close this window && ^
   echo. && ^
   npm run dev"
  echo [OK] Frontend server starting...
)

echo.

REM -------------------------------
REM Final Steps
REM -------------------------------
echo Waiting for servers to initialize...
timeout /t 8 > nul

echo Opening browser...
start http://localhost:5173

echo.
echo ================================
echo Setup Complete!
echo ================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3001
echo.
echo [IMPORTANT]
echo - You can safely run this file multiple times
echo - It will NOT start duplicate servers
echo - Backend DB is optional (demo mode supported)
echo - To stop: Close the backend and frontend windows
echo.
echo You can close this window now.
echo.
pause
