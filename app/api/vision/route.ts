import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/vision - Vision Core endpoint (simulates camera data and updates Supabase)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sku = searchParams.get('sku');

    if (!sku) {
      return NextResponse.json(
        { success: false, error: 'SKU parameter required' },
        { status: 400 }
      );
    }

    // Fetch current stock from Supabase
    const { data: item, error: fetchError } = await supabase
      .from('inventory')
      .select('current_stock')
      .eq('sku', sku)
      .single();

    if (fetchError) throw fetchError;

    // Simulate Vision Core detection with slight variation
    const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    const detectedStock = Math.max(0, item.current_stock + variation);

    // Update stock in Supabase if changed
    if (detectedStock !== item.current_stock) {
      await supabase
        .from('inventory')
        .update({ current_stock: detectedStock })
        .eq('sku', sku);
    }

    return NextResponse.json({
      success: true,
      data: {
        sku,
        detectedStock,
        timestamp: new Date().toISOString(),
        confidence: 0.95,
        source: 'camera-01'
      }
    });
  } catch (error) {
    console.error('Vision Core error:', error);
    return NextResponse.json(
      { success: false, error: 'Vision Core failed' },
      { status: 500 }
    );
  }
}
