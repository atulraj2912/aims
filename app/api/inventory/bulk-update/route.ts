import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { emitInventoryUpdate } from '@/lib/socket';

// POST /api/inventory/bulk-update - Update multiple items or increment stock
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sku, incrementBy } = body;

    if (!sku) {
      return NextResponse.json(
        { success: false, error: 'SKU is required' },
        { status: 400 }
      );
    }

    // Get current item
    const { data: item, error: fetchError } = await supabase
      .from('inventory')
      .select('*')
      .eq('sku', sku)
      .single();

    if (fetchError || !item) {
      return NextResponse.json(
        { success: false, error: `Item with SKU ${sku} not found` },
        { status: 404 }
      );
    }

    // Increment stock
    const newStock = item.current_stock + (incrementBy || 1);

    // Update in database
    const { error: updateError } = await supabase
      .from('inventory')
      .update({
        current_stock: newStock,
        last_updated: new Date().toISOString()
      })
      .eq('sku', sku);

    if (updateError) {
      throw updateError;
    }

    console.log(`✅ Updated ${sku}: ${item.current_stock} → ${newStock} units`);

    // Emit real-time update
    emitInventoryUpdate();

    return NextResponse.json({
      success: true,
      data: {
        sku,
        oldStock: item.current_stock,
        newStock,
        incrementBy: incrementBy || 1
      }
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Update failed'
      },
      { status: 500 }
    );
  }
}
