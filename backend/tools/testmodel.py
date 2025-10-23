"""
Manual model loading dengan berbagai metode
"""

import torch
from ultralytics import YOLO
import os

model_path = "best.pt"

print("=" * 60)
print("Method 1: Add safe globals")
print("=" * 60)

try:
    from ultralytics.nn.tasks import DetectionModel
    torch.serialization.add_safe_globals([DetectionModel])
    model = YOLO(model_path)
    print("✓ SUCCESS with Method 1!")
    print(f"Model classes: {model.names}")
    exit(0)
except Exception as e:
    print(f"✗ Method 1 failed: {e}\n")

print("=" * 60)
print("Method 2: Patch torch.load")
print("=" * 60)

try:
    original_load = torch.load
    def patched_load(*args, **kwargs):
        kwargs['weights_only'] = False
        return original_load(*args, **kwargs)
    
    torch.load = patched_load
    model = YOLO(model_path)
    torch.load = original_load
    
    print("✓ SUCCESS with Method 2!")
    print(f"Model classes: {model.names}")
    exit(0)
except Exception as e:
    torch.load = original_load
    print(f"✗ Method 2 failed: {e}\n")

print("=" * 60)
print("Method 3: Direct torch.load")
print("=" * 60)

try:
    ckpt = torch.load(model_path, map_location='cpu', weights_only=False)
    print("✓ Checkpoint loaded!")
    print(f"Keys in checkpoint: {ckpt.keys()}")
    
    # Now create model
    from ultralytics.nn.tasks import attempt_load_weights
    model = YOLO('yolov8n.pt')  # Create base model
    model.model.load_state_dict(ckpt['model'].state_dict())
    model.names = ckpt['model'].names
    
    print("✓ SUCCESS with Method 3!")
    print(f"Model classes: {model.names}")
    exit(0)
except Exception as e:
    print(f"✗ Method 3 failed: {e}\n")

print("=" * 60)
print("ALL METHODS FAILED!")
print("=" * 60)
print("\nRecommendations:")
print("1. Update ultralytics: pip install --upgrade ultralytics")
print("2. Downgrade PyTorch: pip install torch==2.5.1")
print("3. Re-export your model with newer ultralytics version")