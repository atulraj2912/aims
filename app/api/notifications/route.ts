import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/notifications - Fetch all notifications
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create new notification
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, title, message, sku, actionData } = body;

    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          type,
          title,
          message,
          sku: sku || null,
          action_data: actionData || null,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Notification creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Update notification status
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    const { data, error } = await supabase
      .from('notifications')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}
