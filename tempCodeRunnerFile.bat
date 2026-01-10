
  if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
  )
  echo [OK] Backend dependencies installed
) else (