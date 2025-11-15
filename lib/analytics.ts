import { mean, standardDeviation, median } from 'simple-statistics';
import { SimpleLinearRegression } from 'ml-regression-simple-linear';
import { forecastWithHuggingFace, getHistoricalSales } from './hf-forecast';

export interface StockPrediction {
  sku: string;
  currentStock: number;
  predictedStock: number;
  daysUntilStockout: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendedAction: string;
}

export interface DemandForecast {
  sku: string;
  avgDailyConsumption: number;
  nextWeekDemand: number;
  nextMonthDemand: number;
  volatility: 'low' | 'medium' | 'high';
}

export interface AnalyticsSummary {
  totalValue: number;
  stockoutRisk: number; // 0-100
  overstock: number;
  optimizationScore: number; // 0-100
  predictions: StockPrediction[];
  forecasts: DemandForecast[];
}

/**
 * Generate mock historical data for ML training
 * In production, this would fetch from database
 */
function generateHistoricalData(currentStock: number, optimalStock: number): number[] {
  const days = 30;
  const data: number[] = [];
  let stock = currentStock + Math.random() * 20;
  
  for (let i = 0; i < days; i++) {
    // Simulate daily consumption with some randomness
    const dailyConsumption = (optimalStock * 0.05) + (Math.random() * 5 - 2.5);
    stock = Math.max(0, stock - dailyConsumption);
    data.push(Math.round(stock));
  }
  
  return data.reverse(); // Most recent last
}

/**
 * Predict stock levels using Hugging Face + linear regression hybrid
 */
export async function predictStockLevels(
  sku: string,
  currentStock: number,
  optimalStock: number
): Promise<StockPrediction> {
  // Get historical sales data
  const historicalSales = await getHistoricalSales(sku, 30);
  
  // Try Hugging Face forecasting first
  let predictedStock = currentStock;
  let confidence = 0.70;
  let useHF = false;
  
  try {
    const hfResult = await forecastWithHuggingFace(historicalSales, 7);
    if (hfResult.predictions.length > 0) {
      // Use average of 7-day forecast
      predictedStock = Math.round(
        hfResult.predictions.reduce((a, b) => a + b, 0) / hfResult.predictions.length
      );
      confidence = hfResult.confidence;
      useHF = true;
    }
  } catch (error) {
    console.log('HF forecast unavailable, using linear regression');
  }
  
  // Fallback: Linear regression on historical data
  if (!useHF) {
    const historicalStocks = generateHistoricalData(currentStock, optimalStock);
    const days = historicalStocks.map((_, i) => i);
    const regression = new SimpleLinearRegression(days, historicalStocks);
    predictedStock = Math.max(0, Math.round(regression.predict(days.length + 7)));
  }
  
  // Calculate trend from historical sales
  const recentSales = historicalSales.slice(-7);
  const avgRecent = mean(recentSales);
  const avgOverall = mean(historicalSales);
  
  let trend: 'increasing' | 'decreasing' | 'stable';
  if (avgRecent > avgOverall * 1.1) trend = 'increasing';
  else if (avgRecent < avgOverall * 0.9) trend = 'decreasing';
  else trend = 'stable';
  
  // Calculate days until stockout based on consumption rate
  const avgDailyConsumption = mean(historicalSales);
  let daysUntilStockout = Infinity;
  if (avgDailyConsumption > 0) {
    daysUntilStockout = Math.max(0, Math.round(currentStock / avgDailyConsumption));
  }
  
  // Generate recommendation
  let recommendedAction = '';
  if (daysUntilStockout < 7) {
    recommendedAction = `URGENT: Order ${optimalStock - currentStock} units immediately`;
  } else if (daysUntilStockout < 14) {
    recommendedAction = `Plan to order ${optimalStock - currentStock} units within 5 days`;
  } else if (currentStock > optimalStock * 1.5) {
    recommendedAction = 'Reduce ordering - overstock detected';
  } else {
    recommendedAction = 'Stock levels optimal - maintain current rate';
  }
  
  return {
    sku,
    currentStock,
    predictedStock,
    daysUntilStockout: Math.min(daysUntilStockout, 999),
    confidence,
    trend,
    recommendedAction
  };
}

/**
 * Forecast demand using statistical analysis
 */
export function forecastDemand(
  sku: string,
  currentStock: number,
  optimalStock: number
): DemandForecast {
  // Generate historical consumption data
  const consumptionData = Array.from({ length: 30 }, () => 
    (optimalStock * 0.05) + (Math.random() * 3 - 1.5)
  );
  
  // Calculate statistics
  const avgDailyConsumption = mean(consumptionData);
  const stdDev = standardDeviation(consumptionData);
  
  // Forecast demand
  const nextWeekDemand = Math.round(avgDailyConsumption * 7);
  const nextMonthDemand = Math.round(avgDailyConsumption * 30);
  
  // Determine volatility
  const coefficientOfVariation = stdDev / avgDailyConsumption;
  let volatility: 'low' | 'medium' | 'high';
  if (coefficientOfVariation < 0.2) volatility = 'low';
  else if (coefficientOfVariation < 0.5) volatility = 'medium';
  else volatility = 'high';
  
  return {
    sku,
    avgDailyConsumption: Math.round(avgDailyConsumption * 10) / 10,
    nextWeekDemand,
    nextMonthDemand,
    volatility
  };
}

/**
 * Generate comprehensive analytics summary
 */
export async function generateAnalytics(
  inventory: Array<{
    sku: string;
    currentStock: number;
    optimalStock: number;
    unit: string;
  }>
): Promise<AnalyticsSummary> {
  const predictions: StockPrediction[] = [];
  const forecasts: DemandForecast[] = [];
  
  let totalStockoutRisk = 0;
  let overstockCount = 0;
  
  // Analyze each item (process sequentially to handle async)
  for (const item of inventory) {
    const prediction = await predictStockLevels(item.sku, item.currentStock, item.optimalStock);
    const forecast = forecastDemand(item.sku, item.currentStock, item.optimalStock);
    
    predictions.push(prediction);
    forecasts.push(forecast);
    
    // Calculate stockout risk
    const stockRatio = item.currentStock / item.optimalStock;
    if (stockRatio < 0.3) totalStockoutRisk += 30;
    else if (stockRatio < 0.5) totalStockoutRisk += 15;
    else if (stockRatio < 0.7) totalStockoutRisk += 5;
    
    // Count overstock
    if (item.currentStock > item.optimalStock * 1.5) {
      overstockCount++;
    }
  }
  
  const avgStockoutRisk = inventory.length > 0 
    ? Math.round(totalStockoutRisk / inventory.length) 
    : 0;
  
  // Calculate optimization score (0-100)
  const optimizationScore = Math.max(0, Math.min(100, 
    100 - avgStockoutRisk - (overstockCount * 10)
  ));
  
  // Calculate total inventory value (simplified)
  const totalValue = inventory.reduce((sum, item) => 
    sum + (item.currentStock * 25), // Assume $25 per unit average
  0);
  
  return {
    totalValue,
    stockoutRisk: avgStockoutRisk,
    overstock: overstockCount,
    optimizationScore,
    predictions,
    forecasts
  };
}

/**
 * Get critical insights for dashboard
 */
export function getCriticalInsights(analytics: AnalyticsSummary): string[] {
  const insights: string[] = [];
  
  // Stockout warnings
  const criticalItems = analytics.predictions.filter(p => p.daysUntilStockout < 7);
  if (criticalItems.length > 0) {
    insights.push(`⚠️ ${criticalItems.length} item(s) approaching stockout within 7 days`);
  }
  
  // Overstock alerts
  if (analytics.overstock > 0) {
    insights.push(`📦 ${analytics.overstock} item(s) overstocked - consider reducing orders`);
  }
  
  // Optimization score
  if (analytics.optimizationScore >= 90) {
    insights.push(`✅ Excellent inventory optimization (${analytics.optimizationScore}/100)`);
  } else if (analytics.optimizationScore >= 70) {
    insights.push(`📊 Good inventory health (${analytics.optimizationScore}/100)`);
  } else {
    insights.push(`⚡ Optimization needed (${analytics.optimizationScore}/100)`);
  }
  
  // High volatility items
  const volatileItems = analytics.forecasts.filter(f => f.volatility === 'high');
  if (volatileItems.length > 0) {
    insights.push(`📈 ${volatileItems.length} item(s) with high demand volatility - monitor closely`);
  }
  
  return insights;
}
