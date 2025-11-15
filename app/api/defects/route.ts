import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/defects - Report defective product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sku, quantity, description } = body;

    // Get product details
    const { data: product } = await supabase
      .from('inventory')
      .select('name, current_stock')
      .eq('sku', sku)
      .single();

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Create defect record
    const { data: defect } = await supabase
      .from('defective_products')
      .insert([
        {
          sku,
          product_name: product.name,
          quantity,
          defect_description: description,
          status: 'reported',
          supplier_email: `supplier-${sku.toLowerCase()}@example.com`
        }
      ])
      .select()
      .single();

    // Update inventory - mark as defective and reduce stock
    const newStock = Math.max(0, product.current_stock - quantity);
    
    await supabase
      .from('inventory')
      .update({ 
        current_stock: newStock,
        is_defective: true,
        last_updated: new Date().toISOString()
      })
      .eq('sku', sku);

    // Create notification
    await supabase
      .from('notifications')
      .insert([
        {
          type: 'defect',
          title: `Defective Product Reported: ${product.name}`,
          message: `${quantity} defective units reported. Stock reduced from ${product.current_stock} to ${newStock}. Return request pending approval.`,
          sku,
          action_data: {
            defect_id: defect.id,
            quantity,
            description,
            supplier_email: defect.supplier_email
          },
          status: 'pending'
        }
      ]);

    return NextResponse.json({
      success: true,
      data: defect,
      message: 'Defect reported successfully'
    });
  } catch (error) {
    console.error('Defect report error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to report defect' },
      { status: 500 }
    );
  }
}

// GET /api/defects - Get defective products
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('defective_products')
      .select('*')
      .order('reported_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Defects fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch defects' },
      { status: 500 }
    );
  }
}

// PATCH /api/defects - Update defect status or approve return
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { defectId, action } = body; // action: 'approve_return' or 'resolve'

    const { data: defect } = await supabase
      .from('defective_products')
      .select('*')
      .eq('id', defectId)
      .single();

    if (!defect) {
      return NextResponse.json(
        { success: false, error: 'Defect not found' },
        { status: 404 }
      );
    }

    if (action === 'approve_return') {
      // Create supplier return request
      const { data: returnRequest } = await supabase
        .from('supplier_returns')
        .insert([
          {
            defect_id: defectId,
            sku: defect.sku,
            product_name: defect.product_name,
            quantity: defect.quantity,
            supplier_email: defect.supplier_email,
            reason: defect.defect_description || 'Defective product',
            status: 'requested'
          }
        ])
        .select()
        .single();

      // Update defect status
      await supabase
        .from('defective_products')
        .update({ 
          status: 'return_requested',
          return_request_sent: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', defectId);

      // TODO: Send actual email to supplier
      console.log(`📧 Return request sent to ${defect.supplier_email}:`, returnRequest);

      return NextResponse.json({
        success: true,
        data: returnRequest,
        message: `Return request sent to supplier for ${defect.quantity} units`
      });
    } else if (action === 'resolve') {
      await supabase
        .from('defective_products')
        .update({ 
          status: 'resolved',
          updated_at: new Date().toISOString()
        })
        .eq('id', defectId);

      // Remove defective flag if no other defects
      const { data: otherDefects } = await supabase
        .from('defective_products')
        .select('id')
        .eq('sku', defect.sku)
        .neq('status', 'resolved');

      if (!otherDefects || otherDefects.length === 0) {
        await supabase
          .from('inventory')
          .update({ is_defective: false })
          .eq('sku', defect.sku);
      }

      return NextResponse.json({
        success: true,
        message: 'Defect resolved'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Defect update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update defect' },
      { status: 500 }
    );
  }
}
