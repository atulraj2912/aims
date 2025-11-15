import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateAnalytics, getCriticalInsights } from '@/lib/analytics';

export async function GET() {
  try {
    // Fetch inventory from Supabase
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('sku', { ascending: true });

    if (error) throw error;

    // Transform to analytics format
    const inventoryData = data.map(item => ({
      sku: item.sku,
      currentStock: item.current_stock,
      optimalStock: item.optimal_stock,
      unit: item.unit
    }));

    // Generate ML analytics (now async!)
    const analytics = await generateAnalytics(inventoryData);
    const insights = getCriticalInsights(analytics);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalValue: analytics.totalValue,
          stockoutRisk: analytics.stockoutRisk,
          overstock: analytics.overstock,
          optimizationScore: analytics.optimizationScore
        },
        predictions: analytics.predictions,
        forecasts: analytics.forecasts,
        insights,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Analytics generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate analytics' },
      { status: 500 }
    );
  }
}
