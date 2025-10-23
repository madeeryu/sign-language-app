@echo off
echo Starting SIBI Sign Language Detection App...
echo.

REM Check if backend and frontend folders exist
if not exist backend (
    echo Error: backend folder not found!
    echo Please run install.bat first.
    pause
    exit /b 1
)

if not exist frontend (
    echo Error: frontend folder not found!
    echo Please run install.bat first.
    pause
    exit /b 1
)

REM Check if model file exists
if not exist backend\best.pt (
    echo.
    echo WARNING: Model file 'best.pt' not found in backend folder!
    echo Please copy your YOLO model file to backend\best.pt
    echo.
    echo Continuing without model...
    echo.
)

REM Start backend
echo Starting backend server...
cd backend
start python app.py
cd ..

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting frontend server...
cd frontend
start python -m http.server 8000
cd ..

echo.
echo 🎉 Application started!
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:8000
echo.
echo The application will open automatically in your browser...
timeout /t 2 /nobreak >nul

REM Open browser
start http://localhost:8000

echo.
echo Press any key to stop all servers...
pause >nul

echo.
echo Stopping servers...
taskkill /f /im python.exe 2>nul
taskkill /f /im python3.exe 2>nul
echo Servers stopped.
timeout /t 1 /nobreak >nul