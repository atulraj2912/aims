import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock pending orders data
    const pendingOrders = [
      {
        id: 'ORD-001',
        supplier: 'Fresh Produce Co.',
        items: [
          { sku: 'SKU-004', name: 'Fresh Bananas', quantity: 20, price: 248 }
        ],
        totalAmount: 4960,
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        id: 'ORD-002',
        supplier: 'Dairy Direct Ltd.',
        items: [
          { sku: 'SKU-002', name: 'Organic Tea Leaves', quantity: 12, price: 705 }
        ],
        totalAmount: 8460,
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: pendingOrders
    });

  } catch (error) {
    console.error('❌ Error fetching pending orders:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch pending orders',
        data: [] 
      },
      { status: 500 }
    );
  }
}
