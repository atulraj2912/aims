# AIMS Local ML Model Integration

## Quick Start

1. **Start the Python ML Server** (in a new terminal):
```powershell
D:/aims/.venv/Scripts/python.exe ml_server.py
```

2. **Start the Next.js app** (if not already running):
```powershell
npm run dev
```

3. **Access the dashboard**:
   - Go to http://localhost:3000
   - Sign in with Clerk
   - You should see the ML Model status indicator

## What Was Set Up

### 1. Model File
- Your trained model: `models/units_sold_model.joblib` (883 MB)
- Format: scikit-learn joblib

### 2. Python ML Server (`ml_server.py`)
Flask API server running on port 5001 with endpoints:
- `POST /api/predict-sales` - General sales prediction
- `POST /api/predict-inventory-sales` - Predict sales for inventory items
- `POST /api/forecast-with-model` - 7-day forecast
- `GET /api/model-info` - Model details
- `GET /health` - Health check

### 3. Frontend Integration
- `lib/local-model.ts` - API client functions
- `components/ModelStatus.tsx` - Real-time model status indicator
- Dashboard updated with ModelStatus component

### 4. Python Environment
- Virtual environment: `.venv/`
- Installed packages: Flask, scikit-learn, joblib, numpy, pandas, flask-cors

## Using Your Model

### Test the Model API
```powershell
# Check model health
curl http://localhost:5001/health

# Get model info
curl http://localhost:5001/api/model-info

# Make a prediction (adjust features based on your model)
curl -X POST http://localhost:5001/api/predict-sales -H "Content-Type: application/json" -d '{"features": [50, 100, 25]}'
```

### Integration Examples

**Predict sales for inventory items:**
```typescript
import { predictSalesWithLocalModel } from '@/lib/local-model';

const predictions = await predictSalesWithLocalModel([
  { sku: 'SKU001', currentStock: 50, optimalStock: 100 },
  { sku: 'SKU002', currentStock: 30, optimalStock: 80 }
]);
```

**Generate forecast:**
```typescript
import { forecastWithLocalModel } from '@/lib/local-model';

const forecast = await forecastWithLocalModel([45, 52, 48, 55, 60]);
```

## Next Steps

### 1. Customize Model Features
Edit `ml_server.py` to match your model's training features:
```python
features = [
    item.get('currentStock', 0),
    item.get('optimalStock', 100),
    # Add your actual features here
]
```

### 2. Replace Cloud APIs
Update your dashboard to use local predictions instead of Roboflow/Hugging Face:
- Replace vision detection with local predictions
- Replace time series forecasting with local model

### 3. Add UI for Predictions
Create components to display:
- Sales predictions per SKU
- Stockout date predictions
- Demand forecasting charts

### 4. Model Monitoring
Add logging and metrics:
- Prediction latency
- Model accuracy tracking
- Feature importance visualization

## Troubleshooting

### Model Not Loading
Check the model path in `ml_server.py`:
```python
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'units_sold_model.joblib')
```

### CORS Errors
The server has CORS enabled for localhost. If deploying, update CORS settings.

### Feature Mismatch
Your model expects specific features. Check with:
```powershell
curl http://localhost:5001/api/model-info
```

### Performance
Large model (883 MB) - consider:
- Model compression
- Quantization
- Caching predictions
- Loading model on startup (already done)

## Architecture

```
User Browser → Next.js (localhost:3000)
                 ↓
            Local Model API calls
                 ↓
       Python Flask Server (localhost:5001)
                 ↓
       Loads scikit-learn model
                 ↓
       Returns predictions
```

## Deployment Considerations

When deploying to production:
1. Host Python server separately (e.g., Railway, Render)
2. Update API URLs from localhost to production
3. Add authentication to ML endpoints
4. Set up proper CORS for production domain
5. Consider model versioning
6. Add monitoring and logging
