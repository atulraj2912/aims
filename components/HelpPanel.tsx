'use client';

import { useState, useEffect } from 'react';

export default function HelpPanel() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' && e.shiftKey) {
        setIsOpen(!isOpen);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110 flex items-center justify-center z-40"
        title="Help & Shortcuts (Shift + ?)"
      >
        <span className="text-2xl">❓</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl">
            <div className="bg-white rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Help & Keyboard Shortcuts</h2>
                    <p className="text-blue-100 text-sm">Quick reference guide</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
                <div className="mb-6">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-xl">⌨️</span> Keyboard Shortcuts
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Open Help</span>
                      <kbd className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm font-mono text-sm">Shift + ?</kbd>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Close Modals</span>
                      <kbd className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm font-mono text-sm">Esc</kbd>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Refresh Dashboard</span>
                      <kbd className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm font-mono text-sm">Ctrl + R</kbd>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Focus Search</span>
                      <kbd className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm font-mono text-sm">Ctrl + K</kbd>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-xl">📚</span> Quick Guide
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-1">Vision AI Detection</h4>
                      <p className="text-sm text-blue-700">Upload shelf images to automatically detect and count inventory items using Roboflow AI.</p>
                    </div>
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-1">ML Forecasting</h4>
                      <p className="text-sm text-purple-700">AI predicts 7-day stock levels using Hugging Face models with exponential smoothing fallback.</p>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-1">Auto-Replenishment</h4>
                      <p className="text-sm text-green-700">System automatically generates purchase orders when stock falls below optimal levels.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-xl">💡</span> Tips & Tricks
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Use filters to quickly find critical or low stock items</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Export inventory data to CSV for offline analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Click the refresh icon to manually sync latest data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Real-time WebSocket keeps dashboard synced across multiple windows</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
