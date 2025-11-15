import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { emitInventoryUpdate } from '@/lib/socket';

// POST /api/restock - Process restock approval
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, items } = body; // items: [{ sku, quantity }]

    const updatedItems = [];

    for (const item of items) {
      // Get current stock
      const { data: product } = await supabase
        .from('inventory')
        .select('current_stock, name')
        .eq('sku', item.sku)
        .single();

      if (product) {
        const newStock = product.current_stock + item.quantity;

        // Update inventory
        await supabase
          .from('inventory')
          .update({ 
            current_stock: newStock,
            last_updated: new Date().toISOString()
          })
          .eq('sku', item.sku);

        updatedItems.push({
          sku: item.sku,
          name: product.name,
          oldStock: product.current_stock,
          newStock,
          added: item.quantity
        });
      }
    }

    // Update replenishment order status if orderId provided
    if (orderId) {
      await supabase
        .from('replenishment_orders')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
    }

    // Emit real-time update
    emitInventoryUpdate();

    return NextResponse.json({
      success: true,
      data: updatedItems,
      message: `Restocked ${updatedItems.length} product(s)`
    });
  } catch (error) {
    console.error('Restock error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process restock' },
      { status: 500 }
    );
  }
}
