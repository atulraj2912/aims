import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/sales - Record a sale
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sku, productName, quantitySold, salePrice } = body;

    // Record the sale
    const { data: saleData, error: saleError } = await supabase
      .from('sales_records')
      .insert([
        {
          sku,
          product_name: productName,
          quantity_sold: quantitySold,
          sale_price: salePrice
        }
      ])
      .select()
      .single();

    if (saleError) throw saleError;

    // Update inventory stock
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select('current_stock, optimal_stock, name')
      .eq('sku', sku)
      .single();

    if (inventoryError) throw inventoryError;

    const newStock = Math.max(0, inventoryData.current_stock - quantitySold);

    await supabase
      .from('inventory')
      .update({ 
        current_stock: newStock,
        last_updated: new Date().toISOString()
      })
      .eq('sku', sku);

    // Check if stock is low and create notification
    const stockPercentage = (newStock / inventoryData.optimal_stock) * 100;
    
    if (stockPercentage <= 30) {
      // Calculate recent sales demand
      const { data: recentSales } = await supabase
        .from('sales_records')
        .select('quantity_sold')
        .eq('sku', sku)
        .gte('sale_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const totalSold = recentSales?.reduce((sum, sale) => sum + sale.quantity_sold, 0) || 0;
      const dailyDemand = totalSold / 7;
      const daysUntilStockout = dailyDemand > 0 ? Math.floor(newStock / dailyDemand) : 999;
      const recommendedOrder = Math.max(inventoryData.optimal_stock - newStock, Math.ceil(dailyDemand * 14));

      // Create low stock notification
      await supabase
        .from('notifications')
        .insert([
          {
            type: 'low_stock',
            title: `Low Stock Alert: ${inventoryData.name}`,
            message: `Current stock: ${newStock} units (${stockPercentage.toFixed(0)}% of optimal). High demand detected. Days until stockout: ${daysUntilStockout}`,
            sku,
            action_data: {
              current_stock: newStock,
              optimal_stock: inventoryData.optimal_stock,
              recommended_order: recommendedOrder,
              daily_demand: dailyDemand.toFixed(1),
              days_until_stockout: daysUntilStockout
            },
            status: 'pending'
          }
        ]);
    }

    return NextResponse.json({
      success: true,
      data: {
        sale: saleData,
        newStock,
        lowStockAlert: stockPercentage <= 30
      }
    });
  } catch (error) {
    console.error('Sale recording error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record sale' },
      { status: 500 }
    );
  }
}

// GET /api/sales - Get sales records
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sku = searchParams.get('sku');
    const days = parseInt(searchParams.get('days') || '30');

    let query = supabase
      .from('sales_records')
      .select('*')
      .gte('sale_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('sale_date', { ascending: false });

    if (sku) {
      query = query.eq('sku', sku);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Sales fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales records' },
      { status: 500 }
    );
  }
}
