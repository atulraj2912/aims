'use client';

import { useState } from 'react';

interface RecordSaleProps {
  inventory: any[];
  onSaleRecorded: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function RecordSale({ inventory, onSaleRecorded, onSuccess, onError }: RecordSaleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    quantity: '',
    salePrice: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const product = inventory.find(item => item.sku === formData.sku);
      
      if (!product) {
        onError('Product not found');
        setLoading(false);
        return;
      }

      if (parseInt(formData.quantity) > product.currentStock) {
        onError(`Cannot sell ${formData.quantity} units - only ${product.currentStock} in stock`);
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: formData.sku,
          productName: product.name,
          quantitySold: parseInt(formData.quantity),
          salePrice: parseFloat(formData.salePrice)
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const message = `Sale recorded! ${result.data.lowStockAlert ? '⚠️ Low stock alert created.' : ''}`;
        onSuccess(message);
        setIsOpen(false);
        setFormData({ sku: '', quantity: '', salePrice: '' });
        onSaleRecorded();
      } else {
        onError(result.error || 'Failed to record sale');
      }
    } catch (error) {
      console.error('Sale error:', error);
      onError('Failed to record sale - ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = inventory.find(item => item.sku === formData.sku);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg whitespace-nowrap flex items-center gap-2"
      >
        <span>💰</span> Record Sale
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">💰 Record Sale</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            >
              <span className="text-white text-2xl">✕</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product *
            </label>
            <select
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
            >
              <option value="">Select Product</option>
              {inventory.map((item) => (
                <option key={item.sku} value={item.sku}>
                  {item.name} (Stock: {item.currentStock})
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-600">Current Stock:</span>{' '}
                  <span className="font-semibold">{selectedProduct.currentStock}</span>
                </div>
                <div>
                  <span className="text-gray-600">Price:</span>{' '}
                  <span className="font-semibold">₹{selectedProduct.price?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quantity Sold *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              placeholder="1"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sale Price (per unit) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.salePrice}
              onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              placeholder={selectedProduct?.price?.toFixed(2) || '0.00'}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-500 hover:to-emerald-500 transition-all disabled:opacity-50"
            >
              {loading ? '⏳ Recording...' : '✅ Record Sale'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
