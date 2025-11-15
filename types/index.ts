// Type definitions for AIMS Dashboard

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category?: string;
  currentStock: number;
  optimalStock: number;
  unit: string;
  lastUpdated: string;
  location: string;
}

export interface ReplenishmentOrder {
  id: string;
  sku: string;
  itemName: string;
  currentStock: number;
  optimalStock: number;
  quantityToOrder: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface StockStatus {
  status: 'optimal' | 'low' | 'critical';
  message: string;
  color: string;
}

export interface DashboardData {
  inventory: InventoryItem[];
  pendingOrders: ReplenishmentOrder[];
  lastSync: string;
}
