'use client';

import { useEffect, useState } from 'react';
import ForecastChart from './ForecastChart';
import { getHistoricalSales } from '@/lib/hf-forecast';

interface AnalyticsSummary {
  totalValue: number;
  stockoutRisk: number;
  overstock: number;
  optimizationScore: number;
}

interface Prediction {
  sku: string;
  currentStock: number;
  predictedStock: number;
  daysUntilStockout: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendedAction: string;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  predictions: Prediction[];
  insights: string[];
  generatedAt: string;
}

export default function AnalyticsPanel() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    // Refresh analytics every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics');
      const result = await response.json();
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <div className="text-6xl mb-4">🤖</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">AI Analytics Unavailable</h3>
        <p className="text-gray-600">Add inventory items to see ML-powered predictions and insights.</p>
      </div>
    );
  }

  const getRiskColor = (risk: number) => {
    if (risk >= 20) return 'text-red-600 bg-red-100';
    if (risk >= 10) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return '📈';
    if (trend === 'decreasing') return '📉';
    return '➡️';
  };

  // Generate 7-day predictions array from prediction object
  const generatePredictions = (pred: Prediction): number[] => {
    const predictions: number[] = [];
    const dailyChange = (pred.predictedStock - pred.currentStock) / 7;
    
    for (let i = 1; i <= 7; i++) {
      predictions.push(Math.round(pred.currentStock + (dailyChange * i)));
    }
    
    return predictions;
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-2xl border border-white/30">
                🤖
              </div>
              <div>
                <h2 className="text-3xl font-bold">AI Analytics Engine</h2>
                <p className="text-purple-100 text-sm">ML-Powered Demand Forecasting & Predictions</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-6 py-3 rounded-xl font-semibold transition-all border border-white/30 hover:scale-105"
          >
            {expanded ? '↑ Collapse' : '↓ Expand Details'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 p-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ₹{analytics.summary.totalValue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 mt-2 font-medium">Total Inventory Value</div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <span className="text-xs text-gray-500">📊 Portfolio worth</span>
          </div>
        </div>
        
        <div className="text-center bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className={`text-4xl font-bold px-4 py-2 rounded-xl inline-block ${getRiskColor(analytics.summary.stockoutRisk)}`}>
            {analytics.summary.stockoutRisk}%
          </div>
          <div className="text-sm text-gray-600 mt-2 font-medium">Stockout Risk</div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <span className="text-xs text-gray-500">⚠️ Critical alerts</span>
          </div>
        </div>
        
        <div className="text-center bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-orange-600">
            {analytics.summary.overstock}
          </div>
          <div className="text-sm text-gray-600 mt-2 font-medium">Overstock Items</div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <span className="text-xs text-gray-500">📦 Excess inventory</span>
          </div>
        </div>
        
        <div className="text-center bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className={`text-4xl font-bold ${getScoreColor(analytics.summary.optimizationScore)}`}>
            {analytics.summary.optimizationScore}/100
          </div>
          <div className="text-sm text-gray-600 mt-2 font-medium">Optimization Score</div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <span className="text-xs text-gray-500">✨ System efficiency</span>
          </div>
        </div>
      </div>

      {/* Critical Insights */}
      <div className="p-8 bg-white">
        <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2 text-lg">
          <span className="text-2xl">💡</span>
          <span>AI-Generated Insights</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all hover:scale-[1.02]">
              <span className="text-2xl flex-shrink-0">🎯</span>
              <span className="text-sm text-gray-700 leading-relaxed">{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Predictions */}
      {expanded && (
        <div className="p-6">
          <h3 className="font-bold text-gray-800 mb-4">🔮 Stock Predictions (7-Day Forecast)</h3>
          <div className="space-y-3">
            {analytics.predictions.map((pred) => (
              <div key={pred.sku} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold text-gray-800">{pred.sku}</div>
                    <div className="text-sm text-gray-600">
                      Current: {pred.currentStock} → Predicted: {pred.predictedStock}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl">{getTrendIcon(pred.trend)}</div>
                    <div className="text-xs text-gray-500">{pred.confidence}% confident</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    pred.daysUntilStockout < 7 
                      ? 'bg-red-100 text-red-700' 
                      : pred.daysUntilStockout < 14
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {pred.daysUntilStockout < 999 
                      ? `${pred.daysUntilStockout} days until stockout`
                      : 'No stockout risk'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                    pred.trend === 'increasing' 
                      ? 'bg-blue-100 text-blue-700'
                      : pred.trend === 'decreasing'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {pred.trend}
                  </span>
                </div>
                
                {/* Forecast Chart */}
                <div className="mb-3">
                  <ForecastChart
                    sku={pred.sku}
                    historical={[]}
                    predictions={generatePredictions(pred)}
                    currentStock={pred.currentStock}
                    optimalStock={Math.round(pred.currentStock * 1.2)}
                  />
                </div>
                
                <div className="text-sm text-gray-700 bg-purple-50 p-2 rounded">
                  <strong>AI Recommendation:</strong> {pred.recommendedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t text-xs text-gray-500 text-center">
        Generated using Linear Regression & Statistical Analysis • 
        Last updated: {new Date(analytics.generatedAt).toLocaleTimeString()}
      </div>
    </div>
  );
}
