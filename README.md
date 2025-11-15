# AIMS Command Dashboard 🎯

**Autonomous Inventory Management System** - A Next.js-based command center for AI-powered inventory management with real-time monitoring and automated replenishment.

**Team ERROR404** | MVP Version 1.0

---

## 🚀 Project Overview

AIMS (Autonomous Inventory Management System) is an AI-powered platform designed to transform traditional inventory management in retail and warehouses. This Command Dashboard serves as the centralized user interface for human oversight and final approval of automated inventory decisions.

### Key Features

✅ **Real-time Stock Visibility** - Live monitoring of inventory levels with camera-based detection simulation  
✅ **AI-Powered Analytics** - Optimal stock level calculations using threshold-based algorithms  
✅ **Automated Replenishment** - Intelligent procurement suggestions when stock falls below optimal levels  
✅ **Human-in-the-Loop** - Manager approval mechanism for all automated orders  
✅ **Visual Indicators** - Color-coded status system (Green/Yellow/Orange/Red) for instant insights  
✅ **Auto-refresh Dashboard** - Updates every 5 seconds to simulate real-time data flow  

---

## 🏗️ System Architecture

### Components

1. **Command Dashboard (This Application)**
   - Built with Next.js 15 + TypeScript
   - Styled with Tailwind CSS
   - Provides centralized oversight interface

2. **Vision Core (Simulated API)**
   - Endpoint: `/api/vision`
   - Simulates AI-powered camera detection of stock levels

3. **Analytics Engine (Simulated API)**
   - Endpoint: `/api/analytics`
   - Calculates optimal stock levels using threshold algorithms

4. **Procurement Agent (Automated System)**
   - Endpoint: `/api/replenishment`
   - Creates automated replenishment orders
   - Requires manager approval before execution

5. **Data Layer (Simulated)**
   - Mock data simulating PostgreSQL database
   - In-memory storage for orders

---

## 📋 Prerequisites

- **Node.js** 18.17 or higher
- **npm** or **yarn** package manager
- Modern web browser (Chrome, Firefox, Edge, Safari)

---

## ⚡ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Open Dashboard

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Experience the Workflow

1. **View Real-time Stock Levels** - See 2 SKUs being monitored
2. **Check Status Indicators** - Notice color-coded alerts (Critical/Low/Below Optimal/Optimal)
3. **Review Automated Orders** - See pending replenishment suggestions in the "Pending Approvals" section
4. **Approve/Reject Orders** - Use the buttons to approve or reject automated procurement decisions
5. **Watch Auto-refresh** - Stock levels update every 5 seconds

---

## 🗂️ Project Structure

```
d:/aims/
├── app/
│   ├── api/
│   │   ├── inventory/
│   │   │   └── route.ts          # Inventory data endpoint
│   │   ├── replenishment/
│   │   │   └── route.ts          # Order management endpoint
│   │   ├── analytics/
│   │   │   └── route.ts          # Analytics Engine simulation
│   │   └── vision/
│   │       └── route.ts          # Vision Core simulation
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main dashboard page
├── components/
│   ├── StockCard.tsx             # Individual inventory item display
│   └── ReplenishmentAlert.tsx    # Automated order approval UI
├── lib/
│   └── mockData.ts               # Mock database & business logic
├── types/
│   └── index.ts                  # TypeScript type definitions
├── public/                       # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

---

## 🔌 API Endpoints

### GET `/api/inventory`
Fetches all inventory items with real-time Vision Core data.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "sku": "SKU-001",
      "name": "Premium Coffee Beans - 1kg",
      "currentStock": 8,
      "optimalStock": 20,
      "unit": "bags",
      "lastUpdated": "2025-11-14T...",
      "location": "Warehouse A - Shelf 3"
    }
  ],
  "lastSync": "2025-11-14T..."
}
```

### GET `/api/replenishment`
Fetches pending replenishment orders.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ORDER-001",
      "sku": "SKU-001",
      "itemName": "Premium Coffee Beans - 1kg",
      "currentStock": 8,
      "optimalStock": 20,
      "quantityToOrder": 12,
      "status": "pending",
      "priority": "high",
      "createdAt": "2025-11-14T..."
    }
  ]
}
```

### PATCH `/api/replenishment`
Approve or reject a replenishment order.

**Request:**
```json
{
  "orderId": "ORDER-001",
  "action": "approve" // or "reject"
}
```

### GET `/api/analytics?sku=SKU-001`
Get optimal stock level for a specific SKU.

### GET `/api/vision?sku=SKU-001`
Get real-time detected stock level from Vision Core.

---

## 🎨 UI Components

### StockCard Component
Displays individual inventory items with:
- Current stock vs optimal stock comparison
- Color-coded status badges
- Progress bar visualization
- Location information
- Last update timestamp

### ReplenishmentAlert Component
Shows automated orders requiring approval with:
- Priority indicators (Critical/High/Medium/Low)
- Order details and calculations
- Analytics Engine reasoning
- Approve/Reject buttons for manager oversight

---

## 🔄 MVP Workflow Demonstration

1. **Vision Core Detection** → Camera AI detects stock level changes
2. **Data Sync** → Current stock updates in real-time (every 5 seconds)
3. **Analytics Engine** → Calculates if current stock < optimal stock
4. **Procurement Agent** → Automatically creates replenishment order
5. **Dashboard Alert** → Manager sees prominent notification
6. **Human Approval** → Manager reviews and approves/rejects order
7. **Procurement Execution** → Approved orders trigger actual procurement (simulated)

---

## 🚧 Future Enhancements (Post-MVP)

- [ ] Connect to actual PostgreSQL database
- [ ] Integrate real Vision Core Python service
- [ ] Add WebSocket for true real-time updates
- [ ] Implement advanced forecasting algorithms
- [ ] Add user authentication and role-based access
- [ ] Multi-warehouse support
- [ ] Historical data analytics and reporting
- [ ] Mobile responsive optimizations
- [ ] Toast notifications instead of alerts
- [ ] Export capabilities (PDF/Excel)

---

## 🛠️ Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Runtime:** Node.js 18+
- **Package Manager:** npm

---

## 📝 Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 is occupied:
```bash
# Windows PowerShell
npx kill-port 3000

# Or specify different port
$env:PORT=3001; npm run dev
```

### Module Not Found Errors
```bash
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

### TypeScript Errors
```bash
# Regenerate type definitions
npm run dev
```

---

## 👥 Team ERROR404

Built with ❤️ for autonomous inventory management.

**Demo MVP Timeline:** 24 hours  
**Completion Date:** November 2025  

---

## 📄 License

This is a demonstration project for educational purposes.

---

## 🎯 Mission Statement

*"Transforming inventory management from reactive to predictive, from manual to autonomous, while keeping humans in the decision loop."*

---

**Need help?** Check the code comments or review the API documentation above.

**Ready to deploy?** This MVP is production-ready for demonstration purposes. For actual deployment, integrate with real backend services and databases.
