import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { emitInventoryUpdate } from '@/lib/socket';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface RestockRequest {
  sku: string;
  name: string;
  currentStock: number;
  optimalStock: number;
  quantityNeeded: number;
  location: string;
  urgency: 'critical' | 'low';
}

export async function POST(request: Request) {
  try {
    const { requests } = await request.json() as { requests: RestockRequest[] };

    if (!requests || !Array.isArray(requests) || requests.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Simulate sending requests to suppliers
    // In production, this would integrate with supplier APIs, email systems, or ERP
    const supplierOrders = requests.map(req => ({
      orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sku: req.sku,
      productName: req.name,
      quantity: req.quantityNeeded,
      urgency: req.urgency,
      status: 'pending',
      supplierEmail: getSupplierEmail(req.sku),
      estimatedDelivery: getEstimatedDelivery(req.urgency),
      createdAt: new Date().toISOString()
    }));

    // Log the orders (in production, save to database)
    console.log('📦 Restocking Orders Created:', supplierOrders);

    // Simulate email/API notification to suppliers
    for (const order of supplierOrders) {
      await sendSupplierNotification(order);
    }

    // Simulate supplier delivery and update inventory
    // In production, this would be triggered by supplier confirmation webhook
    const updatedInventory = await updateInventoryStock(requests);

    // Emit real-time socket event for dashboard updates
    emitInventoryUpdate();

    return NextResponse.json({
      success: true,
      data: {
        ordersCreated: supplierOrders.length,
        orders: supplierOrders,
        inventoryUpdated: updatedInventory.length,
        message: `${supplierOrders.length} restocking request(s) sent and inventory updated`
      }
    });

  } catch (error) {
    console.error('Restocking API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process restocking requests' },
      { status: 500 }
    );
  }
}

// Helper function to determine supplier based on SKU prefix
function getSupplierEmail(sku: string): string {
  const prefix = sku.split('-')[0];
  const supplierMap: Record<string, string> = {
    'PROD': 'produce@freshsupply.com',
    'DAIRY': 'orders@dairyco.com',
    'BAK': 'bakery@freshbaked.com',
    'MEAT': 'meat@butchersupply.com',
    'FRZ': 'frozen@coldstorage.com',
    'BEV': 'beverages@drinkdist.com',
    'DRY': 'pantry@drygoods.com',
    'SNK': 'snacks@snacksupplier.com',
    'HH': 'household@cleaningsupply.com',
    'PC': 'personal@caresupplier.com'
  };
  
  return supplierMap[prefix] || 'general@supplier.com';
}

// Helper function to calculate estimated delivery based on urgency
function getEstimatedDelivery(urgency: 'critical' | 'low'): string {
  const daysToAdd = urgency === 'critical' ? 1 : 3;
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
  return deliveryDate.toISOString();
}

// Helper function to send notification to supplier
async function sendSupplierNotification(order: any): Promise<void> {
  // Simulate email/API call delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  console.log(`📧 Notification sent to ${order.supplierEmail}:`);
  console.log(`   Order ID: ${order.orderId}`);
  console.log(`   Product: ${order.productName} (${order.sku})`);
  console.log(`   Quantity: ${order.quantity}`);
  console.log(`   Urgency: ${order.urgency.toUpperCase()}`);
  console.log(`   Expected: ${new Date(order.estimatedDelivery).toLocaleDateString()}`);
  
  // In production, integrate with:
  // - SendGrid/AWS SES for email
  // - Twilio for SMS
  // - Supplier API endpoints
  // - ERP system webhooks
}

// Helper function to update inventory stock after restocking approval
async function updateInventoryStock(requests: RestockRequest[]): Promise<any[]> {
  const updates = [];
  
  for (const req of requests) {
    try {
      // Calculate new stock level (current + quantity needed)
      const newStock = req.currentStock + req.quantityNeeded;
      
      // Update in Supabase
      const { data, error } = await supabase
        .from('inventory')
        .update({ 
          current_stock: newStock,
          last_updated: new Date().toISOString()
        })
        .eq('sku', req.sku)
        .select();
      
      if (error) {
        console.error(`Failed to update ${req.sku}:`, error);
        continue;
      }
      
      console.log(`✅ Updated ${req.sku}: ${req.currentStock} → ${newStock} ${req.name.includes('kg') || req.name.includes('L') ? 'units' : 'pcs'}`);
      updates.push(data?.[0]);
      
    } catch (error) {
      console.error(`Error updating ${req.sku}:`, error);
    }
  }
  
  return updates;
}
