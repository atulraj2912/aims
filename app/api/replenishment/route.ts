import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { emitReplenishmentUpdate } from '@/lib/socket';

// GET /api/replenishment - Fetch pending replenishment orders from Supabase
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('replenishment_orders')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform database format to match frontend expectations
    const transformedData = data.map(order => ({
      id: order.id,
      sku: order.sku,
      itemName: order.item_name,
      currentStock: order.current_stock,
      optimalStock: order.optimal_stock,
      quantityToOrder: order.quantity_to_order,
      status: order.status,
      createdAt: order.created_at,
      priority: order.priority
    }));

    return NextResponse.json({
      success: true,
      data: transformedData,
      lastSync: new Date().toISOString()
    });
  } catch (error) {
    console.error('Replenishment fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch replenishment orders' },
      { status: 500 }
    );
  }
}

// POST /api/replenishment - Create new replenishment order in Supabase
export async function POST(request: NextRequest) {
  try {
    const { sku, currentStock, optimalStock, itemName, priority } = await request.json();

    // Validate if replenishment is needed
    if (currentStock >= optimalStock) {
      return NextResponse.json(
        { success: false, error: 'Replenishment not needed' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('replenishment_orders')
      .insert([{
        sku,
        item_name: itemName,
        current_stock: currentStock,
        optimal_stock: optimalStock,
        quantity_to_order: optimalStock - currentStock,
        status: 'pending',
        priority: priority || calculatePriority(currentStock, optimalStock)
      }])
      .select()
      .single();

    if (error) throw error;

    // Emit socket event for real-time update
    emitReplenishmentUpdate();

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        sku: data.sku,
        itemName: data.item_name,
        currentStock: data.current_stock,
        optimalStock: data.optimal_stock,
        quantityToOrder: data.quantity_to_order,
        status: data.status,
        createdAt: data.created_at,
        priority: data.priority
      }
    });
  } catch (error) {
    console.error('Replenishment creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create replenishment order' },
      { status: 500 }
    );
  }
}

// PATCH /api/replenishment - Approve or reject a replenishment order in Supabase
export async function PATCH(request: NextRequest) {
  try {
    const { orderId, action } = await request.json();

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const { data, error } = await supabase
      .from('replenishment_orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    // Emit socket event for real-time update
    emitReplenishmentUpdate();

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        sku: data.sku,
        itemName: data.item_name,
        status: data.status
      },
      message: `Order ${action}d successfully`
    });
  } catch (error) {
    console.error('Replenishment update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// Helper function to calculate priority
function calculatePriority(currentStock: number, optimalStock: number): 'low' | 'medium' | 'high' | 'critical' {
  const ratio = currentStock / optimalStock;
  
  if (ratio <= 0.2) return 'critical';
  if (ratio <= 0.4) return 'high';
  if (ratio <= 0.6) return 'medium';
  return 'low';
}
