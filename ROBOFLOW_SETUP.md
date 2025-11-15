# 📹 Roboflow Computer Vision Setup Guide

## Option 1: Use Demo Mode (No Setup Required) ✅

The app works out of the box with **simulated detection**. When you click "Scan Shelf", it will:
- Accept image uploads
- Simulate AI detection with random counts (3-15 items)
- Update stock in Supabase
- Show detection results

**Perfect for hackathon demo!** No API key needed.

---

## Option 2: Real AI Detection with Roboflow (15 minutes)

For actual computer vision object detection on shelf images:

### Step 1: Create Roboflow Account (2 min)

1. Go to https://roboflow.com
2. Sign up with Google/GitHub (free account)
3. Verify email

### Step 2: Get API Key (1 min)

1. Go to https://app.roboflow.com
2. Click your profile → **Workspace Settings**
3. Find **"Roboflow API"** section
4. Copy your **Private API Key**

### Step 3: Choose a Model (2 min)

**Option A: Use Public Pre-trained Model** (Recommended)
- Model: `packages-pqk0m` (Package detection on shelves)
- Version: `3`
- Already configured in `.env.local`!

**Option B: Use Custom Model**
1. Create new project in Roboflow
2. Upload training images
3. Annotate objects (products on shelf)
4. Train model (takes 5-10 min)
5. Copy Model ID and Version

### Step 4: Update Environment Variables (1 min)

Edit `.env.local`:

```env
ROBOFLOW_API_KEY=YOUR_ACTUAL_API_KEY_HERE
ROBOFLOW_MODEL=packages-pqk0m
ROBOFLOW_VERSION=3
NEXT_PUBLIC_ROBOFLOW_ENABLED=true
```

### Step 5: Restart Server (1 min)

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 6: Test Detection (5 min)

1. Open http://localhost:3000
2. Click **"Scan Shelf with Vision AI"** on any inventory card
3. Upload a shelf image:
   - Take photo of products on shelf
   - Or download test images from Google Images: "products on shelf"
   - Or use images from Roboflow Universe
4. Watch AI detect items!
5. Stock count auto-updates in database

---

## 🎯 How It Works

### Detection Flow:
```
1. User uploads shelf image
   ↓
2. Image sent to /api/vision/detect
   ↓
3. If Roboflow configured:
   → Send to Roboflow API
   → Get object detections
   → Count items
   ↓
   If not configured:
   → Simulate detection (random count)
   ↓
4. Update stock in Supabase
   ↓
5. Dashboard refreshes
   ↓
6. Analytics checks if replenishment needed
```

---

## 🧪 Testing Without Real Products

### Free Test Images:

1. **Roboflow Universe**: https://universe.roboflow.com
   - Search "retail shelf" or "products"
   - Download sample images
   - Use for testing

2. **Google Images**:
   - Search: "grocery shelf products"
   - Download images
   - Upload via dashboard

3. **Unsplash**:
   - https://unsplash.com/s/photos/grocery-shelf
   - Free high-quality images

---

## 📊 Expected Results

### With Roboflow API:
```json
{
  "detectedCount": 12,
  "detectionMethod": "roboflow",
  "confidence": 0.95,
  "sku": "SKU-001"
}
```

### Demo Mode (No API):
```json
{
  "detectedCount": 8,
  "detectionMethod": "simulated",
  "confidence": 0.85,
  "sku": "SKU-001"
}
```

---

## 🎭 Hackathon Demo Tips

### If Using Roboflow:
1. ✅ "Our system uses **real AI computer vision** from Roboflow"
2. ✅ Show live image upload and detection
3. ✅ Highlight the confidence score
4. ✅ Explain: "In production, this would connect to shelf cameras"

### If Using Demo Mode:
1. ✅ "We've implemented computer vision simulation"
2. ✅ "The architecture supports Roboflow integration"
3. ✅ "For this demo, we're using simulated detection"
4. ✅ Focus on the **workflow and UX**

**Both are impressive for a 24-hour hackathon!**

---

## 🚨 Troubleshooting

### "Detection failed" error
- Check API key is correct in `.env.local`
- Verify model name and version
- Check Roboflow account has credits
- Fall back to demo mode (remove API key)

### "CORS error"
- Roboflow API should work from Next.js API routes
- If issues persist, the simulated mode is still impressive!

### Image too large
- Resize images to < 5MB
- Use JPEG instead of PNG
- Compress before upload

---

## 💡 Enhancement Ideas

After hackathon, you could:
- [ ] Train custom model on actual inventory products
- [ ] Add confidence threshold filtering
- [ ] Show bounding boxes on detected items
- [ ] Support batch image upload
- [ ] Add real-time camera feed (WebRTC)
- [ ] Store detection history in Supabase

---

## ✅ Current Features

✅ Image upload from device/camera  
✅ Real Roboflow API integration  
✅ Fallback to simulation if no API key  
✅ Auto-update stock in Supabase  
✅ Visual feedback during detection  
✅ Confidence scores displayed  
✅ Beautiful UI with gradient buttons  

**Your computer vision is ready!** 🎉

---

**Pro tip**: Even in demo mode, the **architecture and UX** you've built is hackathon-winning quality. Real detection is a bonus, but judges care more about solving the problem creatively!
