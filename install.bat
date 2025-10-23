@echo off
echo Installing SIBI Sign Language Detection App...
echo.

REM Create directories
mkdir backend 2>nul
mkdir frontend 2>nul

REM Setup Python environment
echo Setting up Python environment...
cd backend
python -m venv venv
call venv\Scripts\activate

REM Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Copy model file (user needs to copy best.pt manually)
echo.
echo NOTE: Please copy your 'best.pt' model file to the backend folder
echo.

REM Start backend
echo Starting backend server...
start python app.py

REM Wait for backend to start
timeout /t 5 /nobreak >nul

REM Go back to main directory
cd ..

REM Start frontend
echo Starting frontend server...
cd frontend
start python -m http.server 8000

REM Open browser
timeout /t 2 /nobreak >nul
start http://localhost:8000

echo.
echo Installation complete!
echo Backend running on: http://localhost:5000
echo Frontend running on: http://localhost:8000
echo.
echo Press any key to exit...
pause >nul