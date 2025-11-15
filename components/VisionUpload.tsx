'use client';

import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface VisionUploadProps {
  sku: string;
  itemName: string;
  onDetectionComplete: () => void;
  onClose: () => void;
}

export default function VisionUpload({ sku, itemName, onDetectionComplete, onClose }: VisionUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload for detection
    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('sku', sku);

      const response = await fetch('/api/vision/detect', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        setTimeout(() => {
          onDetectionComplete();
          setPreviewUrl('');
          setResult(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 3000);
      } else {
        throw new Error(data.error || 'Detection failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setResult({ error: true, message: error instanceof Error ? error.message : 'Detection failed. Please try again.' });
      setTimeout(() => {
        setResult(null);
        setPreviewUrl('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 3000);
    } finally {
      setUploading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-[#9A3F3F] to-[#7D3333] text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📹</span>
            <div>
              <h4 className="font-semibold text-lg">Vision Core Detection</h4>
              <p className="text-xs text-white/80">Upload shelf image for {itemName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg px-3 py-1 transition-colors text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-dashed border-blue-300">

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!previewUrl ? (
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>📷</span>
            {uploading ? 'Detecting...' : 'Scan Shelf'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <img
            src={previewUrl}
            alt="Shelf preview"
            className="w-full h-32 object-cover rounded-lg border border-gray-300"
          />

          {uploading && (
            <div className="bg-blue-100 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm font-semibold text-blue-700">
                  AI Vision analyzing image...
                </span>
              </div>
            </div>
          )}

          {result && !uploading && (
            <div className={`p-3 rounded-lg border ${result.error ? 'bg-red-100 border-red-300' : 'bg-green-100 border-green-300'}`}>
              {result.error ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-red-800">✕ Detection Failed</p>
                    <p className="text-xs text-red-600">{result.message}</p>
                  </div>
                  <span className="text-2xl">❌</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      ✓ Detected: {result.detectedCount} items
                    </p>
                    <p className="text-xs text-green-600">
                      Method: {result.detectionMethod} • Confidence: {Math.round(result.confidence * 100)}%
                    </p>
                  </div>
                  <span className="text-2xl">✓</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2 text-center">
        {process.env.NEXT_PUBLIC_ROBOFLOW_ENABLED === 'true' 
          ? '🤖 Real AI-powered detection enabled' 
          : '🔬 Demo mode - simulated detection'}
      </p>
    </div>
        </div>
      </div>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
