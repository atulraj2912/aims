'use client';

import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, UserButton, RedirectToSignIn } from '@clerk/nextjs';
import { Virtuoso } from 'react-virtuoso';
import StockCard from '@/components/StockCard';
import ReplenishmentAlert from '@/components/ReplenishmentAlert';
import { ToastContainer } from '@/components/Toast';
import NotificationBell from '@/components/NotificationBell';
import SearchBar from '@/components/SearchBar';
import AddProductManual from '@/components/AddProductManual';
import AddProductImage from '@/components/AddProductImage';
import VirtualInventoryTable from '@/components/VirtualInventoryTable';
import CriticalStockNotifications from '@/components/CriticalStockNotifications';
import RestockingApprovalModal from '@/components/RestockingApprovalModal';
import GlobalVisionScan from '@/components/GlobalVisionScan';
import BarcodeScanner from '@/components/BarcodeScanner';
import SmartNotificationsPanel from '@/components/SmartNotificationsPanel';
import RecordSale from '@/components/RecordSale';
import ReportDefect from '@/components/ReportDefect';
import { InventoryItem, ReplenishmentOrder } from '@/types';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/useToast';
import { predictSalesWithLocalModel } from '@/lib/local-model';

export default function Dashboard() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [pendingOrders, setPendingOrders] = useState<ReplenishmentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'critical' | 'low' | 'optimal'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'value'>('name');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showRestockingApproval, setShowRestockingApproval] = useState(false);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [showSupplierOrder, setShowSupplierOrder] = useState(false);
  const [orderingItems, setOrderingItems] = useState<{item: InventoryItem, quantity: number}[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<'all' | 'overall' | 'seasonal' | 'category' | 'performers' | 'velocity'>('all');
  const { socket, isConnected } = useSocket();
  const { toasts, removeToast, success, error: errorToast, info } = useToast();

  // Festival-aware demand prediction
  const getFestivalMultiplier = (category: string): { multiplier: number; festival: string | null } => {
    const today = new Date();
    const month = today.getMonth(); // 0-11
    const day = today.getDate();

    // Festival calendar with demand multipliers
    const festivals = [
      { name: 'Christmas', month: 11, startDay: 20, endDay: 26, categories: { 'Fruit': 1.8, 'Vegetable': 1.5, 'Dairy': 2.0 } },
      { name: 'Thanksgiving', month: 10, startDay: 20, endDay: 28, categories: { 'Fruit': 1.7, 'Vegetable': 2.0, 'Dairy': 1.6 } },
      { name: 'Easter', month: 3, startDay: 15, endDay: 22, categories: { 'Fruit': 1.5, 'Vegetable': 1.3, 'Dairy': 1.8 } },
      { name: 'New Year', month: 0, startDay: 1, endDay: 3, categories: { 'Fruit': 1.6, 'Vegetable': 1.4, 'Dairy': 1.5 } },
      { name: 'Independence Day', month: 6, startDay: 2, endDay: 5, categories: { 'Fruit': 1.7, 'Vegetable': 1.8, 'Dairy': 1.4 } },
      { name: 'Diwali', month: 9, startDay: 24, endDay: 28, categories: { 'Fruit': 2.0, 'Vegetable': 1.6, 'Dairy': 2.2 } },
    ];

    for (const festival of festivals) {
      if (month === festival.month && day >= festival.startDay && day <= festival.endDay) {
        const multiplier = festival.categories[category as keyof typeof festival.categories] || 1.3;
        return { multiplier, festival: festival.name };
      }
    }

    return { multiplier: 1.0, festival: null };
  };

  // Calculate sales trend based on historical patterns
  const calculateSalesTrend = (item: InventoryItem): number => {
    // Simulate historical sales trend analysis
    // In production, this would fetch actual sales data from the database
    const baseVelocity = item.optimalStock / 30; // Daily average
    
    // Simulate weekly patterns (weekends higher sales)
    const dayOfWeek = new Date().getDay();
    const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1.0;
    
    // Simulate monthly trends (end of month higher sales)
    const dayOfMonth = new Date().getDate();
    const monthEndBoost = dayOfMonth > 25 ? 1.2 : 1.0;
    
    return baseVelocity * weekendBoost * monthEndBoost;
  };

  // Generate historical and forecasted sales data for visualization
  const generateSalesData = (item: InventoryItem) => {
    const baseDailyDemand = item.optimalStock / 30;
    const { multiplier: festivalMultiplier } = getFestivalMultiplier(item.category);
    
    // Generate 7 days of historical data (simulated)
    const historical = Array.from({ length: 7 }, (_, i) => {
      const daysAgo = 7 - i;
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      const dayOfWeek = date.getDay();
      const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1.0;
      const randomVariation = 0.8 + Math.random() * 0.4; // 80-120% variation
      return Math.round(baseDailyDemand * weekendFactor * randomVariation);
    });

    // Generate 7 days of forecast data
    const forecast = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      const dayOfWeek = date.getDay();
      const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1.0;
      const monthEndFactor = date.getDate() > 25 ? 1.2 : 1.0;
      return Math.round(baseDailyDemand * weekendFactor * monthEndFactor * festivalMultiplier);
    });

    return { historical, forecast };
  };

  // Stock Optimization Algorithm
  const optimizeStock = (item: InventoryItem) => {
    const baseDailyDemand = calculateSalesTrend(item);
    const { multiplier: festivalMultiplier } = getFestivalMultiplier(item.category || 'General');
    const adjustedDailyDemand = baseDailyDemand * festivalMultiplier;
    
    // Calculate optimal stock levels
    const leadTime = 7; // Days to restock
    const safetyStockDays = 3; // Safety buffer
    const demandDuringLeadTime = adjustedDailyDemand * leadTime;
    const safetyStock = adjustedDailyDemand * safetyStockDays;
    const reorderPoint = demandDuringLeadTime + safetyStock;
    const economicOrderQuantity = Math.ceil(adjustedDailyDemand * 14); // 2 weeks worth
    
    // Determine stock status and recommendation
    const currentStock = item.currentStock;
    const stockRatio = currentStock / reorderPoint;
    
    let status: 'critical' | 'low' | 'warning' | 'optimal' | 'excess';
    let recommendation: string;
    let orderQuantity = 0;
    let priority: 'urgent' | 'high' | 'medium' | 'low';
    
    if (stockRatio < 0.3) {
      status = 'critical';
      priority = 'urgent';
      orderQuantity = economicOrderQuantity;
      recommendation = `URGENT: Order ${orderQuantity} ${item.unit} immediately to avoid stockout`;
    } else if (stockRatio < 0.5) {
      status = 'low';
      priority = 'high';
      orderQuantity = economicOrderQuantity;
      recommendation = `Order ${orderQuantity} ${item.unit} within 24 hours`;
    } else if (stockRatio < 0.7) {
      status = 'warning';
      priority = 'medium';
      orderQuantity = Math.ceil(economicOrderQuantity * 0.7);
      recommendation = `Plan order for ${orderQuantity} ${item.unit} within 3 days`;
    } else if (stockRatio <= 1.3) {
      status = 'optimal';
      priority = 'low';
      orderQuantity = 0;
      recommendation = 'Stock levels are optimal';
    } else {
      status = 'excess';
      priority = 'low';
      orderQuantity = 0;
      const excessUnits = Math.floor(currentStock - reorderPoint);
      recommendation = `Consider reducing by ${excessUnits} ${item.unit} or running promotion`;
    }
    
    return {
      status,
      priority,
      recommendation,
      orderQuantity,
      reorderPoint,
      economicOrderQuantity,
      currentStock,
      stockRatio,
      dailyDemand: Math.round(adjustedDailyDemand),
      daysOfStock: Math.round(currentStock / adjustedDailyDemand),
      safetyStock: Math.round(safetyStock)
    };
  };

  // Auto-optimize all inventory
  const autoOptimizeInventory = () => {
    const optimizationResults = inventory.map(item => ({
      item,
      optimization: optimizeStock(item)
    }));

    // Filter items that need action
    const urgentItems = optimizationResults.filter(r => r.optimization.priority === 'urgent');
    const highPriorityItems = optimizationResults.filter(r => r.optimization.priority === 'high');
    const mediumPriorityItems = optimizationResults.filter(r => r.optimization.priority === 'medium');
    
    // Combine all items that need restocking
    const itemsNeedingRestock = [...urgentItems, ...highPriorityItems, ...mediumPriorityItems];
    
    if (itemsNeedingRestock.length > 0) {
      const urgentCount = urgentItems.length;
      const highCount = highPriorityItems.length;
      const mediumCount = mediumPriorityItems.length;
      
      let message = `${itemsNeedingRestock.length} items need restocking: `;
      const parts = [];
      if (urgentCount > 0) parts.push(`${urgentCount} urgent`);
      if (highCount > 0) parts.push(`${highCount} high priority`);
      if (mediumCount > 0) parts.push(`${mediumCount} medium priority`);
      message += parts.join(', ');
      
      info(message);
      setOrderingItems(itemsNeedingRestock.map(r => ({
        item: r.item,
        quantity: r.optimization.orderQuantity
      })));
      setShowSupplierOrder(true);
    } else {
      success('All inventory levels are optimized!');
    }

    return optimizationResults;
  };

  // Mini sparkline chart component
  const MiniSalesChart = ({ historical, forecast }: { historical: number[], forecast: number[] }) => {
    const allData = [...historical, ...forecast];
    const maxValue = Math.max(...allData);
    const width = 200;
    const height = 40;
    const padding = 2;

    // Create SVG path for historical data
    const historicalPoints = historical.map((value, index) => {
      const x = (index / (allData.length - 1)) * (width - padding * 2) + padding;
      const y = height - (value / maxValue) * (height - padding * 2) - padding;
      return `${x},${y}`;
    });

    // Create SVG path for forecast data
    const forecastPoints = forecast.map((value, index) => {
      const x = ((historical.length + index) / (allData.length - 1)) * (width - padding * 2) + padding;
      const y = height - (value / maxValue) * (height - padding * 2) - padding;
      return `${x},${y}`;
    });

    return (
      <svg width={width} height={height} className="mt-2">
        {/* Grid lines */}
        <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
        
        {/* Historical line */}
        <polyline
          points={historicalPoints.join(' ')}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
        />
        
        {/* Forecast line (dashed) */}
        <polyline
          points={[historicalPoints[historicalPoints.length - 1], ...forecastPoints].join(' ')}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeDasharray="4,2"
        />
        
        {/* Data points */}
        {historical.map((value, index) => {
          const x = (index / (allData.length - 1)) * (width - padding * 2) + padding;
          const y = height - (value / maxValue) * (height - padding * 2) - padding;
          return <circle key={`h-${index}`} cx={x} cy={y} r="2" fill="#3b82f6" />;
        })}
        
        {forecast.map((value, index) => {
          const x = ((historical.length + index) / (allData.length - 1)) * (width - padding * 2) + padding;
          const y = height - (value / maxValue) * (height - padding * 2) - padding;
          return <circle key={`f-${index}`} cx={x} cy={y} r="2" fill="#10b981" />;
        })}
        
        {/* Divider line between historical and forecast */}
        <line
          x1={(historical.length / (allData.length - 1)) * (width - padding * 2) + padding}
          y1={padding}
          x2={(historical.length / (allData.length - 1)) * (width - padding * 2) + padding}
          y2={height - padding}
          stroke="#9ca3af"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
      </svg>
    );
  };

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory');
      const result = await response.json();
      if (result.success) {
        setInventory(result.data);
        setLastSync(result.lastSync);
        setError('');
        
        // Analyze stock levels and send real-time notifications
        const inventoryData = result.data as InventoryItem[];
        const optimizationResults = inventoryData.map(item => ({
          item,
          optimization: optimizeStock(item)
        }));
        
        const urgentItems = optimizationResults.filter(r => r.optimization.priority === 'urgent');
        const highPriorityItems = optimizationResults.filter(r => r.optimization.priority === 'high');
        const mediumPriorityItems = optimizationResults.filter(r => r.optimization.priority === 'medium');
        const criticalItems = optimizationResults.filter(r => r.optimization.stockRatio < 0.3);
        
        // Send notifications based on stock analysis
        if (urgentItems.length > 0) {
          errorToast(`⚠️ ${urgentItems.length} item(s) critically low! Immediate restocking required.`);
        } else if (highPriorityItems.length > 0) {
          info(`📦 ${highPriorityItems.length} item(s) need restocking within 24 hours.`);
        } else if (mediumPriorityItems.length > 0) {
          info(`📊 ${mediumPriorityItems.length} item(s) should be restocked within 3 days.`);
        }
        
        // Additional insights
        const totalItemsNeedingAttention = urgentItems.length + highPriorityItems.length + mediumPriorityItems.length;
        if (totalItemsNeedingAttention === 0) {
          success('✅ All inventory levels are optimal!');
        } else if (totalItemsNeedingAttention > 10) {
          info(`📈 Stock optimization recommended for ${totalItemsNeedingAttention} items.`);
        }
        
      } else {
        throw new Error(result.error || 'Failed to fetch inventory');
      }
    } catch (err) {
      const message = 'Failed to fetch inventory data';
      setError(message);
      errorToast(message);
      console.error(err);
    }
  };

  // Fetch pending replenishment orders
  const fetchPendingOrders = async () => {
    try {
      const response = await fetch('/api/replenishment');
      const result = await response.json();
      if (result.success) {
        setPendingOrders(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchInventory(), fetchPendingOrders()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // WebSocket real-time updates
  useEffect(() => {
    if (socket) {
      socket.on('inventory-updated', () => {
        console.log('📡 Real-time: Inventory updated');
        fetchInventory();
      });

      socket.on('replenishment-updated', () => {
        console.log('📡 Real-time: Replenishment updated');
        fetchPendingOrders();
      });

      return () => {
        socket.off('inventory-updated');
        socket.off('replenishment-updated');
      };
    }
  }, [socket]);

  // Fallback polling for browsers that don't support WebSocket
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isConnected) {
        fetchInventory();
        fetchPendingOrders();
      }
    }, 10000); // 10 seconds fallback

    return () => clearInterval(interval);
  }, [isConnected]);

  // Handle order approval
  const handleApprove = async (orderId: string) => {
    try {
      const response = await fetch('/api/replenishment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action: 'approve' })
      });

      const result = await response.json();
      if (result.success) {
        setPendingOrders(prev => prev.filter(order => order.id !== orderId));
        success(`Order ${orderId} approved! Procurement initiated.`);
      } else {
        throw new Error(result.error || 'Approval failed');
      }
    } catch (err) {
      console.error('Failed to approve order:', err);
      errorToast('Failed to approve order. Please try again.');
    }
  };

  // Handle order rejection
  const handleReject = async (orderId: string) => {
    try {
      const response = await fetch('/api/replenishment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action: 'reject' })
      });

      const result = await response.json();
      if (result.success) {
        setPendingOrders(prev => prev.filter(order => order.id !== orderId));
        info(`Order ${orderId} rejected`);
      } else {
        throw new Error(result.error || 'Rejection failed');
      }
    } catch (err) {
      console.error('Failed to reject order:', err);
      errorToast('Failed to reject order. Please try again.');
    }
  };

  // Handle restocking approval and send requests to suppliers
  const handleRestockingApproval = async (items: InventoryItem[]) => {
    try {
      const restockRequests = items.map(item => ({
        sku: item.sku,
        name: item.name,
        currentStock: item.currentStock,
        optimalStock: item.optimalStock,
        quantityNeeded: item.optimalStock - item.currentStock,
        location: item.location,
        urgency: (item.currentStock / item.optimalStock) <= 0.2 ? 'critical' : 'low'
      }));

      const response = await fetch('/api/restocking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests: restockRequests })
      });

      const result = await response.json();
      
      if (result.success) {
        success(`✓ Restocking requests sent for ${items.length} product${items.length > 1 ? 's' : ''}!`);
        setShowRestockingApproval(false);
        fetchInventory();
      } else {
        throw new Error(result.error || 'Failed to send restocking requests');
      }
    } catch (err) {
      console.error('Restocking error:', err);
      errorToast('Failed to send restocking requests. Please try again.');
    }
  };

  // Handle clicking on low stock items stat card
  const handleLowStockClick = () => {
    const lowStock = inventory.filter(item => {
      const ratio = item.currentStock / item.optimalStock;
      return ratio <= 0.5;
    });
    
    if (lowStock.length > 0) {
      setLowStockItems(lowStock);
      setShowRestockingApproval(true);
    }
  };

  // Handle notification click to view item
  const handleViewItem = (item: InventoryItem) => {
    setFilterStatus('critical');
    setSearchQuery(item.sku);
  };

  // Filter and search inventory
  const filteredInventory = inventory.filter(item => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const stockPercentage = (item.currentStock / item.optimalStock) * 100;
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'critical' && stockPercentage <= 20) ||
      (filterStatus === 'low' && stockPercentage > 20 && stockPercentage <= 50) ||
      (filterStatus === 'optimal' && stockPercentage >= 70);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
        <SignedIn>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-800 font-semibold text-lg">Loading...</p>
          </div>
        </SignedIn>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Critical Stock Notifications */}
      <CriticalStockNotifications 
        inventory={inventory}
        onViewItem={handleViewItem}
      />
      
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-gray-900 to-black shadow-xl border-b border-gray-700">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center text-2xl shadow-lg">
                📦
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">AIMS</h1>
                <p className="text-gray-200 text-sm font-medium">Autonomous Inventory Management System</p>
              </div>
            </div>

            <SearchBar onSearch={setSearchQuery} />

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  fetchInventory();
                  fetchPendingOrders();
                  info('Dashboard refreshed');
                }}
                className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-gray-600 hover:bg-white/20 transition-all"
                title="Refresh Dashboard"
              >
                <span className="text-white text-xl">🔄</span>
              </button>
              <NotificationBell inventory={inventory} />
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <div className="inline-flex items-center gap-2 bg-gray-100 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                <span className="text-xs font-bold text-gray-900">System Active</span>
              </div>
              {isConnected && (
                <div className="inline-flex items-center gap-2 bg-blue-50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div>
                  <span className="text-xs font-bold text-blue-900">Real-Time Sync</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total SKUs</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{inventory.length}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                📦
              </div>
            </div>
          </div>

          <div 
            onClick={handleLowStockClick}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Low Stock Items</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">
                  {inventory.filter(i => {
                    const ratio = i.currentStock / i.optimalStock;
                    return ratio <= 0.5; // Critical (≤20%) + Low (≤50%)
                  }).length}
                </h3>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                ⚠️
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending Orders</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{pendingOrders.length}</h3>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl">
                📋
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Optimal Stock</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{inventory.filter(i => i.currentStock >= i.optimalStock * 0.7).length}</h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                ✅
              </div>
            </div>
          </div>
        </div>

        {/* Pending Replenishment Alerts */}
        {pendingOrders.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Pending Approvals</h2>
                <p className="text-sm text-gray-700 font-medium">Automated procurement orders awaiting review</p>
              </div>
              <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                {pendingOrders.length}
              </span>
            </div>
            <div className="space-y-4">
              {pendingOrders.map(order => (
                <ReplenishmentAlert
                  key={order.id}
                  order={order}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          </section>
        )}

        {/* Inventory Overview */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Real-Time Stock Levels</h2>
                <p className="text-sm text-gray-700 font-medium">Live inventory monitoring powered by Vision AI</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Action Buttons Row */}
              <div className="flex items-center gap-2">
                <SmartNotificationsPanel
                  inventory={inventory}
                  onActionComplete={fetchInventory}
                  onSuccess={success}
                  onError={errorToast}
                />
                
                <RecordSale
                  inventory={inventory}
                  onSaleRecorded={fetchInventory}
                  onSuccess={success}
                  onError={errorToast}
                />
                
                <ReportDefect
                  inventory={inventory}
                  onDefectReported={fetchInventory}
                  onSuccess={success}
                  onError={errorToast}
                />
                
                <GlobalVisionScan
                  onScanComplete={fetchInventory}
                  onSuccess={success}
                  onError={errorToast}
                />
                
                <BarcodeScanner
                  onScanComplete={fetchInventory}
                  onSuccess={success}
                  onError={errorToast}
                />
                
                <button
                  onClick={() => setShowManualEntry(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold flex items-center gap-2 shadow-lg whitespace-nowrap"
                >
                  <span>➕</span> Add Item
                </button>
              </div>

              {/* Filters and Actions */}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={autoOptimizeInventory}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold flex items-center gap-2 shadow-lg whitespace-nowrap"
                  title="AI-powered inventory optimization"
                >
                  <span>🤖</span> Auto-Optimize
                </button>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="critical">Critical</option>
                  <option value="low">Low</option>
                  <option value="optimal">Optimal</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                >
                  <option value="name">Sort by Name</option>
                  <option value="stock">Sort by Stock</option>
                  <option value="value">Sort by Value</option>
                </select>

                <button
                  onClick={() => {
                    const csv = 'SKU,Name,Category,Current Stock,Optimal Stock,Unit,Price,Location,Status\n' +
                      inventory.map(item => 
                        `${item.sku},"${item.name}",${item.category || 'N/A'},${item.currentStock},${item.optimalStock},${item.unit},₹${item.price || 0},"${item.location}",${item.currentStock / item.optimalStock <= 0.2 ? 'CRITICAL' : item.currentStock / item.optimalStock <= 0.5 ? 'LOW' : 'OK'}`
                      ).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    success('Inventory exported to CSV');
                  }}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-semibold flex items-center gap-2 whitespace-nowrap"
                >
                  <span>📥</span> Export
                </button>
              </div>
            </div>
          </div>
          
          {inventory.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Inventory Items</h3>
              <p className="text-gray-700 mb-6 font-medium">Add items to get started</p>
              <button 
                onClick={() => setShowManualEntry(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg"
              >
                ➕ Add New Item
              </button>
            </div>
          ) : (
            <VirtualInventoryTable 
              inventory={filteredInventory}
              onStockUpdate={() => {
                fetchInventory();
                fetchPendingOrders();
              }}
            />
          )}
        </section>

        {/* Analytics Section */}
        {inventory.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Inventory Analytics</h2>
                <p className="text-sm text-gray-700 font-medium">AI-powered demand forecasting and stock optimization</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Demand Forecast Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">📈 Demand Forecast</h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">Next 7 Days</span>
                </div>
                
                {/* Festival Alert */}
                {(() => {
                  const festivalCheck = getFestivalMultiplier(inventory[0]?.category || 'Fruit');
                  if (festivalCheck.festival) {
                    return (
                      <div className="mb-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🎉</span>
                          <div>
                            <p className="text-sm font-bold text-orange-900">{festivalCheck.festival} Season</p>
                            <p className="text-xs text-orange-700">Demand forecasts adjusted for festival requirements</p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                <div className="space-y-4">
                  {inventory.slice(0, 5).map((item) => {
                    const currentStock = item.currentStock;
                    const optimalStock = item.optimalStock;
                    
                    // Enhanced prediction with trends and festivals
                    const baseDailyDemand = calculateSalesTrend(item);
                    const { multiplier: festivalMultiplier, festival } = getFestivalMultiplier(item.category);
                    const adjustedDailyDemand = Math.ceil(baseDailyDemand * festivalMultiplier);
                    const forecastedDemand = adjustedDailyDemand * 7;
                    const stockAfter7Days = Math.max(0, currentStock - forecastedDemand);
                    const needsRestock = stockAfter7Days < optimalStock * 0.3;

                    return (
                      <div key={item.sku} className="border-b border-gray-100 pb-3 last:border-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                              {festival && (
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-semibold">
                                  🎉 +{Math.round((festivalMultiplier - 1) * 100)}%
                                </span>
                              )}
                            </div>
                          </div>
                          {needsRestock && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">
                              ⚠️ Restock
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-gray-600">Current</p>
                            <p className="font-bold text-gray-900">{currentStock} {item.unit}</p>
                          </div>
                          <div className="bg-blue-50 p-2 rounded">
                            <p className="text-blue-600">Forecast Use</p>
                            <p className="font-bold text-blue-900">{forecastedDemand} {item.unit}</p>
                            <p className="text-xs text-blue-600 mt-0.5">{adjustedDailyDemand}/day</p>
                          </div>
                          <div className={`p-2 rounded ${needsRestock ? 'bg-red-50' : 'bg-green-50'}`}>
                            <p className={needsRestock ? 'text-red-600' : 'text-green-600'}>After 7d</p>
                            <p className={`font-bold ${needsRestock ? 'text-red-900' : 'text-green-900'}`}>
                              {stockAfter7Days} {item.unit}
                            </p>
                          </div>
                        </div>
                        
                        {/* Trend Indicators */}
                        <div className="mt-2 flex gap-2">
                          {new Date().getDay() === 0 || new Date().getDay() === 6 ? (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">📊 Weekend Boost</span>
                          ) : null}
                          {new Date().getDate() > 25 ? (
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">📅 Month-End Surge</span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">💡 Insight:</span> AI-powered predictions based on historical sales, seasonal trends, and festival calendars
                  </p>
                </div>
              </div>

              {/* Optimal Stock Levels Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">🎯 Stock Optimization</h3>
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">AI Recommended</span>
                </div>

                {(() => {
                  const criticalItems = inventory.filter(item => {
                    const optimization = optimizeStock(item);
                    return optimization.priority === 'urgent' || optimization.priority === 'high' || optimization.priority === 'medium';
                  });

                  if (criticalItems.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">✅</div>
                        <p className="text-gray-600 font-medium">All stock levels optimized!</p>
                        <p className="text-xs text-gray-500 mt-2">No critical items need attention</p>
                      </div>
                    );
                  }

                  return (
                    <div className="flex-1" style={{ height: '400px' }}>
                      <Virtuoso
                        data={criticalItems}
                        itemContent={(index, item) => {
                          const optimization = optimizeStock(item);

                          return (
                            <div className="border-b border-gray-100 pb-3 mb-3">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                                  <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded font-semibold ${
                                  optimization.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                  optimization.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {optimization.priority === 'urgent' ? '🔴 URGENT' :
                                   optimization.priority === 'high' ? '🟠 HIGH' : '🟡 MEDIUM'}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      optimization.priority === 'urgent' ? 'bg-red-600' :
                                      optimization.priority === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                                    }`}
                                    style={{ width: `${Math.min(100, optimization.stockRatio * 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-semibold text-gray-600">{Math.round(optimization.stockRatio * 100)}%</span>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                                <div className="bg-gray-50 p-2 rounded">
                                  <p className="text-gray-600">Current</p>
                                  <p className="font-bold text-gray-900">{optimization.currentStock} {item.unit}</p>
                                </div>
                                <div className="bg-blue-50 p-2 rounded">
                                  <p className="text-blue-600">Reorder Point</p>
                                  <p className="font-bold text-blue-900">{optimization.reorderPoint} {item.unit}</p>
                                </div>
                                <div className="bg-green-50 p-2 rounded">
                                  <p className="text-green-600">Order Qty</p>
                                  <p className="font-bold text-green-900">{optimization.orderQuantity} {item.unit}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                <div className="bg-purple-50 p-1.5 rounded flex items-center justify-between">
                                  <span className="text-purple-600">Daily Demand:</span>
                                  <span className="font-semibold text-purple-900">{optimization.dailyDemand} {item.unit}</span>
                                </div>
                                <div className="bg-indigo-50 p-1.5 rounded flex items-center justify-between">
                                  <span className="text-indigo-600">Days Left:</span>
                                  <span className="font-semibold text-indigo-900">{optimization.daysOfStock}d</span>
                                </div>
                              </div>
                              
                              <div className={`mt-2 p-2 rounded text-xs ${
                                optimization.priority === 'urgent' ? 'bg-red-50 border border-red-200' :
                                optimization.priority === 'high' ? 'bg-orange-50 border border-orange-200' :
                                'bg-yellow-50 border border-yellow-200'
                              }`}>
                                <p className="font-semibold text-gray-800 flex items-start gap-1">
                                  <span>📋</span>
                                  <span>{optimization.recommendation}</span>
                                </p>
                              </div>
                            </div>
                          );
                        }}
                      />
                    </div>
                  );
                })()}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">💡 Insight:</span> Optimization based on demand patterns, lead times, and safety stock calculations
                  </p>
                </div>

                {/* Supplier Order Action */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      // Use optimization function to get accurate order quantities
                      const optimizationResults = inventory.map(item => ({ item, optimization: optimizeStock(item) }));
                      
                      const urgentItems = optimizationResults.filter(({ optimization }) => optimization.priority === 'urgent');
                      const highItems = optimizationResults.filter(({ optimization }) => optimization.priority === 'high');
                      const mediumItems = optimizationResults.filter(({ optimization }) => optimization.priority === 'medium');
                      
                      const itemsToOrder = [...urgentItems, ...highItems, ...mediumItems].map(({ item, optimization }) => ({
                        item,
                        quantity: optimization.orderQuantity
                      }));
                      
                      if (itemsToOrder.length > 0) {
                        const parts = [];
                        if (urgentItems.length > 0) parts.push(`${urgentItems.length} urgent`);
                        if (highItems.length > 0) parts.push(`${highItems.length} high priority`);
                        if (mediumItems.length > 0) parts.push(`${mediumItems.length} medium priority`);
                        const message = `${itemsToOrder.length} items need restocking: ${parts.join(', ')}`;
                        info(message);
                      }
                      
                      setOrderingItems(itemsToOrder);
                      setShowSupplierOrder(true);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <span className="text-xl">📦</span>
                    Order Optimized Stock
                    {inventory.filter(i => {
                      const opt = optimizeStock(i);
                      return opt.priority === 'urgent' || opt.priority === 'high' || opt.priority === 'medium';
                    }).length > 0 && (
                      <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                        {inventory.filter(i => {
                          const opt = optimizeStock(i);
                          return opt.priority === 'urgent' || opt.priority === 'high' || opt.priority === 'medium';
                        }).length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <p className="text-xs text-blue-700 font-semibold mb-1">Avg Stock Level</p>
                <p className="text-2xl font-bold text-blue-900">
                  {Math.round(inventory.reduce((sum, item) => sum + (item.currentStock / item.optimalStock), 0) / inventory.length * 100)}%
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <p className="text-xs text-green-700 font-semibold mb-1">Well Stocked</p>
                <p className="text-2xl font-bold text-green-900">
                  {inventory.filter(i => i.currentStock >= i.optimalStock * 0.7 && i.currentStock <= i.optimalStock * 1.3).length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                <p className="text-xs text-yellow-700 font-semibold mb-1">Need Restock</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {inventory.filter(i => i.currentStock < i.optimalStock * 0.5).length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <p className="text-xs text-orange-700 font-semibold mb-1">Overstocked</p>
                <p className="text-2xl font-bold text-orange-900">
                  {inventory.filter(i => i.currentStock > i.optimalStock * 1.5).length}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Advanced Insights Section */}
        {inventory.length > 0 && (
          <section className="mt-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💡</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Sales Insights</h2>
                  <p className="text-sm text-gray-700 font-medium">Comprehensive sales analysis and performance metrics</p>
                </div>
              </div>
              
              {/* Filter Selector */}
              <select
                value={selectedInsight}
                onChange={(e) => setSelectedInsight(e.target.value as any)}
                className="px-4 py-2.5 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white text-sm font-semibold text-gray-700 shadow-sm hover:border-purple-400 transition-colors"
              >
                <option value="all">🌟 All Insights</option>
                <option value="overall">📊 Overall Sales</option>
                <option value="seasonal">🌸 Seasonal Trends</option>
                <option value="category">📦 Category Performance</option>
                <option value="performers">🏆 Top Performers</option>
                <option value="velocity">🚀 Velocity Analysis</option>
              </select>
            </div>

            {/* Insights Container */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-8 space-y-10">
                
                {/* Overall Sales - Always visible or when filtered */}
                {(selectedInsight === 'all' || selectedInsight === 'overall') && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b-2 border-blue-100">
                      <span className="text-3xl">📊</span>
                      <h3 className="text-2xl font-bold text-gray-900">Overall Sales Performance</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 rounded-2xl p-6 border-2 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-2xl">💰</span>
                          </div>
                          <p className="text-sm text-blue-800 font-bold">Total Inventory Value</p>
                        </div>
                        <p className="text-4xl font-black text-blue-900 mb-2">
                          ₹{inventory.reduce((sum, item) => sum + (item.currentStock * (item.price || 0)), 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-blue-700 font-semibold">Current stock value across all items</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 rounded-2xl p-6 border-2 border-green-200 shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-2xl">📈</span>
                          </div>
                          <p className="text-sm text-green-800 font-bold">Avg Daily Velocity</p>
                        </div>
                        <p className="text-4xl font-black text-green-900 mb-2">
                          {Math.round(inventory.reduce((sum, item) => sum + calculateSalesTrend(item), 0))} <span className="text-2xl">units</span>
                        </p>
                        <p className="text-xs text-green-700 font-semibold">Total units sold per day on average</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 via-purple-100 to-pink-100 rounded-2xl p-6 border-2 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-2xl">⏱️</span>
                          </div>
                          <p className="text-sm text-purple-800 font-bold">Stock Turnover</p>
                        </div>
                        <p className="text-4xl font-black text-purple-900 mb-2">
                          {(() => {
                            const avgDaysOfStock = inventory.reduce((sum, item) => {
                              const dailyDemand = calculateSalesTrend(item);
                              return sum + (dailyDemand > 0 ? item.currentStock / dailyDemand : 30);
                            }, 0) / inventory.length;
                            return Math.round(avgDaysOfStock);
                          })()} <span className="text-2xl">days</span>
                        </p>
                        <p className="text-xs text-purple-700 font-semibold">Average duration before restock needed</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                      <h4 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
                        <span className="text-2xl">📊</span> Stock Distribution by Status
                      </h4>
                      <div className="space-y-4">
                        {[
                          { label: 'Optimal Stock', color: 'bg-green-500', bgLight: 'bg-green-50', textColor: 'text-green-700', count: inventory.filter(i => i.currentStock >= i.optimalStock * 0.7 && i.currentStock <= i.optimalStock * 1.3).length },
                          { label: 'Low Stock', color: 'bg-yellow-500', bgLight: 'bg-yellow-50', textColor: 'text-yellow-700', count: inventory.filter(i => i.currentStock >= i.optimalStock * 0.3 && i.currentStock < i.optimalStock * 0.7).length },
                          { label: 'Critical Stock', color: 'bg-red-500', bgLight: 'bg-red-50', textColor: 'text-red-700', count: inventory.filter(i => i.currentStock < i.optimalStock * 0.3).length },
                          { label: 'Overstocked', color: 'bg-blue-500', bgLight: 'bg-blue-50', textColor: 'text-blue-700', count: inventory.filter(i => i.currentStock > i.optimalStock * 1.3).length }
                        ].map(({ label, color, bgLight, textColor, count }) => (
                          <div key={label} className="group">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-bold text-gray-800">{label}</span>
                              <span className={`text-sm font-bold ${textColor} ${bgLight} px-3 py-1 rounded-full`}>
                                {count} items ({Math.round((count / inventory.length) * 100)}%)
                              </span>
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden shadow-inner">
                              <div 
                                className={`${color} h-8 flex items-center justify-center text-white text-sm font-bold transition-all duration-700 group-hover:opacity-90`}
                                style={{ width: `${(count / inventory.length) * 100}%` }}
                              >
                                {count > 0 && <span className="drop-shadow">{count} items</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Seasonal Trends */}
                {(selectedInsight === 'all' || selectedInsight === 'seasonal') && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b-2 border-orange-100">
                      <span className="text-3xl">🌸</span>
                      <h3 className="text-2xl font-bold text-gray-900">Seasonal Trends</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-orange-50 via-orange-100 to-yellow-50 rounded-2xl p-6 border-2 border-orange-200 shadow-md">
                        <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                          <span className="text-2xl">🎉</span> Festival Impact Analysis
                        </h4>
                        {(() => {
                          const festivalImpact = inventory.map(item => {
                            const { multiplier, festival } = getFestivalMultiplier(item.category || 'General');
                            return { item, multiplier, festival };
                          });
                          const activeFestival = festivalImpact.find(f => f.festival);
                          
                          if (activeFestival) {
                            return (
                              <div>
                                <div className="bg-white rounded-xl p-4 mb-4 border-2 border-orange-300 shadow-sm">
                                  <p className="text-lg text-orange-900 font-black mb-1 flex items-center gap-2">
                                    🎊 {activeFestival.festival} Period
                                  </p>
                                  <p className="text-sm text-orange-700 font-semibold">
                                    Demand multipliers active across all categories
                                  </p>
                                </div>
                                <div className="space-y-3">
                                  {Array.from(new Set(inventory.map(i => i.category))).map(category => {
                                    const { multiplier } = getFestivalMultiplier(category || 'General');
                                    const boost = ((multiplier - 1) * 100).toFixed(0);
                                    return (
                                      <div key={category} className="flex justify-between items-center bg-white rounded-xl px-4 py-3 border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                                        <span className="text-sm font-bold text-gray-800">{category}</span>
                                        <span className="text-lg font-black text-orange-600 bg-orange-100 px-3 py-1 rounded-full">+{boost}%</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div className="text-center py-10 bg-white rounded-xl border-2 border-dashed border-orange-200">
                                <span className="text-5xl mb-3 block">📅</span>
                                <p className="text-base font-bold text-gray-700">No active festivals</p>
                                <p className="text-sm text-gray-600 mt-2">Operating under normal demand patterns</p>
                              </div>
                            );
                          }
                        })()}
                      </div>

                      <div className="bg-gradient-to-br from-indigo-50 via-indigo-100 to-blue-50 rounded-2xl p-6 border-2 border-indigo-200 shadow-md">
                        <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                          <span className="text-2xl">📅</span> Demand Patterns
                        </h4>
                        <div className="space-y-4">
                          <div className="bg-white rounded-xl p-4 border-2 border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-bold text-gray-800">Weekend Boost</span>
                              <span className="text-2xl font-black text-indigo-600">+30%</span>
                            </div>
                            <div className="bg-indigo-50 rounded-lg p-2">
                              <p className="text-xs text-indigo-700 font-semibold">📆 Saturday-Sunday demand increase</p>
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-xl p-4 border-2 border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-bold text-gray-800">Month-End Surge</span>
                              <span className="text-2xl font-black text-indigo-600">+20%</span>
                            </div>
                            <div className="bg-indigo-50 rounded-lg p-2">
                              <p className="text-xs text-indigo-700 font-semibold">📅 Last 5 days of each month</p>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 border-2 border-indigo-400 shadow-md hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-bold text-white">Combined Peak</span>
                              <span className="text-2xl font-black text-white">+56%</span>
                            </div>
                            <div className="bg-white/20 rounded-lg p-2">
                              <p className="text-xs text-white font-semibold">🚀 Weekend + Month-end overlap</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Category Performance */}
                {(selectedInsight === 'all' || selectedInsight === 'category') && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b-2 border-purple-100">
                      <span className="text-3xl">📦</span>
                      <h3 className="text-2xl font-bold text-gray-900">Category Performance</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-5">
                      {Array.from(new Set(inventory.map(i => i.category))).map(category => {
                        const categoryItems = inventory.filter(i => i.category === category);
                        const totalValue = categoryItems.reduce((sum, item) => sum + (item.currentStock * (item.price || 0)), 0);
                        const avgVelocity = categoryItems.reduce((sum, item) => sum + calculateSalesTrend(item), 0) / categoryItems.length;
                        const stockHealth = categoryItems.filter(i => i.currentStock >= i.optimalStock * 0.7).length / categoryItems.length * 100;
                        
                        return (
                          <div key={category} className="bg-gradient-to-r from-white via-gray-50 to-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm hover:shadow-lg hover:border-purple-300 transition-all">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <span className="text-2xl">📦</span> {category}
                              </h4>
                              <span className="text-sm bg-gray-800 text-white px-4 py-2 rounded-full font-bold shadow-sm">
                                {categoryItems.length} items
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                                <p className="text-xs text-blue-700 font-bold mb-1">Total Value</p>
                                <p className="text-xl font-black text-blue-700">${totalValue.toLocaleString()}</p>
                              </div>
                              <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                                <p className="text-xs text-green-700 font-bold mb-1">Avg Velocity</p>
                                <p className="text-xl font-black text-green-700">{Math.round(avgVelocity)}/day</p>
                              </div>
                              <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                                <p className="text-xs text-purple-700 font-bold mb-1">Stock Health</p>
                                <p className="text-xl font-black text-purple-700">{Math.round(stockHealth)}%</p>
                              </div>
                            </div>
                            
                            <div className="bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                              <div 
                                className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-3 rounded-full transition-all duration-700 shadow-sm"
                                style={{ width: `${stockHealth}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Top Performers */}
                {(selectedInsight === 'all' || selectedInsight === 'performers') && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b-2 border-yellow-100">
                      <span className="text-3xl">🏆</span>
                      <h3 className="text-2xl font-bold text-gray-900">Top Performers</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-green-50 via-emerald-100 to-green-50 rounded-2xl p-6 border-2 border-green-200 shadow-md">
                        <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                          <span className="text-2xl">⚡</span> Fastest Moving Items
                        </h4>
                        <div className="space-y-3">
                          {inventory
                            .map(item => ({ ...item, velocity: calculateSalesTrend(item) }))
                            .sort((a, b) => b.velocity - a.velocity)
                            .slice(0, 5)
                            .map((item, idx) => (
                              <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-4 border-2 border-green-200 shadow-sm hover:shadow-md hover:border-green-300 transition-all">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                                  <span className="text-lg font-black text-white">#{idx + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                  <p className="text-xs text-gray-600 font-semibold">SKU: {item.sku}</p>
                                </div>
                                <span className="text-base font-black text-green-700 bg-green-100 px-3 py-1 rounded-full">
                                  {Math.round(item.velocity)} u/d
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 via-cyan-100 to-blue-50 rounded-2xl p-6 border-2 border-blue-200 shadow-md">
                        <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                          <span className="text-2xl">💰</span> Highest Value Items
                        </h4>
                        <div className="space-y-3">
                          {inventory
                            .map(item => ({ ...item, value: item.currentStock * (item.price || 0) }))
                            .sort((a, b) => b.value - a.value)
                            .slice(0, 5)
                            .map((item, idx) => (
                              <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-4 border-2 border-blue-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                                  <span className="text-lg font-black text-white">#{idx + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                  <p className="text-xs text-gray-600 font-semibold">{item.currentStock} × ₹{item.price}</p>
                                </div>
                                <span className="text-base font-black text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                                  ₹{item.value.toLocaleString()}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Velocity Analysis */}
                {(selectedInsight === 'all' || selectedInsight === 'velocity') && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b-2 border-pink-100">
                      <span className="text-3xl">🚀</span>
                      <h3 className="text-2xl font-bold text-gray-900">Velocity Analysis</h3>
                    </div>
                    
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                      <h4 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
                        <span className="text-2xl">📊</span> Inventory Movement Classification
                      </h4>
                      
                      <div className="space-y-5">
                        {[
                          { label: 'Fast Movers', desc: 'More than 10 units/day', emoji: '🔥', color: 'green', items: inventory.filter(i => calculateSalesTrend(i) > 10) },
                          { label: 'Medium Movers', desc: '5-10 units/day', emoji: '⚡', color: 'blue', items: inventory.filter(i => calculateSalesTrend(i) >= 5 && calculateSalesTrend(i) <= 10) },
                          { label: 'Slow Movers', desc: 'Less than 5 units/day', emoji: '🐌', color: 'yellow', items: inventory.filter(i => calculateSalesTrend(i) < 5) }
                        ].map(({ label, desc, emoji, color, items }) => (
                          <div key={label} className={`border-2 border-${color}-200 bg-${color}-50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow`}>
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h5 className="font-black text-gray-900 text-lg flex items-center gap-2">
                                  <span className="text-2xl">{emoji}</span> {label}
                                </h5>
                                <p className="text-sm text-gray-700 font-semibold">{desc}</p>
                              </div>
                              <span className={`text-3xl font-black bg-${color}-500 text-white px-5 py-2 rounded-2xl shadow-md`}>
                                {items.length}
                              </span>
                            </div>
                            
                            {items.length > 0 && (
                              <div className="bg-white rounded-xl p-3 border border-${color}-200">
                                <div className="flex flex-wrap gap-2">
                                  {items.slice(0, 10).map(item => (
                                    <span key={item.id} className={`text-xs bg-${color}-100 text-${color}-800 px-3 py-1.5 rounded-lg border border-${color}-300 font-semibold`}>
                                      {item.name}
                                    </span>
                                  ))}
                                  {items.length > 10 && (
                                    <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-300 font-bold">
                                      +{items.length - 10} more items
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 rounded-2xl p-6 border-2 border-purple-200 shadow-md">
                        <h5 className="font-black text-gray-900 text-lg mb-4 flex items-center gap-2">
                          <span className="text-2xl">💡</span> Smart Recommendations
                        </h5>
                        <ul className="space-y-3">
                          {(() => {
                            const recommendations = [];
                            const fastMovers = inventory.filter(i => calculateSalesTrend(i) > 10);
                            const slowMovers = inventory.filter(i => calculateSalesTrend(i) < 5);
                            
                            if (fastMovers.length > 0) {
                              recommendations.push({
                                icon: '🔥',
                                text: `${fastMovers.length} fast-moving items require frequent monitoring to prevent stockouts`,
                                color: 'text-orange-700'
                              });
                            }
                            if (slowMovers.length > 0) {
                              recommendations.push({
                                icon: '📉',
                                text: `${slowMovers.length} slow-moving items - consider promotional offers or reduced ordering`,
                                color: 'text-blue-700'
                              });
                            }
                            
                            const criticalLowStock = inventory.filter(i => {
                              const opt = optimizeStock(i);
                              return opt.priority === 'urgent';
                            });
                            if (criticalLowStock.length > 0) {
                              recommendations.push({
                                icon: '⚠️',
                                text: `${criticalLowStock.length} items critically low - immediate restocking recommended`,
                                color: 'text-red-700'
                              });
                            }
                            
                            if (recommendations.length === 0) {
                              recommendations.push({
                                icon: '✅',
                                text: 'Inventory levels are well-balanced across all velocity segments',
                                color: 'text-green-700'
                              });
                            }
                            
                            return recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-purple-200 shadow-sm">
                                <span className="text-2xl">{rec.icon}</span>
                                <span className={`text-sm font-bold ${rec.color} flex-1`}>{rec.text}</span>
                              </li>
                            ));
                          })()}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-8 py-4">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm text-gray-700 font-medium">© 2025 AIMS - Autonomous Inventory Management System</p>
        </div>
      </footer>

      {/* Add Product Modals */}
      {showManualEntry && (
        <AddProductManual
          onClose={() => setShowManualEntry(false)}
          onSuccess={() => {
            fetchInventory();
            success('Product added successfully!');
          }}
        />
      )}

      {showImageUpload && (
        <AddProductImage
          onClose={() => setShowImageUpload(false)}
          onSuccess={() => {
            fetchInventory();
            success('Products added from image!');
          }}
        />
      )}

      {/* Restocking Approval Modal */}
      {showRestockingApproval && (
        <RestockingApprovalModal
          items={lowStockItems}
          onApprove={handleRestockingApproval}
          onCancel={() => setShowRestockingApproval(false)}
        />
      )}

      {/* Supplier Order Modal */}
      {showSupplierOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <span className="text-3xl">📦</span>
                    Supplier Order Request
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">Review and send orders to suppliers</p>
                </div>
                <button
                  onClick={() => setShowSupplierOrder(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {orderingItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">All Items Well Stocked!</h3>
                  <p className="text-gray-600">No items currently need restocking from suppliers.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">📊 Total Items:</span> {orderingItems.length} products need restocking
                    </p>
                  </div>

                  {/* Group by supplier (simulated) */}
                  {Object.entries(
                    orderingItems.reduce((acc, {item, quantity}) => {
                      // Simulate supplier assignment based on category
                      const supplier = item.category === 'Fruit' ? 'Fresh Produce Co.' :
                                     item.category === 'Vegetable' ? 'Green Valley Farms' :
                                     item.category === 'Dairy' ? 'Dairy Direct Ltd.' :
                                     'General Supplies Inc.';
                      if (!acc[supplier]) acc[supplier] = [];
                      acc[supplier].push({item, quantity});
                      return acc;
                    }, {} as Record<string, {item: InventoryItem, quantity: number}[]>)
                  ).map(([supplier, items]) => (
                    <div key={supplier} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                              <span className="text-lg">🏢</span>
                              {supplier}
                            </h3>
                            <p className="text-xs text-gray-600 mt-0.5">{items.length} items to order</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Total Value</p>
                            <p className="text-lg font-bold text-gray-900">
                              ₹{items.reduce((sum, {item, quantity}) => sum + (item.price * quantity), 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {items.map(({item, quantity}) => (
                          <div key={item.sku} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                <div className="flex gap-4 mt-2 text-xs text-gray-600">
                                  <span>SKU: {item.sku}</span>
                                  <span>Current: {item.currentStock} {item.unit}</span>
                                  <span>Optimal: {item.optimalStock} {item.unit}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => {
                                      const newQuantity = Math.max(1, parseInt(e.target.value) || 0);
                                      setOrderingItems(prev =>
                                        prev.map(orderItem =>
                                          orderItem.item.sku === item.sku
                                            ? {...orderItem, quantity: newQuantity}
                                            : orderItem
                                        )
                                      );
                                    }}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-center font-semibold"
                                  />
                                  <span className="text-sm text-gray-600">{item.unit}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  ₹{(item.price * quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {orderingItems.length > 0 && (
              <div className="border-t border-gray-200 bg-gray-50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Order Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{orderingItems.reduce((sum, {item, quantity}) => sum + (item.price * quantity), 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowSupplierOrder(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        // Send orders to suppliers
                        success(`Order sent to ${Object.keys(
                          orderingItems.reduce((acc, {item}) => {
                            const supplier = item.category === 'Fruit' ? 'Fresh Produce Co.' :
                                           item.category === 'Vegetable' ? 'Green Valley Farms' :
                                           item.category === 'Dairy' ? 'Dairy Direct Ltd.' :
                                           'General Supplies Inc.';
                            acc[supplier] = true;
                            return acc;
                          }, {} as Record<string, boolean>)
                        ).length} supplier(s) for ${orderingItems.length} items`);
                        setShowSupplierOrder(false);
                      }}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg transition-colors flex items-center gap-2"
                    >
                      <span>📧</span>
                      Send Orders
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Orders will be sent via email to registered suppliers with PO numbers and delivery schedules
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      </SignedIn>
    </div>
  );
}
