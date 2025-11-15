'use client';

import { InventoryItem } from '@/types';
import { useState } from 'react';

interface StockCardProps {
  item: InventoryItem;
  onStockUpdate: () => void;
}

export default function StockCard({ item, onStockUpdate }: StockCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const stockRatio = item.currentStock / item.optimalStock;

  // Festival-aware demand prediction
  const getFestivalMultiplier = (category: string): { multiplier: number; festival: string | null } => {
    const today = new Date();
    const month = today.getMonth();
    const day = today.getDate();

    const festivals = [
      { name: 'Christmas', month: 11, startDay: 20, endDay: 26, categories: { 'Fruit': 1.8, 'Vegetable': 1.5, 'Dairy': 2.0 } },
      { name: 'Thanksgiving', month: 10, startDay: 20, endDay: 28, categories: { 'Fruit': 1.7, 'Vegetable': 2.0, 'Dairy': 1.6 } },
      { name: 'Easter', month: 3, startDay: 15, endDay: 22, categories: { 'Fruit': 1.5, 'Vegetable': 1.3, 'Dairy': 1.8 } },
      { name: 'New Year', month: 0, startDay: 1, endDay: 3, categories: { 'Fruit': 1.6, 'Vegetable': 1.4, 'Dairy': 1.5 } },
      { name: 'Independence Day', month: 6, startDay: 2, endDay: 5, categories: { 'Fruit': 1.7, 'Vegetable': 1.8, 'Dairy': 1.4 } },
      { name: 'Diwali', month: 9, startDay: 24, endDay: 28, categories: { 'Fruit': 2.0, 'Vegetable': 1.6, 'Dairy': 2.2 } },
    ];

    for (const festival of festivals) {
      if (month === festival.month && day >= festival.startDay && day <= festival.endDay) {
        const multiplier = festival.categories[category as keyof typeof festival.categories] || 1.3;
        return { multiplier, festival: festival.name };
      }
    }
    return { multiplier: 1.0, festival: null };
  };

  // Generate sales history and forecast
  const generateSalesData = () => {
    const baseDailyDemand = item.optimalStock / 30;
    const { multiplier: festivalMultiplier } = getFestivalMultiplier(item.category || 'Fruit');

    // 7 days historical
    const historical = Array.from({ length: 7 }, (_, i) => {
      const daysAgo = 7 - i;
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      const dayOfWeek = date.getDay();
      const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1.0;
      const randomVariation = 0.8 + Math.random() * 0.4;
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: Math.round(baseDailyDemand * weekendFactor * randomVariation)
      };
    });

    // 7 days forecast
    const forecast = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      const dayOfWeek = date.getDay();
      const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1.0;
      const monthEndFactor = date.getDate() > 25 ? 1.2 : 1.0;
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: Math.round(baseDailyDemand * weekendFactor * monthEndFactor * festivalMultiplier)
      };
    });

    return { historical, forecast };
  };
  
  // Determine status and styling
  const getStatus = () => {
    if (stockRatio <= 0.2) return { 
      label: 'CRITICAL', 
      color: 'bg-red-600', 
      textColor: 'text-red-600',
      dotColor: 'bg-red-500'
    };
    if (stockRatio <= 0.5) return { 
      label: 'LOW', 
      color: 'bg-orange-500', 
      textColor: 'text-orange-600',
      dotColor: 'bg-orange-500'
    };
    if (stockRatio < 1) return { 
      label: 'BELOW OPTIMAL', 
      color: 'bg-yellow-500', 
      textColor: 'text-yellow-700',
      dotColor: 'bg-yellow-500'
    };
    return { 
      label: 'OPTIMAL', 
      color: 'bg-green-500', 
      textColor: 'text-green-600',
      dotColor: 'bg-green-500'
    };
  };

  const status = getStatus();

  return (
    <>
      {/* Professional Table Row */}
      <tr className="hover:bg-blue-50/30 transition-all duration-150 border-b border-gray-100 group">
        <td className="w-[25%] px-6 py-4">
          <div className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">{item.name}</div>
          <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <span className="text-gray-400">📍</span>
            <span>{item.location}</span>
          </div>
        </td>
        <td className="w-[12%] px-6 py-4">
          <span className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200">{item.sku}</span>
        </td>
        <td className="w-[13%] px-6 py-4">
          <div className="flex flex-col items-center">
            <span className={`text-xl font-bold ${status.textColor}`}>{item.currentStock}</span>
            <span className="text-xs text-gray-400 uppercase tracking-wide">{item.unit}</span>
          </div>
        </td>
        <td className="w-[13%] px-6 py-4">
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-gray-700">{item.optimalStock}</span>
            <span className="text-xs text-gray-400 uppercase tracking-wide">{item.unit}</span>
          </div>
        </td>
        <td className="w-[17%] px-6 py-4">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status.dotColor} shadow-sm`}></div>
              <span className={`text-xs font-semibold ${status.textColor} uppercase tracking-wider`}>{status.label}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
              <div 
                className={`h-full ${status.color} transition-all duration-500 ease-out shadow-sm`}
                style={{ width: `${Math.min(stockRatio * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-500">{Math.round(stockRatio * 100)}%</span>
          </div>
        </td>
        <td className="w-[20%] px-6 py-4 text-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-xs font-medium shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
          >
            <span>{expanded ? '▲' : '▼'}</span>
            <span>{expanded ? 'Hide' : 'Details'}</span>
          </button>
        </td>
      </tr>

      {/* Expanded Details Row */}
      {expanded && (
        <tr className="bg-gray-50">
          <td colSpan={6} className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl shadow-md border border-gray-200">
                <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-200">
                  <span className="text-blue-600">📊</span>
                  <span>Stock Overview</span>
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100">
                    <span className="text-gray-600 font-medium">Current Stock</span>
                    <span className="font-bold text-gray-900">{item.currentStock} <span className="text-xs text-gray-500">{item.unit}</span></span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100">
                    <span className="text-gray-600 font-medium">Target Level</span>
                    <span className="font-bold text-gray-900">{item.optimalStock} <span className="text-xs text-gray-500">{item.unit}</span></span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100">
                    <span className="text-gray-600 font-medium">Variance</span>
                    <span className={`font-bold ${item.currentStock < item.optimalStock ? 'text-red-600' : 'text-green-600'}`}>
                      {item.currentStock < item.optimalStock ? '-' : '+'}{Math.abs(item.optimalStock - item.currentStock)} <span className="text-xs">{item.unit}</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <span className="text-blue-700 font-semibold">Fill Rate</span>
                    <span className="font-bold text-blue-900">{Math.round(stockRatio * 100)}%</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex justify-between">
                        <span>SKU</span>
                        <span className="font-mono font-semibold text-gray-700">{item.sku}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated</span>
                        <span className="font-medium text-gray-700">{new Date(item.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                {(() => {
                  const salesData = generateSalesData();
                  const allData = [...salesData.historical, ...salesData.forecast];
                  const maxSales = Math.max(...allData.map(d => d.sales));
                  const { festival } = getFestivalMultiplier(item.category || 'Fruit');

                  return (
                    <div className="bg-white p-3 rounded-lg border border-gray-300 shadow-sm h-full">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                          <span className="text-blue-600">📊</span>
                          Sales Analytics
                          {festival && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">
                              {festival}
                            </span>
                          )}
                        </h4>
                        <div className="flex gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
                            <span className="text-gray-500 text-xs">Historical</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
                            <span className="text-gray-500 text-xs">Forecast</span>
                          </div>
                        </div>
                      </div>

                      {/* Bar Chart */}
                      <div className="bg-gray-50 rounded p-2 border border-gray-200">
                        <div className="relative h-32 mb-4">
                          {/* Grid lines */}
                          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                            <div className="border-t border-gray-300"></div>
                            <div className="border-t border-gray-200"></div>
                            <div className="border-t border-gray-200"></div>
                            <div className="border-t border-gray-200"></div>
                            <div className="border-t border-gray-300 border-b"></div>
                          </div>

                          {/* Y-axis labels */}
                          <div className="absolute -left-8 inset-y-0 flex flex-col justify-between text-xs text-gray-500 font-medium">
                            <span>{maxSales}</span>
                            <span>{Math.round(maxSales * 0.5)}</span>
                            <span>0</span>
                          </div>

                          {/* Bars container */}
                          <div className="absolute inset-0 flex items-end gap-0.5 px-1">
                            {allData.map((data, index) => {
                              const isHistorical = index < 7;
                              const heightPercent = (data.sales / maxSales) * 100;
                              
                              return (
                                <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                                  {/* Bar */}
                                  <div
                                    className={`w-full transition-all duration-150 rounded-t ${
                                      isHistorical 
                                        ? 'bg-blue-500 hover:bg-blue-600' 
                                        : 'bg-green-500 hover:bg-green-600'
                                    }`}
                                    style={{ height: `${Math.max(heightPercent, 2)}%` }}
                                  >
                                    {/* Tooltip */}
                                    <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                      <div>{data.date}</div>
                                      <div className="font-semibold">{data.sales} {item.unit}</div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Center divider */}
                          <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-gray-400"></div>

                          {/* X-axis labels */}
                          <div className="absolute -bottom-4 inset-x-0 flex justify-between px-1">
                            {allData.map((data, index) => (
                              index % 2 === 0 && (
                                <span key={index} className="text-xs text-gray-500 flex-1 text-center font-medium">
                                  {data.date.split(' ')[1]}
                                </span>
                              )
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Compact Stats */}
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div className="bg-blue-50 px-2 py-1.5 rounded border border-blue-200">
                          <p className="text-xs text-blue-600 font-medium">Past Avg</p>
                          <p className="text-sm font-bold text-blue-900">
                            {Math.round(salesData.historical.reduce((sum, d) => sum + d.sales, 0) / 7)}
                            <span className="text-xs font-normal text-gray-600 ml-0.5">/{item.unit}</span>
                          </p>
                        </div>
                        <div className="bg-green-50 px-2 py-1.5 rounded border border-green-200">
                          <p className="text-xs text-green-600 font-medium">Forecast Avg</p>
                          <p className="text-sm font-bold text-green-900">
                            {Math.round(salesData.forecast.reduce((sum, d) => sum + d.sales, 0) / 7)}
                            <span className="text-xs font-normal text-gray-600 ml-0.5">/{item.unit}</span>
                          </p>
                        </div>
                        <div className="bg-purple-50 px-2 py-1.5 rounded border border-purple-200">
                          <p className="text-xs text-purple-600 font-medium">7d Total</p>
                          <p className="text-sm font-bold text-purple-900">
                            {salesData.forecast.reduce((sum, d) => sum + d.sales, 0)}
                            <span className="text-xs font-normal text-gray-600 ml-0.5">{item.unit}</span>
                          </p>
                        </div>
                      </div>

                      {/* Insights */}
                      <div className="mt-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded p-2">
                        <p className="text-xs text-gray-700 leading-relaxed">
                          <span className="font-semibold text-blue-700">💡</span> 
                          {salesData.forecast.reduce((sum, d) => sum + d.sales, 0) > salesData.historical.reduce((sum, d) => sum + d.sales, 0) 
                            ? ' Upward trend detected. Recommend increasing stock levels.'
                            : ' Stable demand pattern. Current inventory is sufficient.'}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>


          </td>
        </tr>
      )}
    </>
  );
}
