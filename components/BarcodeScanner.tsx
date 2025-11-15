'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BrowserMultiFormatReader } from '@zxing/library';

interface BarcodeScannerProps {
  onScanComplete: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function BarcodeScanner({ onScanComplete, onSuccess, onError }: BarcodeScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [scannedCodes, setScannedCodes] = useState<Map<string, number>>(new Map());
  const [inventory, setInventory] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Fetch inventory
      fetch('/api/inventory')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setInventory(data.data);
          }
        });
    }
  }, [isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target?.result as string;
      setUploadedImage(imageData);

      // Decode barcode from uploaded image
      try {
        if (!codeReaderRef.current) {
          codeReaderRef.current = new BrowserMultiFormatReader();
        }

        const result = await codeReaderRef.current.decodeFromImageUrl(imageData);
        if (result) {
          handleBarcodeDetected(result.getText());
          onSuccess('Barcode detected from image!');
        }
      } catch (error) {
        onError('No barcode found in image. Try taking a clearer photo.');
      }
    };
    reader.readAsDataURL(file);
  };

  const startScanning = async () => {
    try {
      setIsScanning(true);
      
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }

      const videoInputDevices = await codeReaderRef.current.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        onError('No camera found');
        setIsScanning(false);
        return;
      }

      // Use back camera if available
      const selectedDeviceId = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back')
      )?.deviceId || videoInputDevices[0].deviceId;

      codeReaderRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        (result, error) => {
          if (result) {
            const barcode = result.getText();
            handleBarcodeDetected(barcode);
          }
        }
      );
    } catch (error) {
      console.error('Scanner error:', error);
      onError('Failed to start camera. Please allow camera access.');
      setIsScanning(false);
    }
  };

  const handleBarcodeDetected = (barcode: string) => {
    // Find product by barcode (assuming SKU matches barcode or we have barcode field)
    const product = inventory.find(item => 
      item.sku === barcode || item.barcode === barcode
    );

    if (product) {
      const newScanned = new Map(scannedCodes);
      newScanned.set(product.sku, (newScanned.get(product.sku) || 0) + 1);
      setScannedCodes(newScanned);
      
      // Play beep sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m97Oagz');
      audio.play().catch(() => {});
      
      console.log(`✅ Scanned: ${product.name} (${product.sku})`);
    } else {
      console.log(`⚠️ Unknown barcode: ${barcode}`);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setIsScanning(false);
  };

  const handleFinish = async () => {
    stopScanning();

    if (scannedCodes.size === 0) {
      onError('No items scanned');
      return;
    }

    try {
      // Update inventory for all scanned items
      const updatePromises = Array.from(scannedCodes.entries()).map(async ([sku, count]) => {
        await fetch('/api/inventory/bulk-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sku: sku,
            incrementBy: count
          })
        });
      });

      await Promise.all(updatePromises);

      const totalItems = Array.from(scannedCodes.values()).reduce((sum, count) => sum + count, 0);
      onSuccess(`✅ Updated ${scannedCodes.size} product(s), ${totalItems} total items scanned!`);
      
      setTimeout(() => {
        handleClose();
        onScanComplete();
      }, 1500);
    } catch (error) {
      onError('Failed to update inventory');
    }
  };

  const handleClose = () => {
    stopScanning();
    setIsOpen(false);
    setScannedCodes(new Map());
  };

  const modalContent = isOpen ? (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
                📱
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Barcode Scanner</h2>
                <p className="text-purple-100 text-sm">Scan product barcodes to update inventory</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Mode Toggle */}
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => {
                setUseCamera(true);
                setUploadedImage(null);
              }}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                useCamera
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📷 Use Camera
            </button>
            <button
              onClick={() => {
                setUseCamera(false);
                stopScanning();
                fileInputRef.current?.click();
              }}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                !useCamera
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📁 Upload Image
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Camera View */}
          {useCamera && isScanning ? (
            <div className="mb-6">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-80 object-cover"
                  autoPlay
                  playsInline
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-40 border-4 border-purple-500 rounded-lg"></div>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                Point camera at barcode
              </p>
            </div>
          ) : uploadedImage ? (
            <div className="mb-6">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={uploadedImage}
                  alt="Uploaded barcode"
                  className="w-full h-80 object-contain"
                />
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                Uploaded image - click "Upload Image" to scan another
              </p>
            </div>
          ) : (
            <div className="mb-6 p-8 bg-gray-100 rounded-lg text-center">
              <div className="text-6xl mb-4">📱</div>
              <p className="text-gray-600">
                {useCamera ? 'Click "Start Scanning" to begin' : 'Click "Upload Image" to select a photo'}
              </p>
            </div>
          )}

          {/* Scanned Items */}
          {scannedCodes.size > 0 && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">✅</span>
                <h3 className="font-semibold text-green-900">
                  Scanned {scannedCodes.size} Product(s)
                </h3>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Array.from(scannedCodes.entries()).map(([sku, count]) => {
                  const product = inventory.find(p => p.sku === sku);
                  return (
                    <div key={sku} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{product?.name || sku}</p>
                        <p className="text-sm text-gray-500">SKU: {sku}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ×{count}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {useCamera && !isScanning ? (
              <button
                onClick={startScanning}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center gap-2"
              >
                <span className="text-xl">📷</span>
                Start Scanning
              </button>
            ) : useCamera && isScanning ? (
              <button
                onClick={stopScanning}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                <span className="text-xl">⏹</span>
                Stop Scanning
              </button>
            ) : !useCamera ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center gap-2"
              >
                <span className="text-xl">📁</span>
                Upload Image
              </button>
            ) : null}
            
            {scannedCodes.size > 0 && (
              <button
                onClick={handleFinish}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2"
              >
                <span className="text-xl">✅</span>
                Finish & Update ({scannedCodes.size})
              </button>
            )}
            
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
          </div>

          {/* Info */}
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex gap-2">
              <span className="text-purple-600 text-xl">💡</span>
              <div className="text-sm text-purple-800">
                <p className="font-semibold mb-1">How it works:</p>
                <ul className="list-disc list-inside space-y-1 text-purple-700">
                  {useCamera ? (
                    <>
                      <li>Point camera at product barcode</li>
                      <li>Each scan automatically identifies the product</li>
                      <li>Scan multiple items before finishing</li>
                      <li>99% accurate - works with any standard barcode</li>
                    </>
                  ) : (
                    <>
                      <li>Take a clear photo of the barcode with your phone</li>
                      <li>Upload the image - better quality than laptop camera</li>
                      <li>Barcode is automatically detected and product identified</li>
                      <li>Upload multiple photos before finishing</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
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
        <span>📱</span> Scan Barcodes
      </button>

      {typeof window !== 'undefined' && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
