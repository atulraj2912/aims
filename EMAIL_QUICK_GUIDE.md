# Email System Quick Guide

## ✅ System is Configured!

Your SMTP email system is now fully integrated and ready to use.

### 📧 How It Works:

**TWO WAYS to send restock emails:**

#### 1. From Notification Panel (Low Stock Alert):
```
Dashboard → Click "Order from Supplier" in notification → Select items → Approve
→ Emails sent automatically to suppliers
```

#### 2. From Stock Optimization:
```
Dashboard → "Order Optimized Stock" → Review items → "Send Orders" button
→ Emails sent automatically to suppliers
```

---

## 📝 Email Flow:

```
You click "Send Orders" / "Approve"
         ↓
System groups items by supplier category
         ↓
Sends HTML email to each supplier with:
  • Order details
  • Item list with quantities
  • Approve/Reject buttons
         ↓
Supplier clicks Approve or Reject in email
         ↓
You receive confirmation at: aryan62056@gmail.com
```

---

## ⚙️ Supplier Email Configuration:

**To update supplier email addresses:**

Edit the file: `d:\aims\lib\supplierConfig.ts`

```typescript
export const supplierContacts: Record<string, SupplierContact> = {
  'Fresh Produce Co.': {
    email: 'produce@supplier.com', // ← Change this
    categories: ['Fruit']
  },
  'Green Valley Farms': {
    email: 'orders@greenvalley.com', // ← Change this
    categories: ['Vegetable']
  },
  // ... etc
}
```

**Current Supplier Mapping:**
- **Fruit** → Fresh Produce Co. (produce@supplier.com)
- **Vegetable** → Green Valley Farms (orders@greenvalley.com)
- **Dairy** → Dairy Direct Ltd. (sales@dairydirect.com)
- **Everything else** → General Supplies Inc. (orders@generalsupplies.com)

---

## 🧪 Testing the System:

### Test 1: Low Stock Notification
1. Go to dashboard
2. Look for notification panel (top right)
3. Click "Order from Supplier" button
4. Select items and click "Approve"
5. Check that success message appears
6. Check supplier email inbox for the restock request

### Test 2: Stock Optimization Orders
1. Go to dashboard
2. Scroll to "Stock Optimization" section
3. Click "Order Optimized Stock"
4. Review items and click "Send Orders"
5. Check that success message appears
6. Check supplier email inbox

### Test 3: Supplier Approval
1. Open the email sent to supplier
2. Click "✅ APPROVE ORDER" button
3. Check your shopkeeper email (aryan62056@gmail.com)
4. You should receive confirmation

### Test 4: Supplier Rejection
1. Send another test order
2. Click "❌ REJECT ORDER" button
3. Check your shopkeeper email for rejection notice

---

## 🔧 Troubleshooting:

**Emails not sending?**
- Check terminal/console for errors
- Verify `.env.local` has correct Gmail credentials
- Make sure app password is correct (spaces included)
- Check if dev server is running (`npm run dev`)

**Supplier not receiving emails?**
- Check spam/junk folder
- Verify supplier email in `lib/supplierConfig.ts`
- Test with your own email first

**Not receiving confirmation emails?**
- Check `SHOPKEEPER_EMAIL` in `.env.local`
- Verify it's set to: aryan62056@gmail.com
- Check spam folder

---

## 📊 Current Configuration:

**Sender:** araj29122004@gmail.com (Error404 Store)
**Shopkeeper:** aryan62056@gmail.com
**SMTP:** Gmail (smtp.gmail.com:587)
**Status:** ✅ Ready to use

---

## 🚀 Next Steps:

1. **Update supplier emails** in `lib/supplierConfig.ts` with real addresses
2. **Test the system** by sending a test order
3. **Check both email flows** (notification + stock optimization)
4. **Verify approvals work** by clicking buttons in emails

---

## 💡 Pro Tips:

- Use your own email as supplier email for testing first
- The system automatically groups items by category/supplier
- Each supplier gets ONE email with all their items
- Tokens expire after 24 hours
- Each approve/reject link works only once

---

**Need Help?**
- Check `EMAIL_SETUP_GUIDE.md` for detailed instructions
- Review console logs for error messages
- Verify all environment variables are set correctly
