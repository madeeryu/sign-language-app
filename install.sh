#!/bin/bash

echo "Installing SIBI Sign Language Detection App..."
echo

# Create directories
mkdir -p backend frontend

# Setup Python environment
echo "Setting up Python environment..."
cd backend
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Copy model file (user needs to copy best.pt manually)
echo
echo "NOTE: Please copy your 'best.pt' model file to the backend folder"
echo

# Start backend
echo "Starting backend server..."
nohup python app.py > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Go back to main directory
cd ..

# Start frontend
echo "Starting frontend server..."
cd frontend
nohup python3 -m http.server 8000 > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 2

# Open browser (works on most Linux systems)
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:8000
elif command -v open > /dev/null; then
    open http://localhost:8000
fi

echo
echo "Installation complete!"
echo "Backend running on: http://localhost:5000"
echo "Frontend running on: http://localhost:8000"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo
echo "To stop the servers, run:"
echo "kill $BACKEND_PID $FRONTEND_PID"
echo
echo "Press Ctrl+C to exit this script"
# Keep the script running
wait