#!/usr/bin/env python3
"""
Test script untuk API backend SIBI Sign Language Detection
"""

import requests
import json
import time
import sys

def test_api():
    base_url = "http://localhost:5000"
    
    print("🧪 Testing SIBI API Backend")
    print("=" * 50)
    
    # Test 1: Basic connectivity
    print("\n1. Testing basic connectivity...")
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            print("✅ Server is running")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Server error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False
    
    # Test 2: Camera status
    print("\n2. Testing camera status...")
    try:
        response = requests.get(f"{base_url}/api/camera/status")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Camera status retrieved")
            print(f"   Camera connected: {data.get('connected', 'Unknown')}")
            print(f"   Camera index: {data.get('camera_index', 'Unknown')}")
            print(f"   Model loaded: {data.get('model_loaded', 'Unknown')}")
        else:
            print(f"❌ Camera status error: {response.status_code}")
    except Exception as e:
        print(f"❌ Camera status failed: {e}")
    
    # Test 3: Available cameras
    print("\n3. Testing available cameras...")
    try:
        response = requests.get(f"{base_url}/api/cameras/list")
        if response.status_code == 200:
            data = response.json()
            cameras = data.get('cameras', [])
            print(f"✅ Found {len(cameras)} cameras: {cameras}")
        else:
            print(f"❌ Camera list error: {response.status_code}")
    except Exception as e:
        print(f"❌ Camera list failed: {e}")
    
    # Test 4: Prediction endpoint
    print("\n4. Testing prediction endpoint...")
    try:
        response = requests.get(f"{base_url}/api/prediction")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Prediction retrieved")
            print(f"   Letter: {data.get('letter', 'None')}")
            print(f"   Confidence: {data.get('confidence', 0):.2%}")
            print(f"   FPS: {data.get('fps', 0):.1f}")
        else:
            print(f"❌ Prediction error: {response.status_code}")
    except Exception as e:
        print(f"❌ Prediction failed: {e}")
    
    # Test 5: Video feed
    print("\n5. Testing video feed...")
    try:
        response = requests.get(f"{base_url}/video_feed", stream=True)
        if response.status_code == 200:
            print("✅ Video feed is accessible")
            print(f"   Content-Type: {response.headers.get('Content-Type', 'Unknown')}")
        else:
            print(f"❌ Video feed error: {response.status_code}")
    except Exception as e:
        print(f"❌ Video feed failed: {e}")
    
    # Test 6: Model reload
    print("\n6. Testing model reload...")
    try:
        response = requests.get(f"{base_url}/api/model/reload")
        if response.status_code == 200:
            data = response.json()
            if data.get('success', False):
                print("✅ Model reloaded successfully")
            else:
                print("⚠️  Model reload failed - model might not be available")
        else:
            print(f"❌ Model reload error: {response.status_code}")
    except Exception as e:
        print(f"❌ Model reload failed: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 API Testing Complete!")
    print("\n💡 Next steps:")
    print("   1. Copy your best.pt model to backend folder")
    print("   2. Restart the backend server")
    print("   3. Open frontend at http://localhost:8000")
    
    return True

def test_camera_switch():
    """Test camera switching functionality"""
    base_url = "http://localhost:5000"
    
    print("\n📷 Testing Camera Switching")
    print("=" * 30)
    
    # Test switching to different camera indices
    for camera_idx in range(3):
        print(f"\nTesting camera {camera_idx}...")
        try:
            response = requests.post(
                f"{base_url}/api/camera/set_index",
                json={"index": camera_idx}
            )
            if response.status_code == 200:
                data = response.json()
                if data.get('success', False):
                    print(f"✅ Camera {camera_idx} set successfully")
                else:
                    print(f"⚠️  Camera {camera_idx} failed to initialize")
            else:
                print(f"❌ Camera {camera_idx} request failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Camera {camera_idx} error: {e}")
        
        # Wait a bit between tests
        time.sleep(1)

if __name__ == "__main__":
    print("SIBI Sign Language Detection - API Test")
    print("Make sure the backend server is running!")
    
    # Basic API test
    success = test_api()
    
    if success:
        # Camera switching test
        test_camera_switch()
        
        print("\n🔧 For manual testing, you can also use:")
        print("   curl http://localhost:5000/api/camera/status")
        print("   curl http://localhost:5000/api/prediction")
        print("   curl http://localhost:5000/video_feed")
    else:
        print("\n❌ API tests failed. Make sure the backend is running!")
        sys.exit(1)