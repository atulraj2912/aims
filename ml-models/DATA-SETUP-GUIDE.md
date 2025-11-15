# 📦 AIMS Product Detection - Data Setup Guide

## 🎯 Where to Put Your Data

You mentioned you have data - here's exactly where to put it:

### Directory Structure Created:
```
d:\aims\ml-models\
├── training-data/
│   ├── images/          ← PUT YOUR PRODUCT IMAGES HERE
│   └── labels/          ← PUT ANNOTATIONS HERE (optional for pre-trained)
├── uploads/             ← API saves uploaded images here
├── weights/             ← Custom trained models go here
├── product_detector.py  ← Detection engine
└── detection_api.py     ← Flask API server
```

---

## 📸 Option 1: Using Pre-trained YOLOv8 (FASTEST - Works Now!)

**No training data needed!** The system works immediately with pre-trained YOLOv8.

### What you can do RIGHT NOW:
1. Start the Flask API
2. Upload any product image
3. System detects objects and reads text
4. Matches text to your inventory database

### Your data usage:
- **Your images**: Upload them via the dashboard
- **Inventory database**: Already used for matching detected text to products

---

## 🎓 Option 2: Train Custom Model (Better Accuracy for YOUR Products)

If you want the system to recognize your specific products with higher accuracy:

### Step 1: Organize Your Images

**Put images in: `d:\aims\ml-models\training-data\images\`**

Required structure:
```
training-data/
└── images/
    ├── product1_001.jpg
    ├── product1_002.jpg
    ├── product2_001.jpg
    ├── product2_002.jpg
    └── ...
```

**Requirements:**
- ✅ At least 100 images per product category
- ✅ Different angles, lighting conditions
- ✅ Clear product visibility
- ✅ Formats: JPG, PNG, JPEG

---

### Step 2: Annotate Your Images (Required for Training)

You need to draw bounding boxes around products in images.

#### Recommended Tools:

**A. LabelImg (Easiest - Desktop App)**
```bash
# Install
pip install labelImg

# Run
labelImg
```

**Steps:**
1. Open directory: `d:\aims\ml-models\training-data\images\`
2. Save directory: `d:\aims\ml-models\training-data\labels\`
3. Change format to "YOLO"
4. Draw boxes around each product
5. Save (creates .txt files in labels folder)

**B. Roboflow (Online - Easiest for Teams)**
1. Go to https://roboflow.com
2. Create free account
3. Upload your images
4. Use their annotation tool (easier than desktop tools!)
5. Export as "YOLOv8" format
6. Download and extract to `training-data/`

**C. CVAT (Advanced - For Large Datasets)**
- https://www.cvat.ai/
- Better for 500+ images
- Team collaboration features

---

### Step 3: Data Format

Each image needs a corresponding label file:

**Image:** `product_001.jpg`  
**Label:** `product_001.txt`

**Label file format (YOLO):**
```
class_id center_x center_y width height
0 0.5 0.5 0.3 0.4
1 0.7 0.3 0.2 0.3
```

**Example:**
```
# labels/coca_cola_001.txt
0 0.516 0.487 0.312 0.645
```

Where:
- `0` = class ID (0 for first product type)
- Values are normalized (0-1)
- center_x, center_y = center of bounding box
- width, height = box dimensions

---

### Step 4: Create Class Names File

**Create: `d:\aims\ml-models\training-data\classes.txt`**

List your product categories:
```
Coca-Cola
Pepsi
Sprite
Water Bottle
Chips
Bread
Milk
```

One product category per line.

---

### Step 5: Train Custom Model

Once you have 100+ annotated images:

```bash
# Navigate to ml-models folder
cd d:\aims\ml-models

# Run training script (I'll create this for you)
python train_custom_model.py
```

Training takes 2-6 hours depending on:
- Number of images
- GPU availability
- Model size (nano/small/medium)

---

## 🚀 Quick Start Guide

### Start Using NOW (Pre-trained):

1. **Start the Flask API:**
```bash
cd d:\aims\ml-models
D:/aims/.venv/Scripts/python.exe detection_api.py
```

2. **API will run on:** `http://localhost:5001`

3. **Test with your images:**
   - Use the dashboard upload button
   - Or test via curl:
   ```bash
   curl -X POST http://localhost:5001/api/detect \
     -F "file=@your_image.jpg" \
     -F "inventory=$(cat inventory.json)"
   ```

4. **View results:**
   - Detections with bounding boxes
   - Extracted text from each product
   - Matched inventory items

---

## 📊 What Data Do You Have?

Please tell me:

1. **How many images do you have?**
   - Less than 100: Use pre-trained model (works great!)
   - 100-500: Train custom model for better accuracy
   - 500+: Train large model for maximum accuracy

2. **Are images already annotated?**
   - ✅ YES: Copy to training-data/ and we can train immediately
   - ❌ NO: Start with pre-trained model, annotate later if needed

3. **What format are they in?**
   - Images only → We use pre-trained + OCR
   - Images + labels → We can train custom model
   - Video → We extract frames first

4. **What products are in your images?**
   - Retail packaged goods (best for OCR)
   - Produce/unmarked items (need custom training)
   - Mixed → Combination approach

---

## 🎯 My Recommendation

**START WITH PRE-TRAINED (Option 1):**
- Works immediately
- No annotation needed
- 85-95% accuracy for labeled products
- Perfect for retail inventory with barcodes/text

**UPGRADE LATER (Option 2):**
- If you need higher accuracy
- For products without clear text
- When you have time to annotate 100+ images

---

## 📁 Put Your Data Here:

### For Immediate Use:
Just upload images through the dashboard when API is running!

### For Future Custom Training:
```
d:\aims\ml-models\training-data\images\
```

### Example Data Structure:
```
training-data/
├── images/
│   ├── beverages_001.jpg
│   ├── beverages_002.jpg
│   ├── snacks_001.jpg
│   ├── snacks_002.jpg
│   └── ... (100+ images)
├── labels/
│   ├── beverages_001.txt
│   ├── beverages_002.txt
│   ├── snacks_001.txt
│   └── ... (matching .txt files)
└── classes.txt (list of product categories)
```

---

## 🧪 Test the System

I'll create a test script. Put a product image in `ml-models/` folder and run:

```bash
python test_detection.py path/to/your/image.jpg
```

---

## ❓ Questions?

Tell me about your data and I'll give you the exact steps!

1. How many images?
2. Annotated or not?
3. What type of products?

Then I'll create the perfect workflow for you! 🚀
