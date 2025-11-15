# Google Cloud Vision API Setup Guide

## Step 1: Create Google Cloud Project (5 minutes)

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click "Select a project" dropdown (top left)
   - Click "NEW PROJECT"
   - Name: `aims-inventory-system`
   - Click "CREATE"

3. **Enable Vision API**
   - In search bar, type "Vision API"
   - Click "Cloud Vision API"
   - Click "ENABLE"
   - Wait ~30 seconds for activation

4. **Enable Billing (Required for API)**
   - Click "Billing" in left menu
   - Link a billing account (you get $300 free credits for 90 days!)
   - Free tier: 1,000 Vision API requests/month forever

## Step 2: Create API Credentials

1. **Create Service Account**
   - Search for "Credentials" in top search
   - Click "CREATE CREDENTIALS" → "Service account"
   - Name: `aims-vision-service`
   - Click "CREATE AND CONTINUE"
   - Role: Select "Owner" or "Cloud Vision API User"
   - Click "DONE"

2. **Generate JSON Key**
   - Click on the service account you just created
   - Go to "KEYS" tab
   - Click "ADD KEY" → "Create new key"
   - Select "JSON"
   - Click "CREATE"
   - **IMPORTANT**: A JSON file will download - save it as `google-vision-key.json`

3. **Move JSON Key to Project**
   - Create folder: `d:\aims\credentials\`
   - Move `google-vision-key.json` to `d:\aims\credentials\google-vision-key.json`

## Step 3: Install Dependencies

Run in terminal:
```bash
npm install @google-cloud/vision
```

## Step 4: Configure Environment Variables

Add to your `.env.local` file:
```env
# Google Cloud Vision API
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-vision-key.json
GOOGLE_CLOUD_PROJECT_ID=aims-inventory-system
```

## Step 5: Test the API

The API endpoint is already created at `/api/vision/detect`
Just upload an image and it will:
- Detect all objects in the image
- Extract text (SKU, prices, product names)
- Return product matches from your inventory
- Show bounding boxes and confidence scores

## Free Tier Limits

✅ **1,000 requests/month FREE forever**
✅ First 1,000 units/month: Free
✅ Next 5,000,000 units: $1.50 per 1,000
✅ Your use case: ~100-200 scans/month = FREE

## Security Notes

⚠️ **NEVER commit `google-vision-key.json` to git**
Already added to `.gitignore`

## Troubleshooting

**Error: "Could not load the default credentials"**
- Solution: Make sure `GOOGLE_APPLICATION_CREDENTIALS` path is correct
- Check that `google-vision-key.json` exists in `credentials/` folder

**Error: "Vision API has not been used"**
- Solution: Wait 2-3 minutes after enabling the API
- Try again

**Error: "Billing account required"**
- Solution: Enable billing in Google Cloud Console
- You still get 1,000 free requests/month

## Ready to Use!

Once setup is complete, just:
1. Click "📹 Scan" button in your dashboard
2. Upload a product image
3. Vision API will detect products automatically
4. Results appear instantly!
