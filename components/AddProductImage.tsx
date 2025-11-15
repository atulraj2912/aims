'use client';

import { useState, useRef } from 'react';

interface AddProductImageProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddProductImage({ onClose, onSuccess }: AddProductImageProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [detectedProducts, setDetectedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setSelectedImage(reader.result as string);
        setDetectedProducts([]);
        setError('');
        
        // Auto-detect products after image is loaded
        await handleDetect(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetect = async (file?: File) => {
    if (!selectedImage && !file) return;

    setLoading(true);
    setError('');

    try {
      // For now, simulate detection until YOLOv8 integration
      // Replace this with actual YOLOv8 API call
      setTimeout(() => {
        setDetectedProducts([
          {
            name: 'Gaming Laptop',
            confidence: 0.95,
            sku: 'SKU001',
            category: 'Electronics',
            estimatedStock: 1
          },
          {
            name: 'Office Chair',
            confidence: 0.87,
            sku: 'SKU002',
            category: 'Furniture',
            estimatedStock: 2
          }
        ]);
        setLoading(false);
      }, 2000);

      // TODO: Replace with actual YOLOv8 detection
      // const response = await fetch('/api/detect-products', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ image: selectedImage })
      // });
      // const result = await response.json();
      // setDetectedProducts(result.products);
    } catch (err) {
      setError('Detection failed. Please try again.');
      setLoading(false);
    }
  };

  const handleAddToInventory = async () => {
    setLoading(true);
    try {
      // Add all detected products to inventory
      for (const product of detectedProducts) {
        await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: product.name,
            sku: product.sku,
            category: product.category,
            currentStock: product.estimatedStock,
            optimalStock: 100,
            price: 0,
            reorderPoint: 20
          })
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to add products to inventory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-[#9A3F3F] to-[#7D3333] text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                📹 AI Product Detection
              </h2>
              <p className="text-[#FBF9D1] text-sm mt-1">🤖 Auto-detection enabled • Upload or capture image</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-[#9A3F3F] hover:bg-[#FBF9D1]/20 transition-all cursor-pointer"
          >
            {selectedImage ? (
              <div className="space-y-4">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="max-h-96 mx-auto rounded-lg shadow-lg"
                />
                {loading ? (
                  <div className="flex items-center justify-center gap-2 text-[#9A3F3F]">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#9A3F3F]"></div>
                    <span className="font-semibold">🤖 Auto-detecting products...</span>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(null);
                      setDetectedProducts([]);
                    }}
                    className="text-sm text-gray-600 hover:text-[#9A3F3F]"
                  >
                    Change image
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-6xl">📸</div>
                <div>
                  <p className="text-lg font-semibold text-gray-700">
                    Click to upload image
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Auto-detection enabled • or drag and drop
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  Supports: JPG, PNG, WebP
                </p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* Remove Manual Detect Button - Auto-detection is now enabled */}

          {/* Detected Products */}
          {detectedProducts.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                ✅ Detected Products ({detectedProducts.length})
              </h3>
              
              <div className="space-y-3">
                {detectedProducts.map((product, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-r from-[#FBF9D1] to-[#E6CFA9] rounded-lg p-4 border border-[#C1856D]"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                        <p className="text-sm text-gray-600">Category: {product.category}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#9A3F3F]">
                          {(product.confidence * 100).toFixed(0)}%
                        </div>
                        <p className="text-xs text-gray-600">Confidence</p>
                        <p className="text-sm font-semibold text-gray-700 mt-1">
                          Qty: {product.estimatedStock}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddToInventory}
                disabled={loading}
                className="w-full px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {loading ? 'Adding to Inventory...' : '➕ Add All to Inventory'}
              </button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>🤖 Auto-Detection:</strong> Products are automatically detected when you upload an image. 
                  Currently showing simulated detection. YOLOv8 integration coming next.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
