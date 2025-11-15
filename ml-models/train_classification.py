"""
AIMS - YOLOv8 Classification Training for Grocery Store Dataset
Train image classification model (entire image = one product)
Much faster than object detection!
"""

import os
import yaml
import shutil
from pathlib import Path
from ultralytics import YOLO
from datetime import datetime
import csv

def prepare_yolo_classification_dataset():
    """
    Convert Grocery Store Dataset to YOLO classification format
    """
    print("=" * 80)
    print("📦 Preparing Grocery Store Dataset for YOLO Classification")
    print("=" * 80)
    
    base_path = Path(__file__).parent / 'data' / 'GroceryStoreDataset' / 'dataset'
    output_path = Path(__file__).parent / 'data' / 'grocery_yolo'
    
    # Read classes
    classes_file = base_path / 'classes.csv'
    class_names = []
    
    print(f"\n[1/4] Reading class names from {classes_file.name}...")
    with open(classes_file, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            class_names.append(row['Class Name (str)'])
    
    print(f"✅ Found {len(class_names)} classes")
    print(f"   Sample classes: {', '.join(class_names[:5])}...")
    
    # Create YOLO classification structure
    print(f"\n[2/4] Creating YOLO classification directory structure...")
    for split in ['train', 'val', 'test']:
        for class_name in class_names:
            class_dir = output_path / split / class_name
            class_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"✅ Created directories in: {output_path}")
    
    # Copy images to correct structure
    print(f"\n[3/4] Organizing images...")
    total_copied = 0
    
    for split in ['train', 'val', 'test']:
        split_txt = base_path / f'{split}.txt'
        
        if not split_txt.exists():
            continue
            
        print(f"   Processing {split} split...")
        count = 0
        
        with open(split_txt, 'r') as f:
            for line in f:
                parts = line.strip().split(',')
                if len(parts) < 2:
                    continue
                
                img_path = parts[0].strip()
                class_id = int(parts[1].strip())
                class_name = class_names[class_id]
                
                src_img = base_path / img_path
                if src_img.exists():
                    dst_img = output_path / split / class_name / src_img.name
                    
                    if not dst_img.exists():
                        shutil.copy(src_img, dst_img)
                        count += 1
        
        print(f"   ✅ {split}: {count} images organized")
        total_copied += count
    
    print(f"\n✅ Total images organized: {total_copied}")
    
    # Create dataset.yaml for YOLO
    print(f"\n[4/4] Creating YOLO dataset configuration...")
    
    dataset_config = {
        'path': str(output_path.absolute()),
        'train': 'train',
        'val': 'val',
        'test': 'test',
        'names': {i: name for i, name in enumerate(class_names)},
        'nc': len(class_names)
    }
    
    yaml_path = output_path / 'dataset.yaml'
    with open(yaml_path, 'w') as f:
        yaml.dump(dataset_config, f, default_flow_style=False, sort_keys=False)
    
    print(f"✅ Created: {yaml_path}")
    
    # Print summary
    print(f"\n📊 Dataset Summary:")
    for split in ['train', 'val', 'test']:
        split_path = output_path / split
        if split_path.exists():
            count = sum(1 for _ in split_path.rglob('*.jpg'))
            print(f"   {split:6s}: {count:5d} images")
    
    print(f"\n✅ Dataset ready for training!")
    print("=" * 80)
    
    return str(yaml_path)

def train_grocery_classification(
    model_size='n',
    epochs=100,
    batch_size=32,
    image_size=224,
    device='cpu'
):
    """
    Train YOLOv8 classification model
    
    Classification is MUCH faster than detection:
    - No bounding boxes needed
    - Faster training (2-3 hours on GPU)
    - Perfect for single-item product images
    """
    
    print("=" * 80)
    print("🚀 AIMS - Grocery Classification Training")
    print("=" * 80)
    print(f"\n📊 Configuration:")
    print(f"   Model: YOLOv8{model_size}-cls")
    print(f"   Epochs: {epochs}")
    print(f"   Batch Size: {batch_size}")
    print(f"   Image Size: {image_size}px")
    print(f"   Device: {device.upper()}")
    print(f"   Start: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    # Prepare dataset
    dataset_yaml = prepare_yolo_classification_dataset()
    
    # Load model
    print(f"\n[1/3] Loading YOLOv8{model_size}-cls model...")
    model = YOLO(f'yolov8{model_size}-cls.pt')
    print(f"✅ Model loaded")
    
    # Training
    print(f"\n[2/3] Starting training...")
    
    if device == 'cpu':
        est_time = "8-10 hours"
    else:
        est_time = "2-3 hours"
    
    print(f"⏱️  Estimated time: {est_time}")
    print("-" * 80)
    
    # Use directory path, not YAML file for classification
    data_dir = Path(dataset_yaml).parent
    
    results = model.train(
        data=str(data_dir),
        epochs=epochs,
        batch=batch_size,
        imgsz=image_size,
        device=device,
        project=str(Path(__file__).parent / 'runs' / 'classify'),
        name='grocery_classifier',
        exist_ok=True,
        pretrained=True,
        optimizer='AdamW',
        lr0=0.01,
        patience=50,
        save=True,
        save_period=10,
        cache=False,
        workers=4,
        verbose=True,
        # Classification-specific augmentation
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        degrees=10.0,
        translate=0.1,
        scale=0.5,
        shear=0.0,
        perspective=0.0,
        flipud=0.0,
        fliplr=0.5,
        mosaic=0.0,  # Not used in classification
        mixup=0.1,
        copy_paste=0.0,
    )
    
    print("\n" + "-" * 80)
    print("[3/3] Training completed!")
    
    # Get best model
    best_model_path = Path(__file__).parent / 'runs' / 'classify' / 'grocery_classifier' / 'weights' / 'best.pt'
    
    print(f"\n📈 Results:")
    print(f"   Best Model: {best_model_path}")
    
    # Validate
    print(f"\n[Validation] Testing model accuracy...")
    best_model = YOLO(str(best_model_path))
    metrics = best_model.val()
    
    print(f"\n🎯 Model Performance:")
    print(f"   Top-1 Accuracy: {metrics.top1:.2%}")
    print(f"   Top-5 Accuracy: {metrics.top5:.2%}")
    
    # Copy to weights folder
    weights_dir = Path(__file__).parent / 'weights'
    weights_dir.mkdir(exist_ok=True)
    final_model = weights_dir / 'grocery_classifier_best.pt'
    shutil.copy(best_model_path, final_model)
    
    print(f"\n✅ Model saved: {final_model}")
    print(f"\n🎉 Training Complete!")
    print(f"   End: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    print(f"\n📝 Next Steps:")
    print(f"   1. Update detection_api.py to use classification mode")
    print(f"   2. Model path: weights/grocery_classifier_best.pt")
    print(f"   3. This model classifies entire images (no bounding boxes)")
    
    return str(final_model)

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Train grocery product classifier')
    parser.add_argument('--model', type=str, default='n',
                       choices=['n', 's', 'm', 'l', 'x'],
                       help='Model size')
    parser.add_argument('--epochs', type=int, default=100,
                       help='Training epochs')
    parser.add_argument('--batch', type=int, default=32,
                       help='Batch size')
    parser.add_argument('--img-size', type=int, default=224,
                       help='Image size (224 for classification)')
    parser.add_argument('--device', type=str, default='cpu',
                       help='Device: cpu, cuda, or 0')
    
    args = parser.parse_args()
    
    print(f"\n⚠️  Training on {args.device.upper()}")
    print(f"\n📦 This is CLASSIFICATION training (entire image = one product)")
    print(f"   Much faster than detection!")
    print(f"   Perfect for clean product images\n")
    
    response = input("Continue? (yes/no): ")
    if response.lower() in ['yes', 'y']:
        train_grocery_classification(
            model_size=args.model,
            epochs=args.epochs,
            batch_size=args.batch,
            image_size=args.img_size,
            device=args.device
        )
    else:
        print("Training cancelled.")
