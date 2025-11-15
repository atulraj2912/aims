import { NextRequest, NextResponse } from 'next/server';
import { sendRejectionNotification } from '@/lib/emailService';
import { pendingRequests } from '../../restock/send/route';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const reason = searchParams.get('reason') || 'No reason provided';

    if (!token) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Request</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #fee2e2; }
            .container { text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .error { color: #dc2626; font-size: 48px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">❌</div>
            <h1>Invalid Request</h1>
            <p>No token provided</p>
          </div>
        </body>
        </html>
        `,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Retrieve the request from pending requests
    const restockRequest = pendingRequests.get(token);

    if (!restockRequest) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Request Expired</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #fef3c7; }
            .container { text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .warning { color: #f59e0b; font-size: 48px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="warning">⏰</div>
            <h1>Request Expired or Already Processed</h1>
            <p>This link is no longer valid</p>
          </div>
        </body>
        </html>
        `,
        { status: 404, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Send rejection notification to shopkeeper
    const emailResult = await sendRejectionNotification(restockRequest, reason);

    // Remove from pending requests
    pendingRequests.delete(token);

    // TODO: Save rejection to database here
    // await saveRejectionToDatabase(restockRequest, reason);

    if (!emailResult.success) {
      console.error('Failed to send rejection email:', emailResult.error);
    }

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Declined</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh; 
            margin: 0; 
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          }
          .container { 
            text-align: center; 
            background: white; 
            padding: 50px; 
            border-radius: 15px; 
            box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
            max-width: 600px;
          }
          .reject { color: #ef4444; font-size: 72px; margin-bottom: 20px; }
          h1 { color: #dc2626; margin-bottom: 10px; }
          .request-id { 
            background: #fee2e2; 
            padding: 10px 20px; 
            border-radius: 5px; 
            display: inline-block; 
            margin: 20px 0;
            font-family: monospace;
          }
          .info-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 30px 0;
            text-align: left;
            border-radius: 5px;
          }
          .info-box h3 { margin-top: 0; color: #d97706; }
          .footer { color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="reject">❌</div>
          <h1>Order Declined</h1>
          <div class="request-id">Request ID: ${restockRequest.id}</div>
          
          <div class="info-box">
            <h3>Declined Order Details</h3>
            <p><strong>Items:</strong> ${restockRequest.items.length} product(s)</p>
            <p><strong>Total Value:</strong> Rs. ${restockRequest.totalValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
            <p><strong>Declined:</strong> ${new Date().toLocaleString('en-IN')}</p>
            ${reason !== 'No reason provided' ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          </div>

          <p style="color: #dc2626; font-size: 18px; font-weight: bold;">
            📧 Notification sent to shopkeeper
          </p>

          <div class="footer">
            <p>Thank you for your response.</p>
            <p>The shopkeeper has been notified of your decision.</p>
          </div>
        </div>
      </body>
      </html>
      `,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error) {
    console.error('Error rejecting request:', error);
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #fee2e2; }
          .container { text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .error { color: #dc2626; font-size: 48px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error">⚠️</div>
          <h1>Error Processing Request</h1>
          <p>An error occurred while declining the order</p>
        </div>
      </body>
      </html>
      `,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
}
