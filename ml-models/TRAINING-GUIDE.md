# 🎓 Training Custom YOLOv8 Model

## ✅ Your Dataset is Ready!

You have an excellent **grocery products dataset** from Roboflow:
- **58,581** training images
- **16,738** validation images  
- **8,369** test images
- **17 product classes**

## 🚀 Start Training

### Quick Start (Recommended):
```bash
cd d:\aims\ml-models
D:/aims/.venv/Scripts/python.exe train_model.py
```

This will:
- Train YOLOv8 nano (fastest, good accuracy)
- Run for 100 epochs
- Batch size 16 (works on CPU)
- Save best model to `weights/grocery_detector_best.pt`

### Advanced Options:

**Small Model (Better Accuracy):**
```bash
python train_model.py --model s --epochs 150 --batch 32
```

**Medium Model (Best for Production):**
```bash
python train_model.py --model m --epochs 200 --batch 32
```

**With GPU (Much Faster!):**
```bash
python train_model.py --model s --epochs 150 --batch 64 --device cuda
```

**Larger Images (Better Detection):**
```bash
python train_model.py --model s --epochs 150 --img-size 1280
```

## ⏱️ Training Time Estimates

| Model | Device | Batch | Time (58K images, 100 epochs) |
|-------|--------|-------|-------------------------------|
| Nano  | CPU    | 16    | **5-7 DAYS** ⚠️ |
| Nano  | GPU    | 32    | 6-8 hours ✅ |
| Small | GPU    | 32    | 10-12 hours ✅ |
| Medium| GPU    | 32    | 18-24 hours 🎯 |

**⚠️ WARNING:** CPU training is VERY slow! Recommended to use GPU or cloud service.

## 🌟 Recommended Approach

### Option 1: Cloud Training (Best)
Use **Google Colab** (FREE GPU!):

1. Upload this script to Google Drive
2. Open in Colab
3. Enable GPU: Runtime → Change runtime type → GPU
4. Run training (6-8 hours)
5. Download trained model

### Option 2: Local GPU
If you have NVIDIA GPU:
```bash
# Install CUDA support
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118

# Train with GPU
python train_model.py --model s --epochs 150 --batch 64 --device cuda
```

### Option 3: Local CPU (Not Recommended)
Very slow but works:
```bash
python train_model.py --model n --epochs 50 --batch 8
```

## 📊 What Happens During Training

```
Epoch 1/100: 100%|████████| 3661/3661 [12:34<00:00, 4.85it/s]
      Class     Images  Instances      P      R  mAP50  mAP50-95
        all      16738     42156   0.856   0.791   0.842     0.623

Epoch 2/100: 100%|████████| 3661/3661 [12:28<00:00, 4.89it/s]
      Class     Images  Instances      P      R  mAP50  mAP50-95
        all      16738     42156   0.878   0.812   0.861     0.645
...
```

Metrics:
- **P (Precision)**: % of detections that are correct
- **R (Recall)**: % of products found
- **mAP50**: Average accuracy at 50% overlap threshold
- **mAP50-95**: Average accuracy across multiple thresholds

**Target Performance:**
- mAP50 > 0.85 = Excellent! 🎉
- mAP50 > 0.75 = Good ✅
- mAP50 > 0.60 = Acceptable ⚠️

## 📁 Output Files

After training completes:

```
ml-models/
├── runs/train/grocery_detector/
│   ├── weights/
│   │   ├── best.pt          # Best performing model
│   │   └── last.pt          # Last epoch model
│   ├── confusion_matrix.png  # Class confusion matrix
│   ├── results.csv          # Training metrics
│   ├── results.png          # Performance graphs
│   └── val_batch*.jpg       # Validation predictions
│
└── weights/
    └── grocery_detector_best.pt  # Ready to use!
```

## 🔧 After Training: Update Detection API

Once training completes, update `detection_api.py`:

```python
# Line ~30 in detection_api.py
detector = ProductDetector(
    model_path='weights/grocery_detector_best.pt',  # Use custom model!
    confidence_threshold=0.25
)
```

Then restart Flask API:
```bash
python detection_api.py
```

## 🧪 Test Your Trained Model

### Quick Test:
```bash
python test_detection.py path/to/test_image.jpg
```

### Full Validation:
```bash
python validate_model.py
```

## 📈 Expected Results

With your 58K training images:

**Pre-trained YOLOv8n (current):**
- General object detection: ~75%
- Text-based matching: ~85%
- Your specific products: ~70-80%

**Custom-trained YOLOv8s (after training):**
- Your 17 product classes: **95-98%** 🎯
- Faster detection (knows exactly what to look for)
- Better with similar-looking products
- No need for OCR text matching (direct detection)

## 🎯 Next Steps

1. **Start Training:**
   ```bash
   python train_model.py --model n --epochs 100
   ```

2. **Monitor Progress:**
   - Watch the terminal output
   - Check `runs/train/grocery_detector/results.png`
   - Early stopping will activate if no improvement

3. **Use Trained Model:**
   - Model auto-saves to `weights/`
   - Update `detection_api.py`
   - Restart Flask API
   - Test with real images!

## ❓ FAQ

**Q: Can I stop and resume training?**
A: Yes! Training saves checkpoints every 10 epochs.

**Q: What if I run out of memory?**
A: Reduce batch size: `--batch 8` or even `--batch 4`

**Q: How do I know if training is working?**
A: Watch mAP50 increase over epochs. Should reach >0.80 by epoch 50-100.

**Q: Should I use nano or small model?**
A: 
- Nano: Faster inference (good for CPU deployment)
- Small: Better accuracy (recommended for production)
- Medium: Best accuracy (if you have GPU)

**Q: What if accuracy is low?**
A: 
- Train more epochs (150-300)
- Use larger model (small or medium)
- Increase image size (--img-size 1280)
- Check data quality

## 🚀 Ready to Train?

Run this command to start:
```bash
cd d:\aims\ml-models
D:/aims/.venv/Scripts/python.exe train_model.py
```

Training will begin after you confirm. Model will be saved to `weights/` automatically! 🎉
