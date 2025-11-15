export interface InventoryPredictionInput {
  sku: string;
  name?: string;
  currentStock: number;
  unitsOrdered: number;
  demandForecast: number;
  price: number;
  isHoliday?: boolean;
  competitorPrice: number;
  productId: string; // P0001-P0020
  category: 'Electronics' | 'Furniture' | 'Groceries' | 'Toys';
  seasonality: 'Spring' | 'Summer' | 'Fall' | 'Winter';
}

export interface SalesPrediction {
  sku: string;
  name?: string;
  predictedSales: number;
  currentStock: number;
  daysUntilStockout: number;
  recommendedOrder: number;
}

export async function predictSalesWithLocalModel(items: InventoryPredictionInput[]): Promise<SalesPrediction[]> {
  try {
    const response = await fetch('http://localhost:5001/api/predict-inventory-sales', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      throw new Error('Failed to get predictions from local model');
    }

    const data = await response.json();
    return data.predictions;
  } catch (error) {
    console.error('Local model prediction error:', error);
    throw error;
  }
}

export async function forecastWithLocalModel(historicalData: number[]) {
  try {
    const response = await fetch('http://localhost:5001/api/forecast-with-model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ historical: historicalData }),
    });

    if (!response.ok) {
      throw new Error('Failed to get forecast from local model');
    }

    const data = await response.json();
    return data.forecast;
  } catch (error) {
    console.error('Local model forecast error:', error);
    throw error;
  }
}

export async function getModelInfo() {
  try {
    // Use health check endpoint which contains model info
    const response = await fetch('/api/vision-detect', {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error('Failed to get model info');
    }

    const data = await response.json();
    // Return flask_api data which contains model_loaded, mode, etc.
    return data.flask_api || data;
  } catch (error) {
    console.error('Model info error:', error);
    return null;
  }
}

export async function checkModelHealth() {
  try {
    const response = await fetch('/api/vision-detect', {
      method: 'GET',
    });
    return await response.json();
  } catch (error) {
    console.error('Model health check failed:', error);
    return { status: 'error', model_loaded: false, connected: false };
  }
}
