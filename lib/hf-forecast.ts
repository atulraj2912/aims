import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_API_KEY);

export interface ForecastResult {
  predictions: number[];
  confidence: number;
  method: string;
  modelUsed: string;
}

/**
 * Forecast demand using Hugging Face pre-trained time series model
 * This uses Amazon's Chronos foundation model - no training needed!
 */
export async function forecastWithHuggingFace(
  historicalSales: number[],
  forecastDays: number = 7
): Promise<ForecastResult> {
  try {
    // Use Amazon Chronos - pre-trained time series foundation model
    const result = await hf.request({
      model: 'amazon/chronos-t5-small',
      inputs: {
        past_values: historicalSales,
        freq: 'D', // Daily frequency
        prediction_length: forecastDays
      }
    }) as { predictions?: number[] };

    return {
      predictions: result.predictions || [],
      confidence: 0.85,
      method: 'foundation-model',
      modelUsed: 'amazon/chronos-t5-small'
    };
  } catch (error) {
    console.error('Hugging Face forecast failed:', error);
    
    // Fallback: Simple exponential smoothing
    return fallbackForecast(historicalSales, forecastDays);
  }
}

/**
 * Fallback: Exponential smoothing when HF API fails
 */
function fallbackForecast(data: number[], days: number): ForecastResult {
  const alpha = 0.3; // Smoothing factor
  let smoothed = data[0];
  const predictions: number[] = [];
  
  // Calculate smoothed value from historical data
  for (let i = 1; i < data.length; i++) {
    smoothed = alpha * data[i] + (1 - alpha) * smoothed;
  }
  
  // Project forward
  for (let i = 0; i < days; i++) {
    predictions.push(Math.round(smoothed));
  }
  
  return {
    predictions,
    confidence: 0.70,
    method: 'exponential-smoothing',
    modelUsed: 'fallback'
  };
}

/**
 * Get historical sales from database for a SKU
 */
export async function getHistoricalSales(sku: string, days: number = 30): Promise<number[]> {
  // For now, generate synthetic data
  // TODO: Replace with actual database query when historical_sales table exists
  
  const baselineSales = sku === 'WH-MED-001' ? 12 : 8;
  const sales: number[] = [];
  
  for (let i = 0; i < days; i++) {
    const dayOfWeek = (new Date().getDay() - days + i + 7) % 7;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekendBoost = isWeekend ? 1.3 : 1.0;
    const trend = 1 + (i / days) * 0.2;
    const noise = 0.85 + Math.random() * 0.3;
    
    sales.push(Math.round(baselineSales * weekendBoost * trend * noise));
  }
  
  return sales;
}
