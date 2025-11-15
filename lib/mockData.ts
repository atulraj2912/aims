import { InventoryItem, ReplenishmentOrder } from '@/types';

// Mock inventory data simulating PostgreSQL database
export const mockInventory: InventoryItem[] = [
  {
    id: '1',
    sku: 'SKU-001',
    name: 'Premium Coffee Beans - 1kg',
    currentStock: 8,
    optimalStock: 20,
    unit: 'bags',
    lastUpdated: new Date().toISOString(),
    location: 'Warehouse A - Shelf 3'
  },
  {
    id: '2',
    sku: 'SKU-002',
    name: 'Organic Tea Leaves - 500g',
    currentStock: 3,
    optimalStock: 15,
    unit: 'boxes',
    lastUpdated: new Date().toISOString(),
    location: 'Warehouse A - Shelf 5'
  }
];

// Mock pending replenishment orders
export const mockPendingOrders: ReplenishmentOrder[] = [
  {
    id: 'ORDER-001',
    sku: 'SKU-001',
    itemName: 'Premium Coffee Beans - 1kg',
    currentStock: 8,
    optimalStock: 20,
    quantityToOrder: 12,
    status: 'pending',
    createdAt: new Date().toISOString(),
    priority: 'high'
  },
  {
    id: 'ORDER-002',
    sku: 'SKU-002',
    itemName: 'Organic Tea Leaves - 500g',
    currentStock: 3,
    optimalStock: 15,
    quantityToOrder: 12,
    status: 'pending',
    createdAt: new Date().toISOString(),
    priority: 'critical'
  }
];

// Simulate Vision Core data updates (simulating camera detection)
export function getVisionCoreData(sku: string): number {
  // Simulate random stock changes detected by camera
  const item = mockInventory.find(i => i.sku === sku);
  if (!item) return 0;
  
  // Add slight variation to simulate real-time updates
  const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
  return Math.max(0, item.currentStock + variation);
}

// Simulate Analytics Engine calculation
export function calculateOptimalStock(sku: string): number {
  const item = mockInventory.find(i => i.sku === sku);
  return item?.optimalStock || 0;
}

// Determine if replenishment is needed
export function needsReplenishment(currentStock: number, optimalStock: number): boolean {
  return currentStock < optimalStock;
}

// Calculate priority based on stock deficit
export function calculatePriority(currentStock: number, optimalStock: number): 'low' | 'medium' | 'high' | 'critical' {
  const ratio = currentStock / optimalStock;
  
  if (ratio <= 0.2) return 'critical';
  if (ratio <= 0.4) return 'high';
  if (ratio <= 0.6) return 'medium';
  return 'low';
}
