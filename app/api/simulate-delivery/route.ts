import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { emitInventoryUpdate } from '@/lib/socket';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    // This endpoint simulates supplier delivery confirmation
    // In production, this would be called by supplier webhook/API
    
    console.log(`📦 Simulating delivery for order: ${orderId}`);

    // In a real system, you'd:
    // 1. Verify the order exists in your orders table
    // 2. Update order status to 'delivered'
    // 3. Update inventory stock levels
    // 4. Send confirmation email to store manager

    return NextResponse.json({
      success: true,
      message: 'Delivery simulated successfully'
    });

  } catch (error) {
    console.error('Simulate delivery error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to simulate delivery' },
      { status: 500 }
    );
  }
}

// GET endpoint to trigger manual stock updates for testing
export async function GET() {
  try {
    // Get all low stock items
    const { data: inventory, error } = await supabase
      .from('inventory')
      .select('*');

    if (error) throw error;

    const lowStockItems = inventory.filter((item: any) => {
      const ratio = item.current_stock / item.optimal_stock;
      return ratio <= 0.5;
    });

    // Simulate restocking of critical items immediately
    const updates = [];
    for (const item of lowStockItems.slice(0, 5)) {
      const needed = item.optimal_stock - item.current_stock;
      const newStock = item.current_stock + needed;

      const { data, error: updateError } = await supabase
        .from('inventory')
        .update({
          current_stock: newStock,
          last_updated: new Date().toISOString()
        })
        .eq('id', item.id)
        .select();

      if (!updateError && data) {
        updates.push(data[0]);
        console.log(`✅ Restocked ${item.sku}: ${item.current_stock} → ${newStock}`);
      }
    }

    // Emit real-time update
    emitInventoryUpdate();

    return NextResponse.json({
      success: true,
      data: {
        itemsRestocked: updates.length,
        items: updates
      }
    });

  } catch (error) {
    console.error('Test restock error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test restock' },
      { status: 500 }
    );
  }
}
