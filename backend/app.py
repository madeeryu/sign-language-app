from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import cv2
import numpy as np
import base64
import json
from ultralytics import YOLO
import threading
import time
import logging
from pathlib import Path

app = Flask(__name__)
CORS(app)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables
camera = None
camera_index = 0
model = None
model_loaded = False
names = {}  # FIX: Initialize names dictionary
current_prediction = {"letter": "", "confidence": 0, "fps": 0}
camera_connected = False
prediction_lock = threading.Lock()  # FIX: Add thread safety

# Model configuration
import os
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# WEIGHTS_PATH = os.path.join(SCRIPT_DIR, "best.pt")  # Path ke model YOLO Anda
# WEIGHTS_PATH = "/sign_language_app/backend/best.pt"
WEIGHTS_PATH = "best.pt"
CONFIDENCE_THRESHOLD = 0.25
IMG_SIZE = 640

# Print model path for debugging
print(f"Looking for model at: {WEIGHTS_PATH}")
print(f"Model exists: {os.path.exists(WEIGHTS_PATH)}")

def load_model():
    """Load YOLO model"""
    global model, model_loaded, names
    try:
        logger.info("Loading YOLO model...")
        model = YOLO(WEIGHTS_PATH, task="detect")
        names = model.names  # FIX: Properly assign names
        model_loaded = True
        logger.info(f"Model loaded successfully. Classes: {names}")
        return True
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        model_loaded = False
        names = {}  # FIX: Reset names on error
        return False


def initialize_camera(index=0):
    """Initialize camera with given index"""
    global camera, camera_index, camera_connected
    try:
        if camera is not None:
            camera.release()
            time.sleep(0.1)
        
        # CAMERA_URL = os.environ.get("CAMERA_URL", "https://9fbd584d67e8.ngrok-free.app/video")
        # CAMERA_URL = "https://086a506eab59.ngrok-free.app/mjpegfeed"
        # CAMERA_URL = "https://086a506eab59.ngrok-free.app/mjpegfeed"
        # CAMERA_URL = "http://192.168.1.10:4747/video" 
        CAMERA_URL = 1 
        camera = cv2.VideoCapture(CAMERA_URL)
        # FIX: Set camera properties for better performance
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        camera.set(cv2.CAP_PROP_FPS, 30)
        
        if camera.isOpened():
            camera_index = index
            camera_connected = True
            logger.info(f"Camera {index} initialized successfully")
            return True
        else:
            camera_connected = False
            logger.error(f"Failed to initialize camera {index}")
            return False
    except Exception as e:
        logger.error(f"Error initializing camera: {e}")
        camera_connected = False
        return False

def generate_frames():
    """Generate video frames with predictions"""
    global camera, model, current_prediction, names
    frame_id = 0
    start_time = time.time()
    
    while True:
        if camera is None or not camera.isOpened():
            logger.warning("Camera not available, waiting...")
            time.sleep(0.1)
            continue
            
        success, frame = camera.read()
        if not success:
            logger.warning("Failed to read frame")
            time.sleep(0.1)
            continue
        
        frame_id += 1
        annotated_frame = frame.copy()  # FIX: Always copy frame
        
        # Make predictions if model is loaded
        if model_loaded and model is not None:
            try:
                # FIX: Add verbose=False to reduce console output
                results = model.predict(frame, imgsz=IMG_SIZE, conf=CONFIDENCE_THRESHOLD, verbose=False)
                result = results[0]
                
                # Get predictions
                detections = []
                for box in result.boxes:
                    cls = int(box.cls)
                    conf = float(box.conf)
                    # FIX: Safely get class name
                    class_name = names.get(cls, f"Class_{cls}")
                    detections.append({
                        "class": class_name,
                        "confidence": conf
                    })
                
                # Update current prediction (take the highest confidence)
                with prediction_lock:  # FIX: Thread-safe update
                    if detections:
                        best_detection = max(detections, key=lambda x: x["confidence"])
                        current_prediction["letter"] = best_detection["class"]
                        current_prediction["confidence"] = best_detection["confidence"]
                        logger.debug(f"Prediction: {best_detection['class']} ({best_detection['confidence']:.2f})")
                    else:
                        current_prediction["letter"] = ""
                        current_prediction["confidence"] = 0
                    
                    # Calculate FPS
                    elapsed = time.time() - start_time
                    fps = frame_id / elapsed if elapsed > 0 else 0
                    current_prediction["fps"] = fps
                
                # Draw annotations on frame
                annotated_frame = result.plot()
                
            except Exception as e:
                logger.error(f"Error during prediction: {e}", exc_info=True)
                annotated_frame = frame
                with prediction_lock:
                    current_prediction = {"letter": "Error", "confidence": 0, "fps": 0}
        else:
            with prediction_lock:
                current_prediction = {"letter": "No Model", "confidence": 0, "fps": 0}
        
        # Encode frame to JPEG
        try:
            # FIX: Add quality parameter
            _, buffer = cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            frame_bytes = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        except Exception as e:
            logger.error(f"Error encoding frame: {e}")
            continue

# Routes
@app.route('/')
def index():
    return jsonify({"message": "Sign Language Detection API", "status": "running"})

@app.route('/api/camera/status')
def camera_status():
    """Get camera connection status"""
    return jsonify({
        "connected": camera_connected,
        "camera_index": camera_index,
        "model_loaded": model_loaded,
        "classes": list(names.values()) if names else []  # FIX: Return available classes
    })

@app.route('/api/camera/set_index', methods=['POST'])
def set_camera_index():
    """Set camera index"""
    try:
        data = request.get_json()
        index = data.get('index', 0)
        
        success = initialize_camera(index)
        return jsonify({
            "success": success,
            "message": f"Camera {index} {'initialized' if success else 'failed to initialize'}"
        })
    except Exception as e:
        logger.error(f"Error setting camera index: {e}")
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route('/api/prediction')
def get_prediction():
    """Get current prediction"""
    with prediction_lock:  # FIX: Thread-safe read
        return jsonify(current_prediction.copy())

@app.route('/api/cameras/list')
def list_cameras():
    """List available cameras"""
    available_cameras = []
    for i in range(5):  # Check first 5 camera indices
        try:
            cap = cv2.VideoCapture(i)
            if cap.isOpened():
                available_cameras.append(i)
                cap.release()
        except Exception as e:
            logger.error(f"Error checking camera {i}: {e}")
    
    logger.info(f"Available cameras: {available_cameras}")
    return jsonify({"cameras": available_cameras})

@app.route('/video_feed')
def video_feed():
    """Video streaming route"""
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/model/reload')
def reload_model():
    """Reload the YOLO model"""
    success = load_model()
    return jsonify({
        "success": success,
        "message": "Model reloaded successfully" if success else "Failed to reload model",
        "classes": list(names.values()) if names else []
    })

@app.route('/api/test')
def test():
    """Test endpoint"""
    return jsonify({
        "status": "ok",
        "model_loaded": model_loaded,
        "camera_connected": camera_connected,
        "current_prediction": current_prediction,
        "model_path": WEIGHTS_PATH,
        "model_exists": os.path.exists(WEIGHTS_PATH),
        "current_dir": os.getcwd(),
        "files_in_dir": os.listdir('.')
    })

if __name__ == '__main__':
    # Initialize camera and model
    logger.info("Starting Sign Language Detection Server...")
    
    # Try to load model
    if not load_model():
        logger.warning("Model not loaded. Make sure 'best.pt' exists in the same directory.")
    
    # Try to initialize default camera
    if not initialize_camera(0):
        logger.warning("Default camera not available. You can select a camera from the UI.")
    
    # app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
    app.run(host='127.0.0.1', port=5000, debug=False, threaded=True)