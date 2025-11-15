'use client';

import { ReplenishmentOrder } from '@/types';
import { useState } from 'react';

interface ReplenishmentAlertProps {
  order: ReplenishmentOrder;
  onApprove: (orderId: string) => void;
  onReject: (orderId: string) => void;
}

export default function ReplenishmentAlert({ order, onApprove, onReject }: ReplenishmentAlertProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    await onApprove(order.id);
    setIsProcessing(false);
  };

  const handleReject = async () => {
    setIsProcessing(true);
    await onReject(order.id);
    setIsProcessing(false);
  };

  const getPriorityStyle = () => {
    switch (order.priority) {
      case 'critical':
        return { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-700', badge: 'bg-red-600' };
      case 'high':
        return { bg: 'bg-orange-100', border: 'border-orange-500', text: 'text-orange-700', badge: 'bg-orange-600' };
      case 'medium':
        return { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-700', badge: 'bg-yellow-600' };
      default:
        return { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-700', badge: 'bg-blue-600' };
    }
  };

  const style = getPriorityStyle();

  return (
    <div className={`${style.bg} border-l-4 ${style.border} p-6 rounded-lg shadow-md`}>
      {/* Alert Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🤖</div>
          <div>
            <h4 className="font-bold text-lg text-gray-800">Automated Replenishment Triggered</h4>
            <p className="text-sm text-gray-600">Procurement Agent has initiated reorder</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${style.badge} uppercase`}>
          {order.priority} Priority
        </span>
      </div>

      {/* Order Details */}
      <div className="bg-white p-4 rounded-lg mb-4 border border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Item</p>
            <p className="font-semibold text-gray-800">{order.itemName}</p>
            <p className="text-xs text-gray-500">SKU: {order.sku}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Order ID</p>
            <p className="font-mono text-sm font-semibold text-gray-800">{order.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Current</p>
            <p className="text-xl font-bold text-red-600">{order.currentStock}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Optimal</p>
            <p className="text-xl font-bold text-blue-600">{order.optimalStock}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">To Order</p>
            <p className="text-xl font-bold text-green-600">{order.quantityToOrder}</p>
          </div>
        </div>
      </div>

      {/* Intelligence Indicator */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg mb-4 border border-purple-200">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧠</span>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Analytics Engine:</span> Stock level {Math.round((order.currentStock / order.optimalStock) * 100)}% of optimal. Replenishment recommended.
          </p>
        </div>
      </div>

      {/* Human-in-the-Loop Approval Section */}
      <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">👤</span>
          <h5 className="font-bold text-gray-800">Manager Approval Required</h5>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Please review and approve or reject this automated replenishment order.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>✓</span>
            {isProcessing ? 'Processing...' : 'Approve Order'}
          </button>
          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>✕</span>
            {isProcessing ? 'Processing...' : 'Reject Order'}
          </button>
        </div>
      </div>

      {/* Timestamp */}
      <p className="text-xs text-gray-400 mt-3 text-right">
        Created: {new Date(order.createdAt).toLocaleString()}
      </p>
    </div>
  );
}
