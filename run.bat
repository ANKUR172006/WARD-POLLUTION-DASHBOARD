@echo off
title Ward Pollution Dashboard

REM Go to project directory (IMPORTANT)
cd /d "%~dp0"

echo ================================
echo Starting Ward Pollution Dashboard
echo ================================

REM Check Node.js
node -v >nul 2>&1
if errorlevel 1 (
  echo Node.js is not installed.
  echo Please install Node.js first.
  pause
  exit
)

REM Install dependencies (first time only)
if not exist node_modules (
  echo Installing dependencies...
  npm install
)

REM Start Vite in background
echo Starting server...
start "" cmd /c "npm run dev"

REM Wait for server to start
timeout /t 6 > nul

REM Open browser automatically
start http://localhost:3000

echo.
echo App is running in browser.
echo You can close this window.
pause
