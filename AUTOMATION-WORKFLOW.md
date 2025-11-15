# 🔄 AIMS Automation Workflow Diagram

## Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AIMS DASHBOARD (User Interface)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ 💰 Record    │  │ 🔔 Smart     │  │ ❌ Report    │  │ 📦 Barcode   │  │
│  │    Sale      │  │ Notifications│  │    Defect    │  │    Scanner   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────────────┘  │
│         │                 │                 │                              │
└─────────┼─────────────────┼─────────────────┼──────────────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  POST /api/sales          GET /api/notifications     POST /api/defects     │
│  POST /api/auto-reorder   PATCH /api/notifications   POST /api/discounts   │
│  POST /api/restock        POST /api/check-expiry     GET /api/inventory    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
          │                                                 │
          ▼                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SUPABASE DATABASE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📊 inventory          📝 notifications       💰 discount_offers           │
│  📈 sales_records      📦 replenishment_orders  ❌ defective_products     │
│  🔄 supplier_returns                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Workflow 1: Sales → Low Stock Detection → Auto-Reorder

```
┌──────────────┐
│  USER ACTION │  Click "💰 Record Sale" button
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│ POST /api/sales                                                 │
│ • Insert into sales_records                                     │
│ • Update inventory: stock -= quantity_sold                      │
│ • Get last 7 days sales data                                    │
│ • Calculate: daily_demand = totalSold / 7                       │
│ • If stock ≤ 30% optimal AND has demand:                        │
│   → Create "low_stock" notification                             │
│   → Recommend: max(shortage, daily_demand × 14)                 │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
       ┌──────────────┐
       │ Notification │  Type: low_stock
       │   Created    │  Status: pending
       └──────┬───────┘
              │
              ▼
┌──────────────────────────────────────────────────────────────────┐
│ Daily Cron Job (2 AM UTC)                                        │
│ POST /api/auto-reorder                                           │
│ • Scan all inventory where stock < 40% optimal                   │
│ • Get 14-day sales history per SKU                               │
│ • Calculate: avg_daily_demand = totalSold / 14                   │
│ • Calculate: days_until_stockout = stock / avg_daily_demand      │
│ • If days < 7:                                                   │
│   → Create "reorder" notification                                │
│   → Priority: critical (<3), high (<5), medium                   │
│   → Recommend: avg_daily_demand × 21 (3 weeks supply)            │
└──────────────┬───────────────────────────────────────────────────┘
               │
               ▼
       ┌───────────────┐
       │ USER REVIEWS  │  Opens Smart Notifications Panel
       │ Notifications │  Sees: Current stock, daily demand,
       └───────┬───────┘  recommended quantity, days until stockout
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
  ┌─────────┐      ┌─────────┐
  │ APPROVE │      │ REJECT  │
  └────┬────┘      └────┬────┘
       │                │
       ▼                ▼
┌─────────────────┐  ┌──────────────────┐
│ PATCH /api/     │  │ PATCH /api/      │
│ auto-reorder    │  │ auto-reorder     │
│ • Create        │  │ • Update status  │
│   replenishment │  │   → rejected     │
│   _orders       │  │ • No order       │
│ • Update status │  │   created        │
│   → approved    │  └──────────────────┘
└────┬────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Supplier Delivers Products                                      │
│ POST /api/restock                                               │
│ • Update inventory: stock += quantity_received                  │
│ • Update replenishment_orders.status → 'completed'              │
│ • Emit Socket.io update for real-time sync                      │
└─────────────────────────────────────────────────────────────────┘
```

**Result:** Stock automatically maintained at optimal levels with minimal user input!

---

## Workflow 2: Expiry Detection → Discount Suggestion → Price Update

```
┌──────────────────────────────────────────────────────────────────┐
│ Daily Cron Job (2 AM UTC)                                        │
│ POST /api/check-expiry                                           │
│                                                                  │
│ EXPIRY SCAN:                                                     │
│ • Find all products where expiry_date < now + 30 days            │
│ • Get 14-day sales data                                          │
│ • Calculate: daily_sales = totalSold / 14                        │
│ • Calculate: days_to_sell = current_stock / daily_sales          │
│ • If days_to_sell > days_until_expiry:                           │
│   → Create "expiring" notification                               │
│   → Suggest discount:                                            │
│     • 50% if < 7 days                                            │
│     • 30% if < 15 days                                           │
│     • 20% if < 30 days                                           │
│                                                                  │
│ OVERSTOCK SCAN:                                                  │
│ • Find products where stock > 150% optimal                       │
│ • Get 30-day sales data                                          │
│ • Calculate: monthly_rate = totalSold / current_stock            │
│ • If monthly_rate < 20% (slow moving):                           │
│   → Create "discount" notification (clearance)                   │
│   → Suggest: 25% discount                                        │
└──────────────┬───────────────────────────────────────────────────┘
               │
               ▼
       ┌───────────────┐
       │ USER REVIEWS  │  Opens Smart Notifications Panel
       │ Expiry Alerts │  Sees: Days until expiry, suggested discount,
       └───────┬───────┘  current sales pace, days to sell
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
  ┌─────────┐      ┌─────────┐
  │ APPROVE │      │ REJECT  │
  └────┬────┘      └────┬────┘
       │                │
       ▼                ▼
┌─────────────────┐  ┌──────────────────┐
│ POST /api/      │  │ POST /api/       │
│ discounts       │  │ discounts (reject│
│ • Get original  │  │ • Update status  │
│   price         │  │   → rejected     │
│ • Calculate:    │  │ • No price change│
│   new_price =   │  └──────────────────┘
│   original ×    │
│   (1 - disc%/100│
│ • Create        │
│   discount_offer│
│ • Update        │
│   inventory:    │
│   - price       │
│   - discount_%  │
│ • Set 14-day    │
│   period        │
│ • Status →      │
│   approved      │
└────┬────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│ RESULT:                                                         │
│ • Product price updated in inventory                            │
│ • Discount badge visible in dashboard                           │
│ • Customers see reduced price                                   │
│ • Stock clears before expiry → Minimize waste!                  │
└─────────────────────────────────────────────────────────────────┘
```

**Result:** Proactive waste prevention and revenue recovery from expiring/slow-moving stock!

---

## Workflow 3: Defect Tracking → Supplier Return Request

```
┌──────────────┐
│  USER ACTION │  Click "❌ Report Defect" button
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│ POST /api/defects                                               │
│ • Create defective_products record                              │
│   - sku, quantity, description, supplier_email                  │
│ • Update inventory:                                             │
│   - current_stock -= defective_quantity                         │
│   - is_defective = true                                         │
│ • Create "defect" notification for approval                     │
│ • Auto-assign supplier email (pattern: sku@supplier.com)        │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
       ┌──────────────┐
       │ Notification │  Type: defect
       │   Created    │  Status: pending
       └──────┬───────┘
              │
              ▼
       ┌───────────────┐
       │ USER REVIEWS  │  Opens Smart Notifications Panel
       │ Defect Report │  Sees: SKU, defective quantity,
       └───────┬───────┘  description, supplier email
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
  ┌─────────────┐   ┌──────────┐
  │ APPROVE     │   │ REJECT / │
  │ RETURN      │   │ RESOLVE  │
  └─────┬───────┘   └────┬─────┘
        │                │
        ▼                ▼
┌────────────────────┐  ┌──────────────────┐
│ PATCH /api/defects │  │ PATCH /api/      │
│ (approve_return)   │  │ defects (resolve)│
│ • Create           │  │ • Update status  │
│   supplier_returns │  │   → resolved     │
│   record:          │  │ • Clear          │
│   - defect_id      │  │   is_defective   │
│   - sku, quantity  │  │   if no other    │
│   - supplier_email │  │   defects        │
│   - reason         │  └──────────────────┘
│   - status:pending │
│ • Update defect    │
│   status →         │
│   return_requested │
│ • Send supplier    │
│   email (TODO)     │
│ • Log email sent   │
└────┬───────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│ Supplier Processes Return                                       │
│ • Receives email notification                                   │
│ • Arranges pickup                                               │
│ • Updates tracking number                                       │
│ • Sends replacement/refund                                      │
│                                                                 │
│ Manual Update in Supabase:                                      │
│ • supplier_returns.status → 'completed'                         │
│ • supplier_returns.tracking_number = '...'                      │
└─────────────────────────────────────────────────────────────────┘
```

**Result:** Streamlined defect tracking and supplier accountability!

---

## Notification Types & Actions

| Icon | Type | Trigger | Action Data | User Action |
|------|------|---------|-------------|-------------|
| ⚠️ | `low_stock` | Stock ≤30% optimal with demand | current_stock, recommended_order, daily_demand, days_until_stockout | Approve → Create reorder |
| 🤖 | `reorder` | Auto-scan finds <40% stock | current_stock, optimal_stock, recommended_quantity, daily_demand, priority | Approve → Create replenishment order |
| ⏰ | `expiring` | Product expiring in <30 days, can't sell in time | expiry_date, days_until_expiry, suggested_discount, daily_sales, days_to_sell | Approve → Apply discount |
| 💰 | `discount` | Overstock >150% with slow sales <20%/month | current_stock, optimal_stock, suggested_discount, reason: 'overstock' | Approve → Apply clearance |
| ❌ | `defect` | User reports defective product | defective_quantity, defect_description, supplier_email | Approve → Send return request |

---

## Smart Decision Logic

### Auto-Reorder Intelligence

```python
# Demand Analysis
total_sold = sum(sales_last_14_days)
avg_daily_demand = total_sold / 14
days_until_stockout = current_stock / avg_daily_demand

# Priority Assignment
if days_until_stockout < 3:
    priority = "critical"  # Red alert
elif days_until_stockout < 5:
    priority = "high"      # Orange warning
else:
    priority = "medium"    # Yellow caution

# Order Quantity Calculation
shortage = optimal_stock - current_stock
safety_stock = avg_daily_demand × 21  # 3 weeks buffer
recommended_order = max(shortage, safety_stock)
```

### Expiry Detection Algorithm

```python
# For each product expiring in <30 days
days_until_expiry = (expiry_date - today).days
daily_sales_rate = sum(sales_last_14_days) / 14
days_to_sell_current_stock = current_stock / daily_sales_rate

if days_to_sell > days_until_expiry:
    # Can't sell in time → Suggest discount
    if days_until_expiry < 7:
        suggested_discount = 50%  # Urgent
    elif days_until_expiry < 15:
        suggested_discount = 30%  # Moderate
    else:
        suggested_discount = 20%  # Cautionary
```

### Overstock Detection

```python
# Find slow-moving items
overstock_threshold = optimal_stock × 1.5
monthly_sales = sum(sales_last_30_days)
monthly_sales_rate = monthly_sales / current_stock

if current_stock > overstock_threshold AND monthly_sales_rate < 0.20:
    # Selling <20% per month = Too slow
    suggested_discount = 25%
    offer_type = "clearance"
```

---

## Real-Time Updates via Socket.io

```
┌──────────────────────────────────────────────────────────────────┐
│ Event: inventory-update                                         │
│ Emitted by: /api/inventory, /api/restock                        │
│ Payload: { sku, name, currentStock, optimalStock, ... }         │
│                                                                 │
│ Dashboard listens → Automatically updates UI without refresh    │
└──────────────────────────────────────────────────────────────────┘
```

**Features:**
- 🔵 Blue "Real-Time Sync" badge when connected
- Instant inventory updates across all users
- No page refresh needed after stock changes

---

## Data Flow Summary

```
Sales → Demand Analysis → Low Stock Detection
  ↓
Notifications Table (pending)
  ↓
User Reviews in Smart Panel
  ↓
Approve → Replenishment Order
  ↓
Supplier Delivers → Restock API
  ↓
Inventory Updated → Real-time Sync → Dashboard Refresh

---

Daily Cron (2 AM)
  ↓
Auto-Reorder Scan + Expiry Scan
  ↓
Notifications Created (pending)
  ↓
User Reviews in Smart Panel
  ↓
Approve → Orders/Discounts Applied
  ↓
Inventory & Prices Updated → Dashboard Shows Changes

---

User Reports Defect
  ↓
Stock Reduced + Notification Created
  ↓
User Approves Return
  ↓
Supplier Return Request Generated
  ↓
Email Sent (TODO) → Tracking Begins
```

---

## System Architecture Highlights

✅ **Separation of Concerns:**
- UI Components handle user input only
- API routes handle business logic
- Database stores state
- Socket.io syncs real-time changes

✅ **Automation-First Design:**
- System detects issues automatically
- User makes approve/reject decisions only
- No manual calculations or data entry
- Minimal cognitive load

✅ **Scalability:**
- Notification-based architecture allows unlimited automation types
- Each workflow independent and testable
- Easy to add new automation rules

✅ **Error Prevention:**
- Stock can't go negative (max(0, stock - quantity))
- Duplicate notifications prevented (check existing pending)
- Validation before state changes
- Rollback-safe transactions

---

**This is a COMPLETE automation system requiring minimal user interaction!** 🚀
