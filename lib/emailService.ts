import nodemailer from 'nodemailer';

export interface EmailConfig {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface RestockRequest {
  id: string;
  items: {
    sku: string;
    name: string;
    currentStock: number;
    optimalStock: number;
    quantityToOrder: number;
    unit: string;
    price: number;
  }[];
  totalValue: number;
  requestDate: string;
  supplierEmail: string;
  supplierName: string;
}

// Create SMTP transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Send generic email
export async function sendEmail(config: EmailConfig) {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'AIMS Inventory <noreply@aims.com>',
      to: config.to,
      subject: config.subject,
      html: config.html,
      text: config.text || config.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Generate restock request email HTML for supplier
export function generateRestockRequestEmail(request: RestockRequest, approvalToken: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const approveUrl = `${appUrl}/api/supplier/approve?token=${approvalToken}`;
  const rejectUrl = `${appUrl}/api/supplier/reject?token=${approvalToken}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; }
    .items-table th { background: #667eea; color: white; padding: 12px; text-align: left; }
    .items-table td { padding: 12px; border-bottom: 1px solid #ddd; }
    .total-row { font-weight: bold; background: #f0f0f0; }
    .button { display: inline-block; padding: 15px 30px; margin: 10px 5px; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center; }
    .approve-btn { background: #10b981; color: white; }
    .reject-btn { background: #ef4444; color: white; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .info-box { background: #e0e7ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛒 New Restock Request</h1>
      <p>Request ID: ${request.id}</p>
    </div>
    
    <div class="content">
      <div class="info-box">
        <strong>From:</strong> ${process.env.SHOPKEEPER_NAME || 'Store Name'}<br>
        <strong>Email:</strong> ${process.env.SHOPKEEPER_EMAIL}<br>
        <strong>Date:</strong> ${new Date(request.requestDate).toLocaleDateString('en-IN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}<br>
        <strong>Total Order Value:</strong> Rs. ${request.totalValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      </div>

      <h2>Order Details</h2>
      <table class="items-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product Name</th>
            <th>Current Stock</th>
            <th>Order Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${request.items.map(item => `
            <tr>
              <td>${item.sku}</td>
              <td>${item.name}</td>
              <td>${item.currentStock} ${item.unit}</td>
              <td><strong>${item.quantityToOrder} ${item.unit}</strong></td>
              <td>Rs. ${item.price.toFixed(2)}</td>
              <td>Rs. ${(item.quantityToOrder * item.price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="5" style="text-align: right;">TOTAL ORDER VALUE:</td>
            <td>Rs. ${request.totalValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
          </tr>
        </tbody>
      </table>

      <h3 style="text-align: center; margin-top: 30px;">Please Review and Respond</h3>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${approveUrl}" class="button approve-btn">✅ APPROVE ORDER</a>
        <a href="${rejectUrl}" class="button reject-btn">❌ REJECT ORDER</a>
      </div>

      <p style="color: #666; font-size: 14px; text-align: center;">
        Click the buttons above to respond, or copy the links below:
      </p>
      <p style="color: #666; font-size: 12px; word-break: break-all;">
        Approve: ${approveUrl}<br>
        Reject: ${rejectUrl}
      </p>
    </div>

    <div class="footer">
      <p>This is an automated email from AIMS Inventory Management System</p>
      <p>Please do not reply to this email</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Generate approval confirmation email for shopkeeper
export function generateApprovalConfirmationEmail(request: RestockRequest) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; }
    .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 5px; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; }
    .items-table th { background: #10b981; color: white; padding: 12px; text-align: left; }
    .items-table td { padding: 12px; border-bottom: 1px solid #ddd; }
    .total-row { font-weight: bold; background: #f0f0f0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Order Approved!</h1>
      <p>Request ID: ${request.id}</p>
    </div>
    
    <div class="content">
      <div class="success-box">
        <h2 style="margin-top: 0; color: #059669;">🎉 Good News!</h2>
        <p><strong>${request.supplierName}</strong> has approved your restock order.</p>
        <p><strong>Approval Date:</strong> ${new Date().toLocaleDateString('en-IN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
      </div>

      <h3>Approved Order Details</h3>
      <table class="items-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product Name</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${request.items.map(item => `
            <tr>
              <td>${item.sku}</td>
              <td>${item.name}</td>
              <td>${item.quantityToOrder} ${item.unit}</td>
              <td>Rs. ${item.price.toFixed(2)}</td>
              <td>Rs. ${(item.quantityToOrder * item.price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="4" style="text-align: right;">TOTAL ORDER VALUE:</td>
            <td>Rs. ${request.totalValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
          </tr>
        </tbody>
      </table>

      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <strong>📦 Next Steps:</strong>
        <ul>
          <li>Your supplier will process and ship the order</li>
          <li>Estimated delivery will be communicated separately</li>
          <li>Update your inventory upon receiving the shipment</li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <p>This is an automated confirmation from AIMS Inventory Management System</p>
      <p>Login to your dashboard for more details</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Generate rejection notification email for shopkeeper
export function generateRejectionNotificationEmail(request: RestockRequest, reason?: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; }
    .warning-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 5px; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; }
    .items-table th { background: #ef4444; color: white; padding: 12px; text-align: left; }
    .items-table td { padding: 12px; border-bottom: 1px solid #ddd; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❌ Order Not Approved</h1>
      <p>Request ID: ${request.id}</p>
    </div>
    
    <div class="content">
      <div class="warning-box">
        <h2 style="margin-top: 0; color: #dc2626;">Order Declined</h2>
        <p><strong>${request.supplierName}</strong> has declined your restock order.</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      </div>

      <h3>Declined Order Details</h3>
      <table class="items-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product Name</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${request.items.map(item => `
            <tr>
              <td>${item.sku}</td>
              <td>${item.name}</td>
              <td>${item.quantityToOrder} ${item.unit}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <strong>💡 Recommended Actions:</strong>
        <ul>
          <li>Contact your supplier for clarification: ${request.supplierEmail}</li>
          <li>Consider alternative suppliers</li>
          <li>Review and modify your order if needed</li>
          <li>Submit a new request with updated requirements</li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <p>This is an automated notification from AIMS Inventory Management System</p>
      <p>Login to your dashboard to take action</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Send restock request to supplier
export async function sendRestockRequestToSupplier(request: RestockRequest, approvalToken: string) {
  return await sendEmail({
    to: request.supplierEmail,
    subject: `Restock Request #${request.id} - Approval Required`,
    html: generateRestockRequestEmail(request, approvalToken),
  });
}

// Send approval confirmation to shopkeeper
export async function sendApprovalConfirmation(request: RestockRequest) {
  const shopkeeperEmail = process.env.SHOPKEEPER_EMAIL;
  if (!shopkeeperEmail) {
    return { success: false, error: 'Shopkeeper email not configured' };
  }

  return await sendEmail({
    to: shopkeeperEmail,
    subject: `✅ Order Approved - Request #${request.id}`,
    html: generateApprovalConfirmationEmail(request),
  });
}

// Send rejection notification to shopkeeper
export async function sendRejectionNotification(request: RestockRequest, reason?: string) {
  const shopkeeperEmail = process.env.SHOPKEEPER_EMAIL;
  if (!shopkeeperEmail) {
    return { success: false, error: 'Shopkeeper email not configured' };
  }

  return await sendEmail({
    to: shopkeeperEmail,
    subject: `❌ Order Declined - Request #${request.id}`,
    html: generateRejectionNotificationEmail(request, reason),
  });
}
