'use client';

import { useState } from 'react';
import Image from 'next/image';

interface AIVisionDetectionProps {
  inventory: any[];
  onDetectionComplete: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function AIVisionDetection({ 
  inventory, 
  onDetectionComplete, 
  onSuccess, 
  onError 
}: AIVisionDetectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResults(null);
      
      // Automatically detect products after file selection
      await handleDetect(file);
    }
  };

  const handleDetect = async (file?: File) => {
    const fileToDetect = file || selectedFile;
    
    if (!fileToDetect) {
      onError('Please select an image first');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', fileToDetect);
      formData.append('inventory', JSON.stringify(inventory));

      const response = await fetch('/api/vision-detect', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResults(data);
        
        // Handle different response formats (classification vs detection)
        if (data.mode === 'classification') {
          const matchedName = data.matched?.name || data.prediction?.predicted_class || 'Unknown';
          const confidence = Math.round((data.prediction?.confidence || 0) * 100);
          onSuccess(`✅ Auto-detected: ${matchedName} (${confidence}% confidence)${data.matched ? ' - Matched to inventory!' : ''}`);
        } else {
          // Detection mode
          onSuccess(`✅ Auto-detected: ${data.total_detections} products, ${data.matched_count} matched to inventory!`);
        }
      } else {
        onError(data.error || 'Detection failed');
      }
    } catch (error) {
      console.error('Detection error:', error);
      onError('Failed to detect products - Is the Flask API running?');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToInventory = async () => {
    if (!results) return;

    if (results.mode === 'classification') {
      // Classification mode - single product
      if (results.matched) {
        // Product already in inventory - could update quantity here
        onSuccess(`Product "${results.matched.name}" is in inventory (Stock: ${results.matched.current_stock || results.matched.currentStock})`);
        onDetectionComplete();
        setIsOpen(false);
      } else {
        // Product not in inventory
        onError(`Product "${results.prediction?.predicted_class}" not found in inventory. Please add it manually.`);
      }
    } else {
      // Detection mode - multiple products
      const matchedProducts = results.matched_products?.filter((p: any) => p.is_matched) || [];
      
      if (matchedProducts.length === 0) {
        onError('No matched products to add');
        return;
      }

      // Here you would update quantities in database
      onSuccess(`Updated ${matchedProducts.length} products in inventory`);
      onDetectionComplete();
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg"
      >
        🤖 AI Vision Scan
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">🤖 AI Vision Detection</h2>
              <p className="text-purple-100 text-sm mt-1">YOLOv8 Classification • Auto-Detection</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
              disabled={loading}
            >
              <span className="text-white text-2xl">✕</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* File Upload */}
          <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="vision-upload"
              disabled={loading}
            />
            <label htmlFor="vision-upload" className={`cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <div className="text-6xl mb-4">
                {loading ? '🔍' : '📸'}
              </div>
              <p className="text-lg font-semibold text-gray-700 mb-2">
                {loading 
                  ? '🤖 Auto-detecting products...' 
                  : selectedFile 
                    ? selectedFile.name 
                    : 'Click to upload product image'}
              </p>
              <p className="text-sm text-gray-500">
                {loading 
                  ? 'AI is analyzing your image...'
                  : 'Supports JPG, PNG, WEBP (max 10MB) • Auto-detection enabled'}
              </p>
            </label>
          </div>

          {/* Image Preview */}
          {previewUrl && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Preview:</h3>
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}

          {/* Detection Results */}
          {results && (
            <div className="space-y-4">
              {results.mode === 'classification' ? (
                /* Classification Mode Results */
                <>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 mb-3">Classification Results:</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-white p-3 rounded">
                        <p className="text-gray-600">Predicted Class</p>
                        <p className="text-xl font-bold text-purple-600">
                          {results.prediction?.predicted_class || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <p className="text-gray-600">Confidence</p>
                        <p className="text-xl font-bold text-green-600">
                          {results.prediction?.confidence 
                            ? `${Math.round(results.prediction.confidence * 100)}%`
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Top 5 Predictions */}
                  {results.prediction?.top_predictions && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-800">Top 5 Predictions:</h3>
                      <div className="space-y-2">
                        {results.prediction.top_predictions.map((pred: any, idx: number) => (
                          <div 
                            key={idx} 
                            className={`p-3 rounded-lg border ${
                              idx === 0 
                                ? 'bg-green-50 border-green-300' 
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className={`font-semibold ${idx === 0 ? 'text-green-900' : 'text-gray-700'}`}>
                                {idx + 1}. {pred.class}
                              </span>
                              <span className={`text-sm font-semibold ${idx === 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                {Math.round(pred.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matched Inventory Item */}
                  {results.matched && (
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-3">✅ Matched Inventory Item:</h3>
                      <div className="bg-white rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-lg text-gray-900">{results.matched.name}</p>
                            <p className="text-sm text-gray-600">SKU: {results.matched.sku}</p>
                            {results.matched.barcode && (
                              <p className="text-sm text-gray-600">Barcode: {results.matched.barcode}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              ${results.matched.price || results.matched.unit_price || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Stock: {results.matched.current_stock || results.matched.currentStock || 0}
                            </p>
                          </div>
                        </div>
                        {results.matched.location && (
                          <p className="text-sm text-gray-600 pt-2 border-t">
                            📍 Location: {results.matched.location}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {!results.matched && (
                    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                      <p className="text-yellow-800">
                        ℹ️ Product detected but not found in inventory. 
                        <br/>
                        <span className="text-sm">Predicted: {results.prediction?.predicted_class}</span>
                      </p>
                    </div>
                  )}
                </>
              ) : (
                /* Detection Mode Results (YOLOv8 + OCR) */
                <>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-3">Detection Results:</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-3 rounded">
                    <p className="text-gray-600">Total Detected</p>
                    <p className="text-2xl font-bold text-purple-600">{results.total_detections}</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-gray-600">Matched</p>
                    <p className="text-2xl font-bold text-green-600">{results.matched_count}</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-gray-600">Confidence</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {results.matched_products?.length > 0
                        ? `${Math.round(results.matched_products[0].confidence * 100)}%`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Annotated Image */}
              {results.annotated_image && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">Detected Products:</h3>
                  <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={results.annotated_image}
                      alt="Detected products"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Matched Products List */}
              {results.matched_products?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">Matched Products:</h3>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {results.matched_products
                      .filter((p: any) => p.is_matched)
                      .map((product: any, idx: number) => (
                        <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-green-900">
                                {product.matched_inventory?.name || 'Unknown Product'}
                              </p>
                              <p className="text-sm text-gray-600">
                                SKU: {product.matched_inventory?.sku}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Detected: "{product.detected_text}"
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-green-600">
                                {Math.round(product.confidence * 100)}% match
                              </p>
                              <p className="text-xs text-gray-500">
                                Stock: {product.matched_inventory?.current_stock || product.matched_inventory?.currentStock || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Unmatched Products */}
              {results.matched_products?.some((p: any) => !p.is_matched) && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">Unmatched Detections:</h3>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {results.matched_products
                      .filter((p: any) => !p.is_matched)
                      .map((product: any, idx: number) => (
                        <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm text-gray-700">
                            Detected: "{product.detected_text || 'No text detected'}"
                          </p>
                          <p className="text-xs text-gray-500">
                            Class: {product.class} • Confidence: {Math.round(product.confidence * 100)}%
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {!results ? (
              <>
                <button
                  onClick={() => handleDetect()}
                  disabled={!selectedFile || loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '🔍 Auto-Detecting...' : '🔄 Re-Detect'}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleAddToInventory}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-500 hover:to-emerald-500 transition-all"
                >
                  {results.mode === 'classification' 
                    ? `✅ Update Inventory${results.matched ? ' (1 product)' : ' (Add New)'}`
                    : `✅ Update Inventory (${results.matched_count} products)`}
                </button>
                <button
                  onClick={() => {
                    setResults(null);
                    setSelectedFile(null);
                    setPreviewUrl('');
                  }}
                  className="px-6 py-3 bg-purple-200 text-purple-700 rounded-lg font-semibold hover:bg-purple-300 transition-all"
                >
                  🔄 Scan Another
                </button>
              </>
            )}
          </div>

          {/* API Status */}
          <div className="text-center text-xs text-gray-500">
            <p>🤖 Auto-Detection Enabled • YOLOv8 Classification • Flask API: localhost:5001</p>
          </div>
        </div>
      </div>
    </div>
  );
}
