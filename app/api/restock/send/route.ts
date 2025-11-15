import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { sendRestockRequestToSupplier, RestockRequest } from '@/lib/emailService';

// In-memory storage for approval tokens (in production, use database)
// Use global to persist across hot reloads in development
const globalForPendingRequests = global as typeof globalThis & {
  pendingRequests?: Map<string, RestockRequest>;
};

const pendingRequests = globalForPendingRequests.pendingRequests ?? new Map<string, RestockRequest>();
globalForPendingRequests.pendingRequests = pendingRequests;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { items, supplierEmail, supplierName } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Items array is required' },
        { status: 400 }
      );
    }

    if (!supplierEmail) {
      return NextResponse.json(
        { success: false, error: 'Supplier email is required' },
        { status: 400 }
      );
    }

    // Generate unique request ID and approval token
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const approvalToken = uuidv4();

    // Calculate total value
    const totalValue = items.reduce((sum: number, item: any) => 
      sum + (item.quantityToOrder * item.price), 0
    );

    // Create restock request object
    const restockRequest: RestockRequest = {
      id: requestId,
      items: items.map((item: any) => ({
        sku: item.sku,
        name: item.name,
        currentStock: item.currentStock,
        optimalStock: item.optimalStock,
        quantityToOrder: item.quantityToOrder,
        unit: item.unit,
        price: item.price || 0,
      })),
      totalValue,
      requestDate: new Date().toISOString(),
      supplierEmail,
      supplierName: supplierName || 'Supplier',
    };

    // Store request with token
    pendingRequests.set(approvalToken, restockRequest);
    console.log(`✅ Stored approval token: ${approvalToken}`);
    console.log(`📊 Total pending requests: ${pendingRequests.size}`);

    // Set expiration (24 hours)
    setTimeout(() => {
      console.log(`⏰ Expiring token: ${approvalToken}`);
      pendingRequests.delete(approvalToken);
    }, 24 * 60 * 60 * 1000);

    // Send email to supplier
    const emailResult = await sendRestockRequestToSupplier(restockRequest, approvalToken);

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to send email to supplier', details: emailResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      requestId,
      message: `Restock request sent to ${supplierName}`,
      emailSent: true,
    });

  } catch (error) {
    console.error('Error sending restock request:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Export the pending requests map for use in approval endpoints
export { pendingRequests };
