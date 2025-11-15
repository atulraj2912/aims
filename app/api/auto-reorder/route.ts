import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/auto-reorder - Create auto-reorder suggestions
export async function POST(request: Request) {
  try {
    const { data: inventory, error: invError } = await supabase
      .from('inventory')
      .select('*');

    if (invError) throw invError;

    const reorderSuggestions = [];

    for (const item of inventory) {
      const stockPercentage = (item.current_stock / item.optimal_stock) * 100;

      // Get sales data for this product
      const { data: sales } = await supabase
        .from('sales_records')
        .select('quantity_sold, sale_date')
        .eq('sku', item.sku)
        .gte('sale_date', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());

      const totalSold = sales?.reduce((sum, s) => sum + s.quantity_sold, 0) || 0;
      const avgDailyDemand = totalSold / 14;

      // Check if low stock with high demand
      if (stockPercentage < 40 && avgDailyDemand > 0) {
        const daysUntilStockout = Math.floor(item.current_stock / avgDailyDemand);
        const recommendedQty = Math.max(
          item.optimal_stock - item.current_stock,
          Math.ceil(avgDailyDemand * 21) // 3 weeks supply
        );

        // Check if notification already exists
        const { data: existingNotif } = await supabase
          .from('notifications')
          .select('id')
          .eq('sku', item.sku)
          .eq('type', 'reorder')
          .eq('status', 'pending')
          .single();

        if (!existingNotif && daysUntilStockout < 7) {
          // Create reorder notification
          const { data: notification } = await supabase
            .from('notifications')
            .insert([
              {
                type: 'reorder',
                title: `Reorder Needed: ${item.name}`,
                message: `Stock running low (${item.current_stock} units, ${daysUntilStockout} days until stockout). Recommend ordering ${recommendedQty} units.`,
                sku: item.sku,
                action_data: {
                  current_stock: item.current_stock,
                  optimal_stock: item.optimal_stock,
                  recommended_quantity: recommendedQty,
                  daily_demand: avgDailyDemand.toFixed(1),
                  days_until_stockout: daysUntilStockout,
                  priority: daysUntilStockout < 3 ? 'critical' : daysUntilStockout < 5 ? 'high' : 'medium'
                },
                status: 'pending'
              }
            ])
            .select()
            .single();

          reorderSuggestions.push(notification);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: reorderSuggestions,
      message: `Created ${reorderSuggestions.length} reorder suggestion(s)`
    });
  } catch (error) {
    console.error('Auto-reorder error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create reorder suggestions' },
      { status: 500 }
    );
  }
}

// PATCH /api/auto-reorder - Approve or reject reorder
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { notificationId, action, orderQuantity } = body; // action: 'approve' or 'reject'

    // Get notification details
    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single();

    if (notifError) throw notifError;

    if (action === 'approve') {
      // Create replenishment order
      const actionData = notification.action_data as any;
      
      const { data: order } = await supabase
        .from('replenishment_orders')
        .insert([
          {
            sku: notification.sku,
            item_name: (await supabase.from('inventory').select('name').eq('sku', notification.sku).single()).data?.name || '',
            current_stock: actionData.current_stock,
            optimal_stock: actionData.optimal_stock,
            quantity_to_order: orderQuantity || actionData.recommended_quantity,
            status: 'pending',
            priority: actionData.priority || 'medium'
          }
        ])
        .select()
        .single();

      // Update notification
      await supabase
        .from('notifications')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      return NextResponse.json({
        success: true,
        data: order,
        message: 'Reorder approved and order created'
      });
    } else {
      // Reject
      await supabase
        .from('notifications')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      return NextResponse.json({
        success: true,
        message: 'Reorder rejected'
      });
    }
  } catch (error) {
    console.error('Reorder approval error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process reorder' },
      { status: 500 }
    );
  }
}
