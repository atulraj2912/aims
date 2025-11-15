# ✅ AIMS Quick Start Checklist

## 🚀 Get Your Automation Running in 5 Steps

### Step 1: Database Migration (5 minutes) - **CRITICAL**

- [ ] Open Supabase Dashboard: https://supabase.com/dashboard
- [ ] Navigate to SQL Editor → New Query
- [ ] Open file: `d:\aims\supabase-enhanced-schema.sql`
- [ ] Copy ALL contents (300+ lines)
- [ ] Paste into SQL Editor and click "Run"
- [ ] Verify tables created in Table Editor:
  - [ ] `sales_records`
  - [ ] `notifications`
  - [ ] `discount_offers`
  - [ ] `defective_products`
  - [ ] `supplier_returns`
- [ ] Verify `inventory` table has new columns:
  - [ ] `barcode`
  - [ ] `category`
  - [ ] `price`
  - [ ] `expiry_date`
  - [ ] `discount_percentage`
  - [ ] `is_defective`

---

### Step 2: Test Sales Recording (2 minutes)

- [ ] Open dashboard: http://localhost:3000/dashboard
- [ ] Click "💰 Record Sale" button (green)
- [ ] Select a product from dropdown
- [ ] Enter quantity that brings stock below 30% (e.g., sell 35 units from 50)
- [ ] Enter sale price (auto-filled)
- [ ] Click "Record Sale"
- [ ] ✅ Should see: "Sale recorded! Low stock alert created."

---

### Step 3: Review Notifications (1 minute)

- [ ] Click "🔔 Smart Notifications" button (purple) in dashboard
- [ ] Should see notification card with:
  - [ ] ⚠️ Low Stock icon
  - [ ] Current stock level
  - [ ] Recommended reorder quantity
  - [ ] Days until stockout
  - [ ] Approve/Reject buttons
- [ ] Click "Approve Reorder"
- [ ] ✅ Should see: "Reorder approved!"
- [ ] Close panel and verify badge count updated

---

### Step 4: Test Auto-Reorder Scan (2 minutes)

- [ ] Open browser DevTools (F12)
- [ ] Go to Console tab
- [ ] Paste and run:
  ```javascript
  fetch('/api/auto-reorder', { method: 'POST' })
    .then(r => r.json())
    .then(data => console.log('Reorder scan results:', data))
  ```
- [ ] Check console output - should show created notifications
- [ ] Click "🔔 Smart Notifications" again
- [ ] Should see 🤖 Auto-Reorder notifications with:
  - [ ] Daily demand calculation
  - [ ] Recommended quantity (21 days supply)
  - [ ] Priority level (critical/high/medium)

---

### Step 5: Test Expiry Detection (3 minutes)

#### Add Product with Expiry Date:
- [ ] Click "➕ Add New Item" in dashboard
- [ ] Fill in:
  - [ ] Name: "Test Expiring Product"
  - [ ] SKU: "TEST001"
  - [ ] Category: "Beverages"
  - [ ] Price: $5.99
  - [ ] Expiry Date: 15 days from today
  - [ ] Current Stock: 100
  - [ ] Optimal Stock: 100
- [ ] Click "Add Product"

#### Record Some Sales:
- [ ] Click "💰 Record Sale"
- [ ] Select "Test Expiring Product"
- [ ] Quantity: 5 units
- [ ] Click "Record Sale"
- [ ] Repeat 2-3 times to create sales history

#### Run Expiry Scan:
- [ ] Open DevTools Console
- [ ] Paste and run:
  ```javascript
  fetch('/api/check-expiry', { method: 'POST' })
    .then(r => r.json())
    .then(data => console.log('Expiry scan results:', data))
  ```
- [ ] Click "🔔 Smart Notifications"
- [ ] Should see ⏰ Expiring Product notification with:
  - [ ] Days until expiry
  - [ ] Suggested discount (30% for 15 days)
  - [ ] Current sales pace
  - [ ] Days to sell at current rate
- [ ] Click "Approve Discount"
- [ ] ✅ Verify product price updated in inventory with discount badge

---

### Step 6: Test Defect Reporting (2 minutes)

- [ ] Click "❌ Report Defect" button (red/pink) in dashboard
- [ ] Select a product from dropdown
- [ ] Enter defective quantity (e.g., 3 units)
- [ ] Describe defect: "Damaged packaging"
- [ ] Click "Report Defect"
- [ ] ✅ Should see: "Defect reported successfully"
- [ ] Click "🔔 Smart Notifications"
- [ ] Should see ❌ Defect Report notification with:
  - [ ] Defective quantity
  - [ ] Description
  - [ ] Supplier email
  - [ ] Approve Return button
- [ ] Click "Approve Return"
- [ ] Check browser console - should log: "📧 Supplier return email sent to..."
- [ ] Open Supabase Table Editor → `supplier_returns` table
- [ ] ✅ Verify new return request record exists

---

## 🎯 You're Done! System is Fully Operational

### What Just Happened:

✅ **Sales Recording** → Detected low stock → Created notification  
✅ **Auto-Reorder** → Analyzed demand → Suggested replenishment  
✅ **Expiry Detection** → Found expiring product → Suggested discount  
✅ **Defect Tracking** → Reduced stock → Created return request  

### All Workflows Tested ✨

Your AIMS system is now running with **complete automation**!

---

## 📅 Daily Operations (After Setup)

### Morning Routine (2 minutes):
1. Open dashboard
2. Click "🔔 Smart Notifications"
3. Review pending actions (reorders, discounts, returns)
4. Approve/reject each with one click
5. Done! System handles everything else automatically

### Optional: Set Up Auto-Scans
- [ ] Create `/api/cron/daily` endpoint (see AUTOMATION-SETUP-GUIDE.md)
- [ ] Add `vercel.json` with cron schedule
- [ ] Deploy to Vercel
- [ ] Scans run automatically at 2 AM daily
- [ ] You only review notifications when convenient

---

## 🛠️ Troubleshooting Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| "Table does not exist" error | Run database migration in Supabase SQL Editor |
| Notifications not showing | Check console for errors, verify tables exist |
| Stock not updating | Refresh page, check Socket.io blue badge |
| Discount not applying | Verify discount_offers table has active record |
| No reorder suggestions | Products need <40% stock AND recent sales |
| No expiry alerts | Products need expiry_date set <30 days |

---

## 📚 Additional Resources

- **AUTOMATION-SETUP-GUIDE.md** - Detailed testing scenarios and API reference
- **AUTOMATION-WORKFLOW.md** - Visual diagrams and system architecture
- **supabase-enhanced-schema.sql** - Database structure (run this first!)

---

## 🎉 Success Metrics

Your system is working correctly when:

✅ Sales automatically create low stock alerts  
✅ Daily scans find items needing reorder/discounts  
✅ Smart Notifications Panel shows actionable insights  
✅ One-click approvals execute entire workflows  
✅ Inventory updates happen automatically  
✅ You spend <2 minutes/day on inventory decisions  

---

**You've built a production-ready autonomous inventory system!** 🚀

*Next: Set up daily cron jobs for fully hands-off automation*
