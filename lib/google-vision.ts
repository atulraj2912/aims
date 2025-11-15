import * as vision from '@google-cloud/vision';
import { InventoryItem } from '@/types';

// Initialize Vision API client
let visionClient: vision.ImageAnnotatorClient | null = null;

function getVisionClient() {
  if (!visionClient) {
    try {
      visionClient = new vision.ImageAnnotatorClient({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });
    } catch (error) {
      console.error('Failed to initialize Vision API client:', error);
      throw new Error('Vision API not configured');
    }
  }
  return visionClient;
}

export interface DetectedProduct {
  name: string;
  sku: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  extractedText?: string;
  category?: string;
}

export async function detectProductsInImage(
  imageBuffer: Buffer,
  inventory: InventoryItem[]
): Promise<DetectedProduct[]> {
  try {
    const client = getVisionClient();
    if (!client) {
      throw new Error('Vision client not initialized');
    }

    // Perform multiple vision API calls in parallel for better results
    const [labelResult, textResult, objectResult] = await Promise.all([
      client.labelDetection?.(imageBuffer) || Promise.resolve([{ labelAnnotations: [] }]),
      client.textDetection?.(imageBuffer) || Promise.resolve([{ textAnnotations: [] }]),
      client.objectLocalization?.(imageBuffer) || Promise.resolve([{ localizedObjectAnnotations: [] }]),
    ]);

    const labels = labelResult[0].labelAnnotations || [];
    const textAnnotations = textResult[0].textAnnotations || [];
    const objects = objectResult[0].localizedObjectAnnotations || [];

    // Extract detected text (SKUs, product names, prices)
    const extractedText = textAnnotations[0]?.description || '';
    const textLines = extractedText.split('\n').filter((line: string) => line.trim());

    console.log('📸 Vision API Results:');
    console.log('Labels detected:', labels.map((l: any) => l.description).slice(0, 10));
    console.log('Objects detected:', objects.map((o: any) => o.name).slice(0, 10));
    console.log('Text extracted:', textLines.slice(0, 10));

    // Match detected items with inventory
    const detectedProducts: DetectedProduct[] = [];

    // 1. PRIORITY: Try to match by SKU from extracted text (most accurate)
    for (const line of textLines) {
      const upperLine = line.toUpperCase();
      const matchedItem = inventory.find(item => 
        upperLine.includes(item.sku.toUpperCase()) || 
        item.sku.toUpperCase().includes(upperLine.trim())
      );
      
      if (matchedItem && !detectedProducts.find(p => p.sku === matchedItem.sku)) {
        console.log(`✅ SKU Match: ${matchedItem.name} (${matchedItem.sku})`);
        detectedProducts.push({
          name: matchedItem.name,
          sku: matchedItem.sku,
          confidence: 0.95,
          extractedText: line,
        });
      }
    }

    // 2. Try to match product names from extracted text (high accuracy)
    for (const line of textLines) {
      const lowerLine = line.toLowerCase();
      
      // Skip if line is too short or already matched
      if (lowerLine.length < 3) continue;
      
      const matchedItem = inventory.find(item => {
        const itemName = item.name.toLowerCase();
        const itemWords = itemName.split(' ');
        
        // Check if any significant word from product name appears in text
        return itemWords.some(word => {
          if (word.length < 3) return false; // Skip short words
          return lowerLine.includes(word);
        });
      });

      if (matchedItem && !detectedProducts.find(p => p.sku === matchedItem.sku)) {
        console.log(`✅ Text Match: ${matchedItem.name} found in "${line}"`);
        detectedProducts.push({
          name: matchedItem.name,
          sku: matchedItem.sku,
          confidence: 0.85,
          extractedText: line,
        });
      }
    }

    // 3. Match by Vision labels ONLY if they match product categories/names closely
    for (const label of labels.slice(0, 15)) {
      const labelName = (label.description?.toLowerCase() || '').trim();
      
      // Skip generic/useless labels
      const skipLabels = ['product', 'bottle', 'liquid', 'container', 'package', 'plastic', 'food', 'drink'];
      if (skipLabels.includes(labelName) || labelName.length < 4) continue;

      const matchedItems = inventory.filter(item => {
        const itemName = item.name.toLowerCase();
        const itemWords = itemName.split(' ');
        
        // Check for exact word match or close similarity
        return itemWords.some(word => {
          if (word.length < 3) return false;
          return word === labelName || labelName.includes(word) || word.includes(labelName);
        });
      });

      // Add matched items that aren't already detected
      for (const matchedItem of matchedItems) {
        if (!detectedProducts.find(p => p.sku === matchedItem.sku)) {
          console.log(`✅ Label Match: ${matchedItem.name} matched with label "${labelName}"`);
          detectedProducts.push({
            name: matchedItem.name,
            sku: matchedItem.sku,
            confidence: label.score || 0.7,
          });
        }
      }
    }

    // 3. Match by detected objects
    for (const obj of objects.slice(0, 5)) {
      const objName = obj.name?.toLowerCase() || '';
      const matchedItem = inventory.find(item => {
        const itemName = item.name.toLowerCase();
        return itemName.includes(objName) || objName.includes(itemName.split(' ')[0]);
      });

      if (matchedItem && !detectedProducts.find(p => p.sku === matchedItem.sku)) {
        // Extract bounding box
        const vertices = obj.boundingPoly?.normalizedVertices || [];
        const boundingBox = vertices.length > 0 ? {
          x: vertices[0].x || 0,
          y: vertices[0].y || 0,
          width: (vertices[2]?.x || 0) - (vertices[0].x || 0),
          height: (vertices[2]?.y || 0) - (vertices[0].y || 0),
        } : undefined;

        detectedProducts.push({
          name: matchedItem.name,
          sku: matchedItem.sku,
          confidence: obj.score || 0.6,
          boundingBox,
        });
      }
    }

    // 4. Generic product detection (fallback)
    if (detectedProducts.length === 0) {
      // Try fuzzy matching with common grocery terms
      const groceryKeywords = ['food', 'beverage', 'bottle', 'package', 'box', 'can', 'produce'];
      
      for (const keyword of groceryKeywords) {
        const matchedLabels = labels.filter((l: any) => 
          l.description?.toLowerCase().includes(keyword)
        );

        if (matchedLabels.length > 0) {
          // Return generic detection with suggestion to add to inventory
          detectedProducts.push({
            name: `Unknown ${matchedLabels[0].description}`,
            sku: 'UNKNOWN',
            confidence: matchedLabels[0].score || 0.5,
            extractedText: textLines.slice(0, 3).join(' '),
          });
        }
      }
    }

    return detectedProducts.slice(0, 10); // Return top 10 matches

  } catch (error) {
    console.error('Vision API detection error:', error);
    throw error;
  }
}

export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  try {
    const client = getVisionClient();
    const [result] = await client.textDetection(imageBuffer);
    const detections = result.textAnnotations || [];
    return detections[0]?.description || '';
  } catch (error) {
    console.error('Text extraction error:', error);
    throw error;
  }
}

export async function detectBarcodeInImage(imageBuffer: Buffer): Promise<string | null> {
  try {
    const client = getVisionClient();
    
    // Use Vision API's barcode detection feature
    const [result] = await client.textDetection(imageBuffer);
    const text = result.textAnnotations?.[0]?.description || '';
    
    // Try to extract barcode pattern (UPC, EAN, etc.)
    const barcodePattern = /\b\d{8,14}\b/g;
    const matches = text.match(barcodePattern);
    
    return matches?.[0] || null;
  } catch (error) {
    console.error('Barcode detection error:', error);
    return null;
  }
}
