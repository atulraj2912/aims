import { InventoryItem, ReplenishmentOrder } from '@/types';

// Mock inventory data simulating PostgreSQL database
export const mockInventory: InventoryItem[] = [
  {
    id: '1',
    sku: 'SKU-001',
    name: 'Premium Coffee Beans - 1kg',
    category: 'Beverages',
    currentStock: 8,
    optimalStock: 20,
    price: 1078,
    unit: 'bags',
    barcode: '1234567890123',
    lastUpdated: new Date().toISOString(),
    location: 'Warehouse A - Shelf 3'
  },
  {
    id: '2',
    sku: 'SKU-002',
    name: 'Organic Tea Leaves - 500g',
    category: 'Beverages',
    currentStock: 3,
    optimalStock: 15,
    price: 705,
    unit: 'boxes',
    barcode: '1234567890124',
    lastUpdated: new Date().toISOString(),
    location: 'Warehouse A - Shelf 5'
  },
  {
    id: '3',
    sku: 'SKU-003',
    name: 'Whole Wheat Bread',
    category: 'Bakery',
    currentStock: 15,
    optimalStock: 30,
    price: 331,
    unit: 'loaves',
    barcode: '1234567890125',
    lastUpdated: new Date().toISOString(),
    location: 'Bakery Section - Shelf 1'
  },
  {
    id: '4',
    sku: 'SKU-004',
    name: 'Fresh Milk - 1L',
    category: 'Dairy',
    currentStock: 25,
    optimalStock: 50,
    price: 248,
    unit: 'bottles',
    barcode: '1234567890126',
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date().toISOString(),
    location: 'Cold Storage - Section B'
  },
  {
    id: '5',
    sku: 'SKU-005',
    name: 'Cheddar Cheese - 500g',
    category: 'Dairy',
    currentStock: 10,
    optimalStock: 25,
    price: 580,
    unit: 'blocks',
    barcode: '1234567890127',
    lastUpdated: new Date().toISOString(),
    location: 'Cold Storage - Section A'
  },
  {
    id: '6',
    sku: 'SKU-006',
    name: 'Greek Yogurt - 500g',
    category: 'Dairy',
    currentStock: 18,
    optimalStock: 35,
    price: 373,
    unit: 'tubs',
    barcode: '1234567890128',
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date().toISOString(),
    location: 'Cold Storage - Section B'
  },
  {
    id: '7',
    sku: 'SKU-007',
    name: 'Red Apples - 1kg',
    category: 'Fruit',
    currentStock: 40,
    optimalStock: 60,
    price: 290,
    unit: 'kg',
    barcode: '1234567890129',
    lastUpdated: new Date().toISOString(),
    location: 'Produce - Aisle 1'
  },
  {
    id: '8',
    sku: 'SKU-008',
    name: 'Bananas - 1kg',
    category: 'Fruit',
    currentStock: 50,
    optimalStock: 80,
    price: 248,
    unit: 'kg',
    barcode: '1234567890130',
    lastUpdated: new Date().toISOString(),
    location: 'Produce - Aisle 1'
  },
  {
    id: '9',
    sku: 'SKU-009',
    name: 'Fresh Carrots - 1kg',
    category: 'Vegetables',
    currentStock: 22,
    optimalStock: 40,
    price: 207,
    unit: 'kg',
    barcode: '1234567890131',
    lastUpdated: new Date().toISOString(),
    location: 'Produce - Aisle 2'
  },
  {
    id: '10',
    sku: 'SKU-010',
    name: 'Tomatoes - 1kg',
    category: 'Vegetables',
    currentStock: 30,
    optimalStock: 50,
    price: 331,
    unit: 'kg',
    barcode: '1234567890132',
    lastUpdated: new Date().toISOString(),
    location: 'Produce - Aisle 2'
  },
  {
    id: '11',
    sku: 'SKU-011',
    name: 'Orange Juice - 1L',
    category: 'Beverages',
    currentStock: 12,
    optimalStock: 30,
    price: 414,
    unit: 'bottles',
    barcode: '1234567890133',
    lastUpdated: new Date().toISOString(),
    location: 'Beverages - Shelf 2'
  },
  {
    id: '12',
    sku: 'SKU-012',
    name: 'Pasta - 500g',
    category: 'Pantry',
    currentStock: 35,
    optimalStock: 50,
    price: 165,
    unit: 'packs',
    barcode: '1234567890134',
    lastUpdated: new Date().toISOString(),
    location: 'Dry Goods - Aisle 4'
  },
  {
    id: '13',
    sku: 'SKU-013',
    name: 'Tomato Sauce - 500ml',
    category: 'Pantry',
    currentStock: 20,
    optimalStock: 40,
    price: 207,
    unit: 'jars',
    barcode: '1234567890135',
    lastUpdated: new Date().toISOString(),
    location: 'Dry Goods - Aisle 4'
  },
  {
    id: '14',
    sku: 'SKU-014',
    name: 'Rice - 2kg',
    category: 'Pantry',
    currentStock: 15,
    optimalStock: 35,
    price: 497,
    unit: 'bags',
    barcode: '1234567890136',
    lastUpdated: new Date().toISOString(),
    location: 'Dry Goods - Aisle 3'
  },
  {
    id: '15',
    sku: 'SKU-015',
    name: 'Chicken Breast - 1kg',
    category: 'Meat',
    currentStock: 8,
    optimalStock: 25,
    price: 829,
    unit: 'packs',
    barcode: '1234567890137',
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date().toISOString(),
    location: 'Frozen - Section C'
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
