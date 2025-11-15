# SMTP Email System Setup Guide for AIMS

This guide will help you set up the automated email system for sending restock requests to suppliers and receiving approval notifications.

## 📋 Table of Contents
1. [Overview](#overview)
2. [Gmail Setup (Recommended)](#gmail-setup)
3. [Environment Configuration](#environment-configuration)
4. [Installation](#installation)
5. [Testing the System](#testing-the-system)
6. [How It Works](#how-it-works)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The SMTP email system enables:
- **Automatic restock request emails** to suppliers
- **One-click approval/rejection** from email
- **Automatic confirmation emails** back to shopkeeper
- **Professional HTML email templates**

### Email Flow:
```
Shopkeeper Dashboard → Email to Supplier → Supplier Clicks Approve/Reject → Email back to Shopkeeper
```

---

## 📧 Gmail Setup (Recommended)

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left menu
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the steps to enable 2FA

### Step 2: Generate App Password

1. After enabling 2FA, go back to **Security**
2. Under "Signing in to Google", click **App passwords**
3. Click **Select app** → Choose "Mail"
4. Click **Select device** → Choose "Other (Custom name)"
5. Enter "AIMS Inventory System"
6. Click **Generate**
7. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)
8. Save this password - you'll use it in `.env.local`

### Step 3: Enable SMTP Access

Gmail SMTP is automatically enabled for all Gmail accounts. Use these settings:
- **SMTP Server**: smtp.gmail.com
- **Port**: 587 (TLS)
- **Username**: your-email@gmail.com
- **Password**: (App Password from Step 2)

---

## ⚙️ Environment Configuration

### Step 1: Copy the example file

```bash
cp .env.local.example .env.local
```

### Step 2: Update `.env.local` with your details

```env
# SMTP Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-actual-email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop  # App password from Gmail
SMTP_FROM=AIMS Inventory System <your-actual-email@gmail.com>

# Shopkeeper Configuration
SHOPKEEPER_EMAIL=your-store-email@gmail.com  # Where you receive confirmations
SHOPKEEPER_NAME=Your Store Name  # e.g., "Sharma Kirana Store"

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to your domain in production
```

### Step 3: Replace placeholder values

- **SMTP_USER**: Your Gmail address
- **SMTP_PASSWORD**: The 16-character app password (include spaces)
- **SHOPKEEPER_EMAIL**: Email where you want to receive approval/rejection notifications
- **SHOPKEEPER_NAME**: Your business name for email signatures

---

## 🚀 Installation

### Step 1: Install Dependencies

```bash
npm install nodemailer uuid
npm install --save-dev @types/nodemailer @types/uuid
```

Or if using yarn:
```bash
yarn add nodemailer uuid
yarn add -D @types/nodemailer @types/uuid
```

### Step 2: Restart the Development Server

```bash
npm run dev
```

---

## 🧪 Testing the System

### Test 1: Send Restock Request

1. Open your AIMS dashboard
2. Go to the **Supplier Orders** section
3. Select items to restock
4. Enter supplier details:
   - **Supplier Name**: Test Supplier
   - **Supplier Email**: your-test-email@gmail.com (use a real email you can check)
5. Click **Send to Supplier**
6. Check the supplier email inbox

### Test 2: Approve Order

1. Open the email sent to the supplier
2. Click the **✅ APPROVE ORDER** button
3. You should see a success page
4. Check the shopkeeper email (SHOPKEEPER_EMAIL) for confirmation

### Test 3: Reject Order

1. Send another test request
2. Click the **❌ REJECT ORDER** button
3. Check the shopkeeper email for rejection notification

### Expected Results:

✅ **Supplier receives**:
- Professional HTML email with order details
- Approve and Reject buttons
- Full item breakdown with prices

✅ **Shopkeeper receives** (after approval):
- Confirmation email with approved order
- Order details and timeline
- Next steps

✅ **Shopkeeper receives** (after rejection):
- Rejection notification
- Recommended actions

---

## 🔄 How It Works

### Architecture:

```
┌─────────────────┐
│   Dashboard     │
│  (Shopkeeper)   │
└────────┬────────┘
         │
         │ 1. Create Order
         ▼
┌─────────────────┐
│ /api/restock/   │
│      send       │◄─── Generates unique token
└────────┬────────┘
         │
         │ 2. Send Email
         ▼
┌─────────────────┐
│    Supplier     │
│     Email       │◄─── Approve/Reject buttons
└────────┬────────┘
         │
         │ 3. Click Button
         ▼
┌─────────────────┐
│ /api/supplier/  │
│ approve/reject  │◄─── Validates token
└────────┬────────┘
         │
         │ 4. Send Confirmation
         ▼
┌─────────────────┐
│  Shopkeeper     │
│     Email       │◄─── Final notification
└─────────────────┘
```

### API Endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/restock/send` | POST | Send restock request to supplier |
| `/api/supplier/approve` | GET | Handle supplier approval (from email) |
| `/api/supplier/reject` | GET | Handle supplier rejection (from email) |

### Request Flow:

1. **Dashboard → API** (`/api/restock/send`):
   ```json
   {
     "items": [...],
     "supplierEmail": "supplier@example.com",
     "supplierName": "ABC Suppliers"
   }
   ```

2. **API generates**:
   - Unique Request ID: `REQ-1699999999-ABC123`
   - Approval Token: `uuid-v4-token`
   - Approval URL: `http://localhost:3000/api/supplier/approve?token=...`

3. **Email sent to supplier** with approve/reject buttons

4. **Supplier clicks button** → Token validated → Email sent to shopkeeper

---

## 🐛 Troubleshooting

### Issue: "Authentication failed"

**Solution**: 
- Ensure 2FA is enabled on Gmail
- Regenerate App Password
- Include spaces in the password: `abcd efgh ijkl mnop`
- Check SMTP_USER is your full Gmail address

### Issue: "Connection timeout"

**Solution**:
- Check firewall settings (allow port 587)
- Verify SMTP_HOST is `smtp.gmail.com`
- Verify SMTP_PORT is `587`

### Issue: "Emails not received"

**Solution**:
- Check spam/junk folder
- Verify supplier email is correct
- Test with your own email first
- Check Gmail "Sent" folder to confirm email was sent

### Issue: "Token expired or invalid"

**Solution**:
- Tokens expire after 24 hours
- Each token can only be used once
- Request a new restock order

### Issue: "Module not found: nodemailer"

**Solution**:
```bash
npm install nodemailer uuid
npm install --save-dev @types/nodemailer @types/uuid
```

---

## 🎨 Email Templates

The system includes 3 professional HTML templates:

### 1. Restock Request (to Supplier)
- Company header
- Order summary table
- Approve/Reject buttons
- Contact information

### 2. Approval Confirmation (to Shopkeeper)
- Success message
- Approved order details
- Next steps
- Timeline

### 3. Rejection Notification (to Shopkeeper)
- Rejection notice
- Declined order details
- Recommended actions
- Alternative options

---

## 🔐 Security Best Practices

1. **Never commit `.env.local`** to git (already in .gitignore)
2. **Use App Passwords**, not your actual Gmail password
3. **Tokens expire** after 24 hours automatically
4. **One-time use tokens** - can't be reused after approval/rejection
5. **HTTPS in production** - Change `NEXT_PUBLIC_APP_URL` to `https://yourdomain.com`

---

## 📊 Production Deployment

### Vercel / Netlify:

1. Add environment variables in dashboard:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_FROM=AIMS Inventory <your-email@gmail.com>
   SHOPKEEPER_EMAIL=shopkeeper@yourstore.com
   SHOPKEEPER_NAME=Your Store Name
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

2. Redeploy the application

3. Test with real supplier emails

### Database Integration (Recommended for Production):

Replace in-memory storage with database:

```typescript
// Instead of:
const pendingRequests = new Map<string, RestockRequest>();

// Use Supabase:
await supabase.from('restock_requests').insert({
  id: requestId,
  token: approvalToken,
  items: restockRequest.items,
  status: 'pending',
  expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
});
```

---

## ✅ Checklist

Before going live:

- [ ] Gmail 2FA enabled
- [ ] App password generated
- [ ] `.env.local` configured with real values
- [ ] Dependencies installed (`npm install`)
- [ ] Test email sent and received
- [ ] Approval flow tested
- [ ] Rejection flow tested
- [ ] Production URL updated (`NEXT_PUBLIC_APP_URL`)
- [ ] Environment variables added to hosting platform
- [ ] Database integration (optional but recommended)

---

## 📞 Support

If you encounter issues:

1. Check the console logs in terminal
2. Verify all environment variables are set correctly
3. Test with Gmail's SMTP tester: https://www.gmass.co/smtp-test
4. Review the troubleshooting section above

---

**Next Steps**: Update the dashboard UI to include supplier email input and send request button! 🚀
