"""
AIMS - Custom YOLOv8 Training Script
Train a custom model on grocery product dataset
"""

import os
import yaml
from pathlib import Path
from ultralytics import YOLO
from datetime import datetime

def fix_data_yaml():
    """Fix data.yaml paths to be absolute"""
    data_yaml_path = Path(__file__).parent / 'data' / 'data.yaml'
    
    with open(data_yaml_path, 'r') as f:
        config = yaml.safe_load(f)
    
    # Fix paths to be absolute
    base_path = Path(__file__).parent / 'data'
    config['train'] = str(base_path / 'train' / 'images')
    config['val'] = str(base_path / 'valid' / 'images')
    config['test'] = str(base_path / 'test' / 'images')
    
    # Save fixed config to a new file
    fixed_yaml = Path(__file__).parent / 'data' / 'dataset.yaml'
    with open(fixed_yaml, 'w') as f:
        yaml.dump(config, f, default_flow_style=False)
    
    return str(fixed_yaml)

def train_custom_model(
    model_size='n',  # n=nano, s=small, m=medium, l=large, x=xlarge
    epochs=100,
    batch_size=16,
    image_size=640,
    device='cpu'  # 'cpu' or 'cuda' or '0' for GPU
):
    """
    Train custom YOLOv8 model on grocery dataset
    
    Args:
        model_size: Model variant (n/s/m/l/x) - 'n' is fastest, 'x' is most accurate
        epochs: Number of training epochs (100-300 recommended)
        batch_size: Batch size (16 for CPU, 32-64 for GPU)
        image_size: Input image size (640 standard, 1280 for better accuracy)
        device: 'cpu' or 'cuda' or GPU index like '0'
    """
    
    print("=" * 80)
    print("🚀 AIMS - Custom YOLOv8 Model Training")
    print("=" * 80)
    print(f"\n📊 Training Configuration:")
    print(f"   Model Size: YOLOv8{model_size}")
    print(f"   Epochs: {epochs}")
    print(f"   Batch Size: {batch_size}")
    print(f"   Image Size: {image_size}px")
    print(f"   Device: {device.upper()}")
    print(f"   Start Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\n" + "=" * 80)
    
    # Fix data.yaml paths
    print("\n[1/5] Preparing dataset configuration...")
    dataset_yaml = fix_data_yaml()
    print(f"✅ Dataset config: {dataset_yaml}")
    
    # Load dataset info
    with open(dataset_yaml, 'r') as f:
        data_config = yaml.safe_load(f)
    
    print(f"\n📦 Dataset Details:")
    print(f"   Classes: {data_config['nc']}")
    print(f"   Categories: {', '.join(data_config['names'][:5])}... (and {data_config['nc']-5} more)")
    
    # Count images
    train_path = Path(data_config['train'])
    val_path = Path(data_config['val'])
    train_count = len(list(train_path.glob('*.*')))
    val_count = len(list(val_path.glob('*.*')))
    
    print(f"   Training Images: {train_count:,}")
    print(f"   Validation Images: {val_count:,}")
    print(f"   Total: {train_count + val_count:,}")
    
    # Load pre-trained model
    print(f"\n[2/5] Loading YOLOv8{model_size} pre-trained model...")
    model = YOLO(f'yolov8{model_size}.pt')
    print(f"✅ Model loaded: yolov8{model_size}.pt")
    
    # Create output directory
    output_dir = Path(__file__).parent / 'runs' / 'train'
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\n[3/5] Starting training...")
    print(f"⏱️  Estimated time: {estimate_training_time(train_count, epochs, batch_size, device)}")
    print(f"💾 Output directory: {output_dir}")
    print("\n" + "-" * 80)
    
    # Train the model
    results = model.train(
        data=dataset_yaml,
        epochs=epochs,
        batch=batch_size,
        imgsz=image_size,
        device=device,
        project=str(output_dir.parent),
        name='grocery_detector',
        exist_ok=True,
        pretrained=True,
        optimizer='AdamW',
        verbose=True,
        patience=50,  # Early stopping patience
        save=True,
        save_period=10,  # Save checkpoint every 10 epochs
        cache=False,  # Don't cache images (saves RAM)
        workers=4,  # Data loading workers
        # Performance optimizations
        amp=True,  # Automatic Mixed Precision
        # Augmentation (enabled by default, can customize)
        hsv_h=0.015,  # HSV-Hue augmentation
        hsv_s=0.7,    # HSV-Saturation
        hsv_v=0.4,    # HSV-Value
        degrees=0.0,  # Rotation
        translate=0.1,  # Translation
        scale=0.5,    # Scale
        shear=0.0,    # Shear
        perspective=0.0,  # Perspective
        flipud=0.0,   # Flip up-down
        fliplr=0.5,   # Flip left-right
        mosaic=1.0,   # Mosaic augmentation
        mixup=0.0,    # Mixup augmentation
    )
    
    print("\n" + "-" * 80)
    print("[4/5] Training completed!")
    
    # Get best model path
    best_model_path = output_dir.parent / 'grocery_detector' / 'weights' / 'best.pt'
    last_model_path = output_dir.parent / 'grocery_detector' / 'weights' / 'last.pt'
    
    print(f"\n📈 Training Results:")
    print(f"   Best Model: {best_model_path}")
    print(f"   Last Model: {last_model_path}")
    
    # Validate the best model
    print(f"\n[5/5] Validating best model...")
    best_model = YOLO(str(best_model_path))
    metrics = best_model.val(data=dataset_yaml)
    
    print(f"\n🎯 Model Performance:")
    print(f"   mAP50: {metrics.box.map50:.4f} (IoU threshold: 0.5)")
    print(f"   mAP50-95: {metrics.box.map:.4f} (IoU threshold: 0.5-0.95)")
    print(f"   Precision: {metrics.box.mp:.4f}")
    print(f"   Recall: {metrics.box.mr:.4f}")
    
    # Copy best model to weights folder for easy access
    weights_dir = Path(__file__).parent / 'weights'
    weights_dir.mkdir(exist_ok=True)
    
    final_model_path = weights_dir / 'grocery_detector_best.pt'
    
    import shutil
    shutil.copy(best_model_path, final_model_path)
    
    print(f"\n✅ Model copied to: {final_model_path}")
    print(f"\n🎉 Training Complete!")
    print(f"   End Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    print(f"\n📝 Next Steps:")
    print(f"   1. Update detection_api.py to use: weights/grocery_detector_best.pt")
    print(f"   2. Restart Flask API")
    print(f"   3. Test with real product images")
    print(f"\n   To use this model, change in detection_api.py:")
    print(f"   model_path='weights/grocery_detector_best.pt'")
    
    return str(final_model_path)

def estimate_training_time(num_images, epochs, batch_size, device):
    """Rough estimate of training time"""
    iterations_per_epoch = num_images / batch_size
    
    if 'cuda' in str(device).lower() or device != 'cpu':
        seconds_per_iteration = 0.5  # GPU
        speed = "with GPU"
    else:
        seconds_per_iteration = 5.0  # CPU (much slower)
        speed = "with CPU"
    
    total_seconds = iterations_per_epoch * epochs * seconds_per_iteration
    hours = total_seconds / 3600
    
    if hours < 1:
        return f"{int(total_seconds/60)} minutes {speed}"
    elif hours < 24:
        return f"{hours:.1f} hours {speed}"
    else:
        return f"{hours/24:.1f} days {speed}"

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Train custom YOLOv8 model for AIMS')
    parser.add_argument('--model', type=str, default='n', 
                       choices=['n', 's', 'm', 'l', 'x'],
                       help='Model size: n(nano), s(small), m(medium), l(large), x(xlarge)')
    parser.add_argument('--epochs', type=int, default=100,
                       help='Number of training epochs (default: 100)')
    parser.add_argument('--batch', type=int, default=16,
                       help='Batch size (default: 16 for CPU, use 32-64 for GPU)')
    parser.add_argument('--img-size', type=int, default=640,
                       help='Image size (default: 640)')
    parser.add_argument('--device', type=str, default='cpu',
                       help='Device: cpu, cuda, or GPU index (0, 1, etc.)')
    
    args = parser.parse_args()
    
    print(f"\n⚠️  Training on {args.device.upper()} - Make sure you have enough resources!")
    print(f"   Recommended: GPU with 8GB+ VRAM for batch size {args.batch}")
    print(f"   CPU training will be VERY slow (days instead of hours)\n")
    
    response = input("Continue? (yes/no): ")
    if response.lower() in ['yes', 'y']:
        train_custom_model(
            model_size=args.model,
            epochs=args.epochs,
            batch_size=args.batch,
            image_size=args.img_size,
            device=args.device
        )
    else:
        print("Training cancelled.")
