import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/check-expiry - Check for expiring or overstocked products
export async function POST() {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Get all inventory
    const { data: inventory, error: invError } = await supabase
      .from('inventory')
      .select('*');

    if (invError) throw invError;

    const alerts = [];

    for (const item of inventory) {
      // Check expiry
      if (item.expiry_date) {
        const expiryDate = new Date(item.expiry_date);
        const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

        if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0 && item.current_stock > 0) {
          // Get sales data
          const { data: sales } = await supabase
            .from('sales_records')
            .select('quantity_sold')
            .eq('sku', item.sku)
            .gte('sale_date', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());

          const totalSold = sales?.reduce((sum, s) => sum + s.quantity_sold, 0) || 0;
          const avgDailySales = totalSold / 14;
          const daysToSellCurrent = avgDailySales > 0 ? Math.ceil(item.current_stock / avgDailySales) : 999;

          // If can't sell before expiry
          if (daysToSellCurrent > daysUntilExpiry) {
            // Check if notification already exists
            const { data: existingNotif } = await supabase
              .from('notifications')
              .select('id')
              .eq('sku', item.sku)
              .eq('type', 'expiring')
              .eq('status', 'pending')
              .single();

            if (!existingNotif) {
              const suggestedDiscount = daysUntilExpiry < 7 ? 50 : daysUntilExpiry < 15 ? 30 : 20;

              const { data: notification } = await supabase
                .from('notifications')
                .insert([
                  {
                    type: 'expiring',
                    title: `Expiring Soon: ${item.name}`,
                    message: `${item.current_stock} units expiring in ${daysUntilExpiry} days. Current sales pace won't clear stock in time. Suggested: ${suggestedDiscount}% discount or BOGO offer.`,
                    sku: item.sku,
                    action_data: {
                      expiry_date: item.expiry_date,
                      days_until_expiry: daysUntilExpiry,
                      current_stock: item.current_stock,
                      daily_sales: avgDailySales.toFixed(1),
                      days_to_sell: daysToSellCurrent,
                      suggested_discount: suggestedDiscount,
                      original_price: item.price
                    },
                    status: 'pending'
                  }
                ])
                .select()
                .single();

              alerts.push(notification);
            }
          }
        }
      }

      // Check overstocked + slow moving
      const stockRatio = item.current_stock / item.optimal_stock;
      if (stockRatio > 1.5) {
        // Get recent sales
        const { data: sales } = await supabase
          .from('sales_records')
          .select('quantity_sold')
          .eq('sku', item.sku)
          .gte('sale_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        const totalSold = sales?.reduce((sum, s) => sum + s.quantity_sold, 0) || 0;
        const monthlySalesRate = totalSold / item.current_stock;

        // If selling less than 20% per month (slow moving)
        if (monthlySalesRate < 0.2) {
          const { data: existingNotif } = await supabase
            .from('notifications')
            .select('id')
            .eq('sku', item.sku)
            .eq('type', 'discount')
            .eq('status', 'pending')
            .single();

          if (!existingNotif) {
            const { data: notification } = await supabase
              .from('notifications')
              .insert([
                {
                  type: 'discount',
                  title: `Overstocked & Slow-Moving: ${item.name}`,
                  message: `${item.current_stock} units (${(stockRatio * 100).toFixed(0)}% of optimal). Low sales activity. Suggest clearance discount to free up space.`,
                  sku: item.sku,
                  action_data: {
                    current_stock: item.current_stock,
                    optimal_stock: item.optimal_stock,
                    stock_ratio: stockRatio.toFixed(2),
                    monthly_sales: totalSold,
                    suggested_discount: 25,
                    original_price: item.price,
                    offer_type: 'clearance'
                  },
                  status: 'pending'
                }
              ])
              .select()
              .single();

            alerts.push(notification);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: alerts,
      message: `Created ${alerts.length} expiry/overstock alert(s)`
    });
  } catch (error) {
    console.error('Expiry check error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check expiry/overstock' },
      { status: 500 }
    );
  }
}
