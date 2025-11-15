import { NextRequest, NextResponse } from 'next/server';
import { sendApprovalConfirmation } from '@/lib/emailService';
import { pendingRequests } from '../../restock/send/route';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

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
            <p>No approval token provided</p>
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
            <p>This approval link is no longer valid</p>
            <p style="color: #666; font-size: 14px;">Requests expire after 24 hours or once processed</p>
          </div>
        </body>
        </html>
        `,
        { status: 404, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Send confirmation email to shopkeeper
    const emailResult = await sendApprovalConfirmation(restockRequest);

    // Remove from pending requests
    pendingRequests.delete(token);

    // TODO: Save approval to database here
    // await saveApprovalToDatabase(restockRequest);

    if (!emailResult.success) {
      console.error('Failed to send confirmation email:', emailResult.error);
    }

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Approved</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh; 
            margin: 0; 
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          }
          .container { 
            text-align: center; 
            background: white; 
            padding: 50px; 
            border-radius: 15px; 
            box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
            max-width: 600px;
          }
          .success { color: #10b981; font-size: 72px; margin-bottom: 20px; }
          h1 { color: #059669; margin-bottom: 10px; }
          .request-id { 
            background: #d1fae5; 
            padding: 10px 20px; 
            border-radius: 5px; 
            display: inline-block; 
            margin: 20px 0;
            font-family: monospace;
          }
          .info-box {
            background: #f0f9ff;
            border-left: 4px solid #0284c7;
            padding: 20px;
            margin: 30px 0;
            text-align: left;
            border-radius: 5px;
          }
          .info-box h3 { margin-top: 0; color: #0369a1; }
          ul { text-align: left; line-height: 1.8; }
          .footer { color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✅</div>
          <h1>Order Approved Successfully!</h1>
          <div class="request-id">Request ID: ${restockRequest.id}</div>
          
          <div class="info-box">
            <h3>Order Details</h3>
            <ul>
              <li><strong>Items:</strong> ${restockRequest.items.length} product(s)</li>
              <li><strong>Total Value:</strong> Rs. ${restockRequest.totalValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</li>
              <li><strong>Approved:</strong> ${new Date().toLocaleString('en-IN')}</li>
            </ul>
          </div>

          <p style="color: #059669; font-size: 18px; font-weight: bold;">
            📧 Confirmation email sent to shopkeeper
          </p>

          <div class="footer">
            <p>Thank you for your prompt response!</p>
            <p>The shopkeeper has been notified of your approval.</p>
          </div>
        </div>
      </body>
      </html>
      `,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error) {
    console.error('Error approving request:', error);
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
          <p>An error occurred while approving the order</p>
          <p style="color: #666; font-size: 14px;">${(error as Error).message}</p>
        </div>
      </body>
      </html>
      `,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
}
