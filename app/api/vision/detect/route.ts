import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { emitInventoryUpdate } from '@/lib/socket';
import axios from 'axios';

// POST /api/vision/detect - Upload image and detect inventory items using Roboflow
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

    // Convert image to buffer
    const imageBuffer = Buffer.from(await image.arrayBuffer());

    let detectedProducts = [];
    let detectionMethod = 'roboflow';
    let extractedText = '';

    // Try Roboflow first (no billing required)
    const roboflowKey = process.env.ROBOFLOW_API_KEY;
    const roboflowModel = process.env.ROBOFLOW_MODEL || 'packages-pqk0m';
    const roboflowVersion = process.env.ROBOFLOW_VERSION || '3';

    if (roboflowKey && roboflowKey !== 'your_roboflow_api_key_here') {
      try {
        const base64Image = imageBuffer.toString('base64');

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
        console.log(`📦 Roboflow detected ${predictions.length} objects`);

        // Match detected objects to inventory
        detectedProducts = matchDetectionsToInventory(predictions, inventoryItems);
        detectionMethod = 'roboflow';
        
        console.log(`✅ Matched ${detectedProducts.length} products to inventory`);
      } catch (error) {
        console.error('Roboflow detection failed:', error);
        detectionMethod = 'simulated-fallback';
        detectedProducts = simulateDetection(inventoryItems);
      }
    } else {
      // Fallback to simulation if Roboflow not configured
      console.warn('⚠️ Roboflow API not configured, using simulation');
      detectionMethod = 'simulated';
      detectedProducts = simulateDetection(inventoryItems);
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
        extractedText,
        detectionMethod,
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
