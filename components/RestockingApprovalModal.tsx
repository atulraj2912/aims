'use client';

import { useState } from 'react';
import { InventoryItem } from '@/types';
import { createPortal } from 'react-dom';

interface RestockingApprovalModalProps {
  items: InventoryItem[];
  onApprove: (items: InventoryItem[]) => void;
  onCancel: () => void;
}

export default function RestockingApprovalModal({ items, onApprove, onCancel }: RestockingApprovalModalProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set(items.map(i => i.id)));
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleApprove = async () => {
    setProcessing(true);
    const itemsToRestock = items.filter(item => selectedItems.has(item.id));
    await onApprove(itemsToRestock);
    setProcessing(false);
    
    // Show success animation
    setShowSuccess(true);
    
    // Auto-close after showing success
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  const totalCost = items
    .filter(item => selectedItems.has(item.id))
    .reduce((sum, item) => {
      const needed = item.optimalStock - item.currentStock;
      return sum + needed;
    }, 0);

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative">
        {/* Success Overlay */}
        {showSuccess && (
          <div className="absolute inset-0 bg-green-600 bg-opacity-95 flex items-center justify-center z-50 rounded-2xl">
            <div className="text-center animate-bounce">
              <div className="text-8xl mb-4">✅</div>
              <h3 className="text-3xl font-bold text-white mb-2">Restocking Approved!</h3>
              <p className="text-xl text-white/90">Inventory updated automatically</p>
              <div className="mt-4 flex gap-2 justify-center">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-[#9A3F3F] to-[#7D3333] text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📦</span>
              <div>
                <h3 className="text-xl font-bold">Approve Restocking Request</h3>
                <p className="text-sm text-white/80">
                  {items.length} product{items.length > 1 ? 's' : ''} need restocking
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-white hover:bg-white/20 rounded-lg px-3 py-2 transition-colors text-xl"
              disabled={processing}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {items.map((item) => {
              const needed = item.optimalStock - item.currentStock;
              const ratio = item.currentStock / item.optimalStock;
              const isSelected = selectedItems.has(item.id);

              return (
                <div
                  key={item.id}
                  className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#9A3F3F] bg-[#FBF9D1]/30'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="pt-1">
                      <div
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-[#9A3F3F] border-[#9A3F3F]'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && <span className="text-white text-sm">✓</span>}
                      </div>
                    </div>

                    {/* Item Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <p className="text-xs text-gray-500">
                            {item.sku} • {item.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                              ratio <= 0.2
                                ? 'bg-red-100 text-red-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {ratio <= 0.2 ? '🚨 CRITICAL' : '⚠️ LOW'}
                          </span>
                        </div>
                      </div>

                      {/* Stock Info */}
                      <div className="grid grid-cols-3 gap-4 mb-2">
                        <div className="bg-red-50 rounded-lg p-2">
                          <p className="text-xs text-gray-600">Current</p>
                          <p className="font-bold text-red-600">
                            {item.currentStock} {item.unit}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2">
                          <p className="text-xs text-gray-600">Optimal</p>
                          <p className="font-bold text-green-600">
                            {item.optimalStock} {item.unit}
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-2">
                          <p className="text-xs text-gray-600">To Order</p>
                          <p className="font-bold text-blue-600">
                            {needed} {item.unit}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              ratio <= 0.2 ? 'bg-red-600' : 'bg-orange-500'
                            }`}
                            style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-600">
                          {Math.round(ratio * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Selected Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedItems.size} of {items.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Units to Order</p>
              <p className="text-2xl font-bold text-[#9A3F3F]">
                {totalCost.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={processing}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={selectedItems.size === 0 || processing}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#9A3F3F] to-[#7D3333] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>Approve & Send to Suppliers</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
