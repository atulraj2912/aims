import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { emitInventoryUpdate } from '@/lib/socket';
import axios from 'axios';
import FormData from 'form-data';

// Local ML Model API endpoint
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5001';

// POST /api/vision/detect - Upload image and detect products using local ML model
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const sku = formData.get('sku') as string;

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Image file required' },
        { status: 400 }
      );
    }

    // Get current inventory for matching
    const { data: inventory, error: invError } = await supabase
      .from('inventory')
      .select('*');

    if (invError) {
      throw new Error('Failed to fetch inventory');
    }

    const inventoryItems = inventory.map((item: any) => ({
      id: item.id,
      sku: item.sku,
      name: item.name,
      currentStock: item.current_stock,
      optimalStock: item.optimal_stock,
      unit: item.unit,
      location: item.location,
      lastUpdated: item.last_updated
    }));

    let detectedProducts = [];
    let detectionMethod = 'local-ml-model';
    let prediction = null;

    try {
      // Try local ML model first (your trained classifier)
      console.log('🤖 Attempting detection with local ML model...');
      
      const imageBuffer = Buffer.from(await image.arrayBuffer());
      
      // Create form data for ML API
      const mlFormData = new FormData();
      mlFormData.append('file', imageBuffer, {
        filename: image.name,
        contentType: image.type
      });
      mlFormData.append('inventory', JSON.stringify(inventoryItems));

      const mlResponse = await axios.post(`${ML_API_URL}/api/detect`, mlFormData, {
        headers: {
          ...mlFormData.getHeaders(),
        },
        timeout: 10000 // 10 second timeout
      });

      if (mlResponse.data.success) {
        prediction = mlResponse.data.prediction;
        const matched = mlResponse.data.matched;
        
        console.log(`✅ ML Model detected: ${prediction.predicted_class} (${(prediction.confidence * 100).toFixed(1)}%)`);
        
        if (matched) {
          detectedProducts = [{
            name: matched.name,
            sku: matched.sku,
            confidence: prediction.confidence,
            extractedText: `ML Model: ${prediction.predicted_class}`,
            predictedClass: prediction.predicted_class,
            topPredictions: prediction.top_predictions
          }];
        } else {
          // Product detected but not in inventory
          detectedProducts = [{
            name: prediction.predicted_class,
            sku: 'NOT-IN-INVENTORY',
            confidence: prediction.confidence,
            extractedText: `Detected: ${prediction.predicted_class} (not in inventory)`,
            predictedClass: prediction.predicted_class,
            topPredictions: prediction.top_predictions
          }];
        }
        
        detectionMethod = 'local-ml-classifier';
      } else {
        throw new Error('ML model returned unsuccessful response');
      }
    } catch (mlError) {
      console.error('Local ML model failed:', mlError);
      
      // Fallback to Roboflow
      const roboflowKey = process.env.ROBOFLOW_API_KEY;
      
      if (roboflowKey && roboflowKey !== 'your_roboflow_api_key_here') {
        try {
          console.log('🔄 Falling back to Roboflow...');
          const imageBuffer = Buffer.from(await image.arrayBuffer());
          const base64Image = imageBuffer.toString('base64');
          
          const roboflowModel = process.env.ROBOFLOW_MODEL || 'packages-pqk0m';
          const roboflowVersion = process.env.ROBOFLOW_VERSION || '3';

          const response = await axios({
            method: 'POST',
            url: `https://detect.roboflow.com/${roboflowModel}/${roboflowVersion}`,
            params: {
              api_key: roboflowKey,
              confidence: 40,
              overlap: 30
            },
            data: base64Image,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });

          const predictions = response.data.predictions || [];
          detectedProducts = matchDetectionsToInventory(predictions, inventoryItems);
          detectionMethod = 'roboflow-fallback';
        } catch (roboflowError) {
          console.error('Roboflow also failed:', roboflowError);
          detectionMethod = 'simulated';
          detectedProducts = simulateDetection(inventoryItems);
        }
      } else {
        console.warn('⚠️ ML model unavailable and Roboflow not configured, using simulation');
        detectionMethod = 'simulated';
        detectedProducts = simulateDetection(inventoryItems);
      }
    }

    // Update stock for specific SKU if provided
    if (sku && detectedProducts.length > 0) {
      const detectedItem = detectedProducts.find((p: any) => p.sku === sku) || detectedProducts[0];
      
      await supabase
        .from('inventory')
        .update({ 
          current_stock: detectedItem.confidence > 0.5 ? 
            inventoryItems.find((i: any) => i.sku === sku)?.currentStock + 10 : 
            inventoryItems.find((i: any) => i.sku === sku)?.currentStock,
          last_updated: new Date().toISOString()
        })
        .eq('sku', sku);
      
      emitInventoryUpdate();
    }

    return NextResponse.json({
      success: true,
      data: {
        detectedCount: detectedProducts.length,
        products: detectedProducts,
        detectionMethod,
        mlPrediction: prediction,
        confidence: detectedProducts.length > 0 ? 
          detectedProducts.reduce((sum: number, p: any) => sum + p.confidence, 0) / detectedProducts.length : 
          0,
        sku
      }
    });

  } catch (error) {
    console.error('Vision detection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Detection failed'
      },
      { status: 500 }
    );
  }
}

// Match Roboflow detections to inventory
function matchDetectionsToInventory(predictions: any[], inventory: any[]): any[] {
  const matched: any[] = [];

  for (const pred of predictions) {
    const className = (pred.class || '').toLowerCase();
    
    // Try to find matching product in inventory
    const matchedItem = inventory.find((item: any) => {
      const itemName = item.name.toLowerCase();
      const itemWords = itemName.split(' ');
      
      // Check if detection class matches product name keywords
      return itemWords.some((word: string) => 
        word.length > 2 && (className.includes(word) || word.includes(className))
      );
    });

    if (matchedItem && !matched.find((m: any) => m.sku === matchedItem.sku)) {
      matched.push({
        name: matchedItem.name,
        sku: matchedItem.sku,
        confidence: pred.confidence || 0.7,
        boundingBox: {
          x: pred.x,
          y: pred.y,
          width: pred.width,
          height: pred.height
        }
      });
    }
  }

  // If no matches, return detected objects generically
  if (matched.length === 0 && predictions.length > 0) {
    return predictions.slice(0, 3).map((pred: any) => ({
      name: `Detected: ${pred.class || 'Unknown'}`,
      sku: 'UNKNOWN',
      confidence: pred.confidence || 0.5,
      extractedText: `Roboflow detected: ${pred.class}`
    }));
  }

  return matched;
}

// Simulate detection for demo/fallback
function simulateDetection(inventory: any[]): any[] {
  if (!inventory || inventory.length === 0) {
    return [{
      name: 'Sample Product',
      sku: 'DEMO-001',
      confidence: 0.85,
      extractedText: 'Demo mode - configure detection API for real detection'
    }];
  }

  // Return random products from inventory
  const randomCount = Math.floor(Math.random() * 3) + 1;
  const shuffled = [...inventory].sort(() => 0.5 - Math.random());
  
  return shuffled.slice(0, randomCount).map((item: any) => ({
    name: item.name,
    sku: item.sku,
    confidence: 0.7 + Math.random() * 0.25, // 70-95% confidence
    extractedText: `Simulated detection: ${item.sku}`
  }));
}
