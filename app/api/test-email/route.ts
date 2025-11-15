import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/emailService';

export async function GET() {
  try {
    const result = await sendEmail({
      to: process.env.SHOPKEEPER_EMAIL || 'aryan62056@gmail.com',
      subject: '🧪 Test Email from AIMS - Confirmation',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Test Email Successful!</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9; margin-top: 20px;">
              <h2>Email System is Working!</h2>
              <p>This is a test confirmation email from your AIMS system.</p>
              <p><strong>To:</strong> ${process.env.SHOPKEEPER_EMAIL}</p>
              <p><strong>From:</strong> ${process.env.SMTP_FROM}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              
              <div style="background: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <strong>📧 If you received this:</strong>
                <ul>
                  <li>✅ SMTP is configured correctly</li>
                  <li>✅ Email delivery is working</li>
                  <li>✅ Approval confirmations should work too!</li>
                </ul>
              </div>

              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                If this email went to spam, please mark it as "Not Spam" to ensure future order confirmations reach your inbox.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? `Test email sent to ${process.env.SHOPKEEPER_EMAIL}! Check your inbox (and spam folder).`
        : `Failed to send test email: ${result.error}`,
      details: result,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
    }, { status: 500 });
  }
}
