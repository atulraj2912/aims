'use client';

import { useState } from 'react';

interface ReportDefectProps {
  inventory: any[];
  onDefectReported: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function ReportDefect({ inventory, onDefectReported, onSuccess, onError }: ReportDefectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    quantity: '',
    description: ''
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

      const defectQty = parseInt(formData.quantity);
      if (defectQty > product.currentStock) {
        onError(`Cannot report ${defectQty} defective units - only ${product.currentStock} in stock`);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/defects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: formData.sku,
          quantity: defectQty,
          description: formData.description
        })
      });

      const result = await response.json();
      
      if (result.success) {
        onSuccess('Defect reported! Notification created for return approval.');
        setIsOpen(false);
        setFormData({ sku: '', quantity: '', description: '' });
        onDefectReported();
      } else {
        onError(result.error || 'Failed to report defect');
      }
    } catch (error) {
      console.error('Defect error:', error);
      onError('Failed to report defect - ' + (error instanceof Error ? error.message : 'Unknown error'));
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
        <span>❌</span> Report Defect
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">❌ Report Defect</h2>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-600">Current Stock:</span>{' '}
                  <span className="font-semibold">{selectedProduct.currentStock}</span>
                </div>
                <div>
                  <span className="text-gray-600">SKU:</span>{' '}
                  <span className="font-semibold">{selectedProduct.sku}</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Defective Quantity *
            </label>
            <input
              type="number"
              required
              min="1"
              max={selectedProduct?.currentStock || 999}
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
              placeholder="1"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Defect Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
              placeholder="Describe the defect (e.g., damaged packaging, expired, quality issues)"
              rows={3}
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-gray-700">
              ⚠️ Reporting this will:
              <br />• Reduce stock by the defective quantity
              <br />• Create a notification for return approval
              <br />• Generate a supplier return request when approved
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-500 hover:to-pink-500 transition-all disabled:opacity-50"
            >
              {loading ? '⏳ Reporting...' : '✅ Report Defect'}
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
