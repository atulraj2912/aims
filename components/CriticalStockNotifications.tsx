'use client';

import { useEffect, useState } from 'react';
import { InventoryItem } from '@/types';

interface CriticalStockNotificationsProps {
  inventory: InventoryItem[];
  onViewItem: (item: InventoryItem) => void;
}

export default function CriticalStockNotifications({ inventory, onViewItem }: CriticalStockNotificationsProps) {
  const [criticalItems, setCriticalItems] = useState<InventoryItem[]>([]);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const critical = inventory.filter(item => {
      const ratio = item.currentStock / item.optimalStock;
      return ratio <= 0.2; // Critical threshold
    });

    setCriticalItems(critical);
    
    // Show notification if there are critical items
    if (critical.length > 0) {
      setShowNotification(true);
      
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [inventory]);

  if (criticalItems.length === 0 || !showNotification) return null;

  return (
    <div className="fixed top-20 right-6 z-40 max-w-md animate-slide-in">
      <div className="bg-white rounded-xl shadow-2xl border-l-4 border-red-600 overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <span className="text-2xl animate-pulse">🚨</span>
            <span className="font-bold">Critical Stock Alert</span>
          </div>
          <button
            onClick={() => setShowNotification(false)}
            className="text-white hover:bg-white/20 rounded-lg px-2 py-1 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto">
          <p className="text-sm text-gray-600 mb-3">
            {criticalItems.length} product{criticalItems.length > 1 ? 's' : ''} at critical stock levels (≤20%)
          </p>
          
          <div className="space-y-2">
            {criticalItems.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="bg-red-50 border border-red-200 rounded-lg p-3 hover:bg-red-100 transition-colors cursor-pointer"
                onClick={() => {
                  onViewItem(item);
                  setShowNotification(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.sku} • {item.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-600 font-bold text-lg">{item.currentStock}</p>
                    <p className="text-xs text-gray-500">/ {item.optimalStock} {item.unit}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-red-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((item.currentStock / item.optimalStock) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-red-600">
                    {Math.round((item.currentStock / item.optimalStock) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {criticalItems.length > 5 && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              +{criticalItems.length - 5} more items need attention
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
