'use client';

import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface GlobalVisionScanProps {
  onScanComplete: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function GlobalVisionScan({ onScanComplete, onSuccess, onError }: GlobalVisionScanProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<any>(null);
  const [showManualSelection, setShowManualSelection] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setPreview(reader.result as string);
        // Auto-detect products after image loads
        await handleScan(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async (file?: File) => {
    const imageFile = file || fileInputRef.current?.files?.[0];
    
    if (!imageFile) {
      onError('Please select an image first');
      return;
    }

    setIsScanning(true);
    
    try {
      // Fetch inventory for matching
      const inventoryResponse = await fetch('/api/inventory');
      const inventoryResult = await inventoryResponse.json();
      
      if (!inventoryResult.success) {
        onError('Failed to load inventory');
        setIsScanning(false);
        return;
      }

      // Call AI detection API
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('inventory', JSON.stringify(inventoryResult.data));

      const response = await fetch('/api/vision-detect', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setDetectionResult(data);
        setIsScanning(false);
        
        // Show success message based on mode
        if (data.mode === 'classification') {
          const matchedName = data.matched?.name || data.prediction?.predicted_class || 'Unknown';
          const confidence = Math.round((data.prediction?.confidence || 0) * 100);
          onSuccess(`✅ Auto-detected: ${matchedName} (${confidence}% confidence)${data.matched ? ' - Found in inventory!' : ''}`);
        } else {
          onSuccess(`✅ Auto-detected: ${data.total_detections} products, ${data.matched_count} matched to inventory!`);
        }
      } else {
        onError(data.error || 'Detection failed');
        setIsScanning(false);
      }
    } catch (error) {
      console.error('Scan error:', error);
      onError('Failed to scan image - Is the Flask API running?');
      setIsScanning(false);
    }
  };

  const handleManualConfirm = async () => {
    if (!detectionResult) return;

    setIsScanning(true);

    try {
      // Auto-update inventory based on AI detection results
      if (detectionResult.mode === 'classification') {
        if (!detectionResult.matched?.best_match) {
          // Product detected but not found in inventory
          const predictedClass = detectionResult.prediction?.predicted_class || 'Unknown';
          onError(`⚠️ Detected "${predictedClass}" but not found in inventory database. Please add this product to inventory first.`);
          setIsScanning(false);
          return;
        }
        
        // Single product detected and matched - update its quantity
        const matchedProduct = detectionResult.matched.best_match;
        const response = await fetch('/api/inventory/bulk-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sku: matchedProduct.sku,
            incrementBy: 1
          })
        });
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Update failed');
        }
        
        console.log('✅ Inventory updated:', result.data);
        onSuccess(`✅ Updated ${matchedProduct.name}: ${result.data.oldStock} → ${result.data.newStock} units`);
      } else if (detectionResult.matched_products) {
        // Multiple products detected
        const matchedProducts = detectionResult.matched_products.filter((p: any) => p.is_matched);
        
        const updatePromises = matchedProducts.map(async (product: any) => {
          try {
            const response = await fetch('/api/inventory/bulk-update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sku: product.matched_inventory?.sku,
                incrementBy: 1
              })
            });
            
            const result = await response.json();
            if (!result.success) {
              console.error(`Failed to update ${product.matched_inventory?.sku}:`, result.error);
            } else {
              console.log(`✅ Updated ${product.matched_inventory?.sku}: ${result.data.oldStock} → ${result.data.newStock}`);
            }
          } catch (err) {
            console.error(`Failed to update ${product.matched_inventory?.sku}`, err);
          }
        });

        await Promise.all(updatePromises);
        onSuccess(`✅ Updated ${matchedProducts.length} product${matchedProducts.length > 1 ? 's' : ''} in inventory!`);
      }

      setTimeout(() => {
        handleClose();
        onScanComplete();
      }, 1500);
    } catch (error) {
      console.error('Update error:', error);
      onError('Failed to update inventory. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const toggleProductSelection = (sku: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(sku)) {
      newSelected.delete(sku);
    } else {
      newSelected.add(sku);
    }
    setSelectedProducts(newSelected);
  };

  const handleClose = () => {
    setIsOpen(false);
    setPreview(null);
    setDetectionResult(null);
    setShowManualSelection(false);
    setSelectedProducts(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const modalContent = isOpen ? (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
                🤖
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Product Scanner</h2>
                <p className="text-blue-100 text-sm">Auto-detect products • Upload shelf image</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isScanning}
              className="text-white/80 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image {isScanning && <span className="text-blue-600">(🤖 Auto-detecting...)</span>}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              disabled={isScanning}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
            {isScanning && (
              <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                AI is analyzing your image...
              </div>
            )}
          </div>

          {/* Image Preview */}
          {preview && !detectionResult && (
            <div className="mb-6">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-64 object-contain bg-gray-50 rounded-lg border-2 border-gray-200"
              />
            </div>
          )}

          {/* Remove Manual Selection UI - Using AI Auto-Detection */}

          {/* AI Detection Results */}
          {detectionResult && (
            <div className="mb-6">
              {detectionResult.mode === 'classification' ? (
                /* Classification Mode Results */
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🤖</span>
                      <h3 className="font-semibold text-purple-900">AI Classification Result</h3>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg mb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Detected Product</p>
                          <p className="text-xl font-bold text-gray-900">{detectionResult.prediction?.predicted_class}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Confidence</p>
                          <p className="text-2xl font-bold text-green-600">
                            {Math.round((detectionResult.prediction?.confidence || 0) * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {detectionResult.matched ? (
                      <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                        <p className="font-semibold text-green-900 mb-1">✅ Matched in Inventory:</p>
                        <p className="text-green-800">{detectionResult.matched.name}</p>
                        <p className="text-sm text-green-700">SKU: {detectionResult.matched.sku} • Stock: {detectionResult.matched.current_stock || detectionResult.matched.currentStock}</p>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                        <p className="text-yellow-800">⚠️ Product not found in inventory</p>
                      </div>
                    )}
                  </div>

                  {/* Top 5 Predictions */}
                  {detectionResult.prediction?.top_predictions && (
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Top 5 Predictions:</h4>
                      <div className="space-y-1">
                        {detectionResult.prediction.top_predictions.slice(0, 5).map((pred: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className={idx === 0 ? 'font-semibold text-gray-900' : 'text-gray-600'}>
                              {idx + 1}. {pred.class}
                            </span>
                            <span className={idx === 0 ? 'font-semibold text-green-600' : 'text-gray-500'}>
                              {Math.round(pred.confidence * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Detection Mode Results */
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">✅</span>
                    <h3 className="font-semibold text-green-900">
                      Detected {detectionResult.total_detections} Product{detectionResult.total_detections > 1 ? 's' : ''}
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    {detectionResult.matched_products?.filter((p: any) => p.is_matched).map((product: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{product.matched_inventory?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">SKU: {product.matched_inventory?.sku || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-green-600">
                            {Math.round(product.confidence * 100)}% confident
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!detectionResult ? (
              <>
                <button
                  onClick={() => handleScan()}
                  disabled={!preview || isScanning}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isScanning ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      🤖 Auto-Detecting...
                    </>
                  ) : (
                    <>
                      <span className="text-xl">🔄</span>
                      Re-Detect
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleManualConfirm}
                  disabled={isScanning}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isScanning ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <span className="text-xl">✅</span>
                      Update Inventory
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setDetectionResult(null);
                    setPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="px-6 py-3 bg-blue-200 text-blue-700 rounded-lg font-semibold hover:bg-blue-300 transition-all"
                >
                  🔄 Scan Another
                </button>
              </>
            )}
            
            <button
              onClick={handleClose}
              disabled={isScanning}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

          {/* Info */}
          {!detectionResult && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-2">
                <span className="text-blue-600 text-xl">🤖</span>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">AI Auto-Detection Enabled:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Upload image → AI automatically detects products</li>
                    <li>YOLOv8 Classification trained on 81 grocery items</li>
                    <li>Matched products are highlighted from inventory</li>
                    <li>Click "Update Inventory" to increment stock</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg whitespace-nowrap flex items-center gap-2"
      >
        <span>🤖</span> AI Scan Products
      </button>

      {typeof window !== 'undefined' && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
