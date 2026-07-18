@echo off
title StadiumOps AI Launcher
echo ===================================================
echo               STADIUMOPS AI LAUNCHER
echo ===================================================
echo.
echo [1/3] Generating synthetic datasets...
python scripts/generate_data.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Dataset generation failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Initializing SQLite tables & seeding database...
python scripts/seed_database.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Database seeding failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Starting backend and frontend services...
echo.
echo Launching FastAPI Backend on port 8000...
start "StadiumOps AI Backend" cmd /k "title Backend Server && python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000"

echo Launching Vite React Frontend on port 5173...
start "StadiumOps AI Frontend" cmd /k "title Frontend Server && cd frontend && npm run dev"

echo.
echo Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

echo.
echo Opening StadiumOps AI Command Console in browser...
start http://localhost:5173

echo.
echo Platform successfully running! Keep this window open or close it.
echo ===================================================
pause
