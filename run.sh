#!/bin/bash

echo "Starting SIBI Sign Language Detection App..."
echo

# Check if backend and frontend folders exist
if [ ! -d "backend" ]; then
    echo "Error: backend folder not found!"
    echo "Please run install.sh first."
    exit 1
fi

if [ ! -d "frontend" ]; then
    echo "Error: frontend folder not found!"
    echo "Please run install.sh first."
    exit 1
fi

# Check if model file exists
if [ ! -f "backend/best.pt" ]; then
    echo
    echo "WARNING: Model file 'best.pt' not found in backend folder!"
    echo "Please copy your YOLO model file to backend/best.pt"
    echo
    echo "Continuing without model..."
    echo
fi

# Function to cleanup on exit
cleanup() {
    echo
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup EXIT

# Start backend
echo "Starting backend server..."
cd backend
python3 app.py > backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend server..."
cd frontend
python3 -m http.server 8000 > frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo
echo "🎉 Application started!"
echo
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:8000"
echo

# Open browser
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:8000 &
elif command -v open > /dev/null; then
    open http://localhost:8000 &
fi

echo "The application will open automatically in your browser..."
echo
echo "Press Ctrl+C to stop all servers..."

# Wait for user interrupt
while true; do
    sleep 1
done