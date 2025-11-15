# AIMS Dashboard - Quick Start Guide

## ✅ What's Already Working

Your AIMS Dashboard has the following features ready to use:

- **📊 Real-time Dashboard** - Live inventory stats with low/critical stock alerts
- **🔍 Smart Search & Filtering** - Search by SKU/name, filter by status
- **📦 Virtual Scrolling** - Handles thousands of products smoothly
- **🚨 Critical Alerts** - Auto-popup notifications for items ≤20% stock
- **🔄 Auto Restocking** - One-click approval sends supplier orders
- **📱 Real-time Updates** - WebSocket sync across all connected clients
- **🧠 ML Predictions** - RandomForest model predicting demand (Flask server)
- **🚚 Simulate Delivery** - Test button to restock 5 low-stock items

---

## 🚀 Getting Started

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
See `.env.local` for required variables:
- Supabase URL and keys
- Clerk authentication
- Google Vision API (optional - for image detection)

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Start ML Server (Optional)
```bash
cd ml-model
python app.py
```

### Step 5: Open Your Browser
Navigate to: **http://localhost:3000**

---

## 🎯 Next Step: Enable Image Detection

You're 90% done! Just need to configure Google Cloud Vision API to unlock:
- 📹 Camera-based product scanning
- 🏷️ Automatic SKU detection from labels
- 📝 Barcode reading
- 🔢 Stock counting from shelf images

### Follow These 5 Simple Steps:

1. **Open the setup guide** → `VISION_API_SETUP.md` (already in your project)

2. **Create Google Cloud Project** (2 minutes)
   - Go to https://console.cloud.google.com
   - Create project: "aims-inventory-system"
   - Enable Cloud Vision API (search → click Enable)

3. **Download Credentials** (1 minute)
   - Create service account
   - Download JSON key file
   - Save to: `d:\aims\credentials\google-vision-key.json`

4. **Configure Environment** (30 seconds)
   Add to `.env.local`:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-vision-key.json
   ```

5. **Test It** 🎉
   - Restart dev server: `npm run dev`
   - Click 📹 Scan button in dashboard
   - Upload product image
   - Watch it detect and update inventory!

### 3. Manager Approval Actions
Click on any pending order to:
- ✅ **Approve** - Initiate procurement
- ❌ **Reject** - Dismiss the order

---

## 🧪 Testing the MVP

### Scenario 1: Monitor Stock Levels
1. Open the dashboard
2. Locate the two SKU cards:
   - Premium Coffee Beans - 1kg
   - Organic Tea Leaves - 500g
3. Observe the current vs optimal stock comparison
4. Wait 5 seconds and watch for updates

### Scenario 2: Approve Replenishment
1. Find the "Pending Approvals" section
2. Review the order details:
   - Current stock level
   - Optimal stock level
   - Quantity to order
   - Priority level
3. Click "Approve Order"
4. Order disappears from pending list
5. Confirmation message appears

### Scenario 3: Reject Replenishment
1. Find another pending order
2. Review the details
3. Click "Reject Order"
4. Order is removed from the list

---

## 🔧 System Architecture Components

### 1. Vision Core (Simulated)
- **Endpoint**: `/api/vision?sku=SKU-001`
- **Function**: Simulates AI camera detection
- **Returns**: Real-time stock count with confidence level

### 2. Analytics Engine (Simulated)
- **Endpoint**: `/api/analytics?sku=SKU-001`
- **Function**: Calculates optimal stock levels
- **Algorithm**: Threshold-based model

### 3. Procurement Agent (Automated)
- **Endpoint**: `/api/replenishment`
- **Function**: Creates automated reorder suggestions
- **Trigger**: Current stock < Optimal stock

### 4. Command Dashboard (This App)
- **Port**: 3000
- **Function**: Human oversight and final approval
- **Update Frequency**: 5 seconds

---

## 📱 Dashboard Features Checklist

✅ Real-time stock visibility for 2 SKUs  
✅ Optimal stock levels from Analytics Engine  
✅ Color-coded visual indicators (Red/Orange/Yellow/Green)  
✅ Automated replenishment alerts  
✅ Human-in-the-loop approval mechanism  
✅ Auto-refresh every 5 seconds  
✅ Responsive design with Tailwind CSS  
✅ Clean, professional interface  

---

## 🎯 MVP Success Criteria

This MVP demonstrates:
1. ✅ End-to-end inventory tracking workflow
2. ✅ Integration between Vision Core, Analytics Engine, and Dashboard
3. ✅ Automated intelligence with human oversight
4. ✅ Real-time data synchronization
5. ✅ Manager approval workflow
6. ✅ Professional, user-friendly interface

---

## 🛠️ Troubleshooting

### Server Won't Start
```bash
# Kill existing process on port 3000
npx kill-port 3000
npm run dev
```

### Components Not Loading
- Refresh the browser (Ctrl+F5)
- Check browser console for errors
- Ensure all dependencies installed: `npm install`

### No Data Showing
- Check network tab in browser DevTools
- Verify API routes are responding
- Check terminal for server errors

---

## 🎓 Learning Points

### Next.js Features Used
- App Router (latest routing system)
- API Routes (backend endpoints)
- Client Components ('use client')
- TypeScript integration
- Automatic code splitting

### React Patterns
- useState for state management
- useEffect for side effects
- Component composition
- Props and callbacks
- Async/await data fetching

### Tailwind CSS
- Utility-first styling
- Responsive design
- Custom color schemes
- Gradients and shadows
- Animations

---

## 📈 Next Steps

After exploring the MVP:
1. Review the code in `/app/page.tsx`
2. Examine the API routes in `/app/api/`
3. Study the components in `/components/`
4. Modify mock data in `/lib/mockData.ts`
5. Customize the UI styling
6. Extend with new features

---

## 💡 Tips for Demo

1. **Open in full screen** for best experience
2. **Wait 5-10 seconds** to see auto-refresh in action
3. **Approve one order** to show the workflow
4. **Reject one order** to show control
5. **Explain the color coding** during presentation
6. **Highlight the human-in-the-loop** approach

---

## 🎉 You're Ready!

Your AIMS Command Dashboard is now running. Explore the interface, test the approval workflow, and experience the power of autonomous inventory management with human oversight!

**Dashboard URL**: http://localhost:3000

**Team ERROR404** - Transforming Inventory Management 🚀
