'use client';

import { useState } from 'react';
import { predictSalesWithLocalModel, type InventoryPredictionInput, type SalesPrediction } from '@/lib/local-model';

export default function MLPredictionDemo() {
  const [predictions, setPredictions] = useState<SalesPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sampleItems: InventoryPredictionInput[] = [
    {
      sku: "SKU001",
      name: "Gaming Laptop",
      currentStock: 45,
      unitsOrdered: 20,
      demandForecast: 150,
      price: 899.99,
      isHoliday: false,
      competitorPrice: 949.99,
      productId: "P0002",
      category: "Electronics",
      seasonality: "Winter"
    },
    {
      sku: "SKU002",
      name: "Office Chair",
      currentStock: 30,
      unitsOrdered: 15,
      demandForecast: 80,
      price: 199.99,
      isHoliday: true,
      competitorPrice: 189.99,
      productId: "P0005",
      category: "Furniture",
      seasonality: "Spring"
    },
    {
      sku: "SKU003",
      name: "Organic Milk",
      currentStock: 120,
      unitsOrdered: 100,
      demandForecast: 300,
      price: 4.99,
      isHoliday: false,
      competitorPrice: 5.49,
      productId: "P0010",
      category: "Groceries",
      seasonality: "Summer"
    },
    {
      sku: "SKU004",
      name: "Action Figure Set",
      currentStock: 60,
      unitsOrdered: 30,
      demandForecast: 120,
      price: 29.99,
      isHoliday: true,
      competitorPrice: 34.99,
      productId: "P0015",
      category: "Toys",
      seasonality: "Winter"
    }
  ];

  const runPredictions = async () => {
    setLoading(true);
    setError('');
    try {
      const results = await predictSalesWithLocalModel(sampleItems);
      setPredictions(results);
    } catch (err) {
      setError('Failed to get predictions. Make sure ML server is running on port 5001.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🤖 Local ML Model Predictions
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Using your trained Random Forest model (32 features)
          </p>
        </div>
        <button
          onClick={runPredictions}
          disabled={loading}
          className="px-6 py-3 bg-[#9A3F3F] text-white rounded-lg hover:bg-[#7D3333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? '⏳ Predicting...' : '▶ Run Predictions'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {predictions.length > 0 && (
        <div className="space-y-4">
          {predictions.map((pred) => (
            <div
              key={pred.sku}
              className="bg-gradient-to-r from-[#FBF9D1] to-[#E6CFA9] rounded-lg p-6 border border-[#C1856D]"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    📦 {pred.name || pred.sku}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Predicted Sales</p>
                      <p className="text-2xl font-bold text-[#9A3F3F]">
                        {pred.predictedSales.toFixed(1)} units
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Current Stock</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {pred.currentStock}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Days Until Stockout</p>
                      <p className={`text-2xl font-bold ${
                        pred.daysUntilStockout < 3 ? 'text-red-600' : 
                        pred.daysUntilStockout < 7 ? 'text-orange-600' : 
                        'text-green-600'
                      }`}>
                        {pred.daysUntilStockout} days
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Recommended Order</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {pred.recommendedOrder} units
                      </p>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  {pred.daysUntilStockout < 3 ? (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                      🚨 URGENT
                    </span>
                  ) : pred.daysUntilStockout < 7 ? (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                      ⚠️ WARNING
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                      ✅ GOOD
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar for stock level */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Stock Depletion Progress</span>
                  <span>{((pred.currentStock / (pred.currentStock + pred.recommendedOrder)) * 100).toFixed(0)}% remaining</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      pred.daysUntilStockout < 3 ? 'bg-red-500' : 
                      pred.daysUntilStockout < 7 ? 'bg-orange-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((pred.currentStock / (pred.currentStock + pred.recommendedOrder)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">📊 Model Information</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• <strong>Model Type:</strong> Random Forest Regressor</p>
              <p>• <strong>Features:</strong> 32 (Inventory, Price, Demand, Categories, Seasonality)</p>
              <p>• <strong>Status:</strong> Running locally on your machine</p>
              <p>• <strong>API:</strong> http://localhost:5001</p>
            </div>
          </div>
        </div>
      )}

      {predictions.length === 0 && !loading && !error && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-3">🤖</p>
          <p className="text-lg font-medium">Click "Run Predictions" to see ML model in action</p>
          <p className="text-sm mt-2">Testing with {sampleItems.length} sample inventory items</p>
        </div>
      )}
    </div>
  );
}
