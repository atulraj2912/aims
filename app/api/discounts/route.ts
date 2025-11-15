import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/discounts - Create or approve discount offer
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { notificationId, action, discountPercentage, offerType } = body;

    if (action === 'approve') {
      // Get notification details
      const { data: notification } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .single();

      if (!notification) {
        return NextResponse.json(
          { success: false, error: 'Notification not found' },
          { status: 404 }
        );
      }

      const actionData = notification.action_data as any;
      const originalPrice = actionData.original_price || 0;
      const discount = discountPercentage || actionData.suggested_discount;
      const discountedPrice = originalPrice * (1 - discount / 100);

      // Create discount offer
      const { data: offer } = await supabase
        .from('discount_offers')
        .insert([
          {
            sku: notification.sku,
            product_name: (await supabase.from('inventory').select('name').eq('sku', notification.sku).single()).data?.name || '',
            original_price: originalPrice,
            discount_percentage: discount,
            discounted_price: discountedPrice,
            offer_type: offerType || actionData.offer_type || 'percentage_off',
            reason: notification.type === 'expiring' ? 'expiring' : 'overstocked',
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days
          }
        ])
        .select()
        .single();

      // Update inventory with discount
      await supabase
        .from('inventory')
        .update({ 
          discount_percentage: discount,
          price: discountedPrice,
          last_updated: new Date().toISOString()
        })
        .eq('sku', notification.sku);

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
        data: offer,
        message: `${discount}% discount applied to ${notification.sku}`
      });
    } else if (action === 'reject') {
      await supabase
        .from('notifications')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      return NextResponse.json({
        success: true,
        message: 'Discount offer rejected'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Discount error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process discount' },
      { status: 500 }
    );
  }
}

// GET /api/discounts - Get active discount offers
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('discount_offers')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Discounts fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch discounts' },
      { status: 500 }
    );
  }
}
