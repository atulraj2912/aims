'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface ForecastChartProps {
  sku: string;
  historical: number[];
  predictions: number[];
  currentStock: number;
  optimalStock: number;
}

export default function ForecastChart({ sku, historical, predictions, currentStock, optimalStock }: ForecastChartProps) {
  // Prepare chart data
  const chartData = [
    ...historical.map((value, index) => ({
      day: `Day -${historical.length - index}`,
      actual: value,
      type: 'historical'
    })),
    {
      day: 'Today',
      actual: currentStock,
      forecast: currentStock,
      optimal: optimalStock,
      type: 'current'
    },
    ...predictions.map((value, index) => ({
      day: `Day +${index + 1}`,
      forecast: value,
      optimal: optimalStock,
      type: 'prediction'
    }))
  ];

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <h4 className="text-lg font-bold text-gray-800 mb-4">
        📈 7-Day Forecast: {sku}
      </h4>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="day" 
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 11 }}
          />
          <YAxis label={{ value: 'Stock Level', angle: -90, position: 'insideLeft' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Legend />
          
          {/* Optimal stock line */}
          <Line 
            type="monotone" 
            dataKey="optimal" 
            stroke="#10b981" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Optimal Stock"
            dot={false}
          />
          
          {/* Historical actual data */}
          <Area
            type="monotone"
            dataKey="actual"
            stroke="#3b82f6"
            fill="#93c5fd"
            fillOpacity={0.3}
            name="Historical Stock"
          />
          
          {/* Forecast data */}
          <Area
            type="monotone"
            dataKey="forecast"
            stroke="#8b5cf6"
            fill="#c4b5fd"
            fillOpacity={0.3}
            strokeDasharray="5 5"
            name="AI Forecast"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      <div className="mt-4 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-400 rounded"></div>
          <span>Historical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-400 rounded border-2 border-purple-600 border-dashed"></div>
          <span>AI Forecast</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 bg-green-500"></div>
          <span>Optimal Level</span>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
        <p className="text-sm text-purple-800">
          <strong>🤖 Powered by:</strong> Hugging Face Amazon Chronos Foundation Model + Linear Regression
        </p>
      </div>
    </div>
  );
}
