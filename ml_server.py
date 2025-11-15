from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Load the trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'units_sold_model.joblib')
model = None

try:
    model = joblib.load(MODEL_PATH)
    print(f"✅ Model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"❌ Error loading model: {e}")

@app.route('/api/predict-sales', methods=['POST'])
def predict_sales():
    """
    Predict units sold based on input features
    Expected input: JSON with features required by your model
    """
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        data = request.json
        
        # Extract features from request
        # Modify these based on what features your model expects
        features = data.get('features', [])
        
        if not features:
            return jsonify({'error': 'No features provided'}), 400
        
        # Convert to numpy array for prediction
        X = np.array(features).reshape(1, -1)
        
        # Make prediction
        prediction = model.predict(X)
        
        return jsonify({
            'prediction': float(prediction[0]),
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict-inventory-sales', methods=['POST'])
def predict_inventory_sales():
    """
    Predict sales for inventory items
    Expected input: { 
        "items": [{
            "sku": "...",
            "currentStock": number,
            "unitsOrdered": number,
            "demandForecast": number,
            "price": number,
            "isHoliday": boolean,
            "competitorPrice": number,
            "productId": "P0001-P0020",
            "category": "Electronics|Furniture|Groceries|Toys",
            "seasonality": "Spring|Summer|Fall|Winter"
        }]
    }
    """
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        data = request.json
        items = data.get('items', [])
        
        if not items:
            return jsonify({'error': 'No items provided'}), 400
        
        predictions = []
        
        for item in items:
            # Prepare features based on model's training (32 features total)
            # First 6 numerical features
            inventory_level = item.get('currentStock', 50)
            units_ordered = item.get('unitsOrdered', 20)
            demand_forecast = item.get('demandForecast', 100)
            price = item.get('price', 25.0)
            holiday_promo = 1 if item.get('isHoliday', False) else 0
            competitor_price = item.get('competitorPrice', price * 1.1)
            
            # Product ID one-hot encoding (P0002-P0020, 19 features)
            product_id = item.get('productId', 'P0001')
            product_features = [0] * 19
            if product_id in [f'P{str(i).zfill(4)}' for i in range(2, 21)]:
                idx = int(product_id[1:]) - 2
                if 0 <= idx < 19:
                    product_features[idx] = 1
            
            # Category one-hot encoding (4 features)
            category = item.get('category', 'Electronics')
            category_features = [
                1 if category == 'Electronics' else 0,
                1 if category == 'Furniture' else 0,
                1 if category == 'Groceries' else 0,
                1 if category == 'Toys' else 0
            ]
            
            # Seasonality one-hot encoding (3 features)
            season = item.get('seasonality', 'Fall')
            season_features = [
                1 if season == 'Spring' else 0,
                1 if season == 'Summer' else 0,
                1 if season == 'Winter' else 0
            ]
            
            # Combine all features (6 + 19 + 4 + 3 = 32)
            features = [
                inventory_level,
                units_ordered,
                demand_forecast,
                price,
                holiday_promo,
                competitor_price
            ] + product_features + category_features + season_features
            
            # Create DataFrame with proper feature names to avoid sklearn warning
            feature_names = model.feature_names_in_ if hasattr(model, 'feature_names_in_') else None
            if feature_names is not None:
                X = pd.DataFrame([features], columns=feature_names)
            else:
                X = np.array(features).reshape(1, -1)
            
            predicted_sales = model.predict(X)
            
            # Calculate days until stockout
            daily_sales = max(predicted_sales[0] / 7, 0.1)  # Assuming weekly prediction
            days_until_stockout = int(inventory_level / daily_sales) if daily_sales > 0 else 999
            
            predictions.append({
                'sku': item.get('sku'),
                'name': item.get('name'),
                'predictedSales': float(predicted_sales[0]),
                'currentStock': inventory_level,
                'daysUntilStockout': days_until_stockout,
                'recommendedOrder': max(0, int(demand_forecast - inventory_level))
            })
        
        return jsonify({
            'predictions': predictions,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/forecast-with-model', methods=['POST'])
def forecast_with_model():
    """
    Generate 7-day forecast using the local model
    """
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        data = request.json
        historical_data = data.get('historical', [])
        
        if not historical_data:
            return jsonify({'error': 'No historical data provided'}), 400
        
        # Generate 7-day forecast
        forecast = []
        base_date = datetime.now()
        
        for i in range(7):
            # Use last known values as features
            features = [
                historical_data[-1] if historical_data else 50,
                i,  # Day index
                # Add more features as needed
            ]
            
            X = np.array(features).reshape(1, -1)
            predicted_value = model.predict(X)
            
            forecast.append({
                'date': (base_date + timedelta(days=i+1)).isoformat(),
                'predicted': float(predicted_value[0])
            })
        
        return jsonify({
            'forecast': forecast,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/model-info', methods=['GET'])
def model_info():
    """
    Get information about the loaded model
    """
    if model is None:
        return jsonify({'loaded': False, 'error': 'Model not loaded'}), 500
    
    try:
        info = {
            'loaded': True,
            'type': str(type(model).__name__),
            'model_path': MODEL_PATH,
        }
        
        # Try to get model-specific info
        if hasattr(model, 'feature_names_in_'):
            info['features'] = list(model.feature_names_in_)
        
        if hasattr(model, 'n_features_in_'):
            info['n_features'] = model.n_features_in_
        
        return jsonify(info)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🚀 Starting ML Model API Server...")
    print(f"📊 Model Path: {MODEL_PATH}")
    app.run(host='0.0.0.0', port=5001, debug=True)
