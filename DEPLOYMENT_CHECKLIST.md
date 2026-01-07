# Quick Deployment Checklist

## ✅ Pre-Deployment Tasks Completed

### Project Structure Updates
- [x] Created `vercel.json` for Vercel configuration
- [x] Created `.vercelignore` to exclude Python/ML files
- [x] Updated `next.config.ts` with production settings
- [x] Created ML API `requirements.txt`
- [x] Created `Procfile` for Railway/Render deployment
- [x] Updated Flask API for production (PORT, CORS, debug mode)

### Files Created
1. `vercel.json` - Vercel deployment configuration
2. `.vercelignore` - Exclude ML models from Vercel deploy
3. `VERCEL_DEPLOYMENT_GUIDE.md` - Complete deployment instructions
4. `ml-models/requirements.txt` - Python dependencies
5. `ml-models/Procfile` - Railway/Render start command
6. `ml-models/runtime.txt` - Python version specification
7. `ml-models/DEPLOYMENT.md` - ML API deployment guide

### Code Updates
- Updated `next.config.ts` with image optimization
- Updated `detection_api.py` for production (PORT handling, CORS)

## 📋 Next Steps (Manual)

### 1. Deploy Flask ML API (15 minutes)

Choose one platform:

#### Option A: Railway.app ⭐ Recommended
```bash
# No commands needed - use web interface:
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select repository
4. Set root directory: ml-models
5. Deploy → Copy URL
```

#### Option B: Render.com
```bash
1. Go to https://render.com
2. New Web Service
3. Connect GitHub repo
4. Root: ml-models
5. Build: pip install -r requirements.txt
6. Start: python detection_api.py
```

### 2. Deploy Next.js to Vercel (10 minutes)

```bash
# Push to GitHub first
git add .
git commit -m "Ready for Vercel deployment"
git push origin main

# Then deploy via Vercel dashboard:
1. Go to https://vercel.com
2. Import Project from GitHub
3. Configure environment variables (see guide)
4. Deploy
```

### 3. Environment Variables to Set in Vercel

Copy these from your `.env.local`:

**Required:**
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM
- SHOPKEEPER_EMAIL, SHOPKEEPER_NAME
- FLASK_API_URL (use Railway/Render URL)

**Optional:**
- HF_API_KEY
- ROBOFLOW_API_KEY, ROBOFLOW_MODEL, ROBOFLOW_VERSION

### 4. Post-Deployment Updates

After Vercel deployment:
```bash
# Update this variable with your actual Vercel URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

Then redeploy from Vercel dashboard.

### 5. Update Third-Party Services

**Clerk Dashboard:**
- Add Vercel URL to allowed origins
- Update redirect URLs

**Supabase Dashboard:**
- Add Vercel URL to Site URL
- Add to Redirect URLs

**Railway/Render (ML API):**
- Add environment variable: `ALLOWED_ORIGIN=https://your-app.vercel.app`

## 🎯 Expected Results

After deployment:
- ✅ Dashboard accessible at https://your-app.vercel.app
- ✅ Inventory management working
- ✅ Email notifications functional
- ✅ AI product detection operational (via Railway/Render)
- ⚠️ WebSocket fallback to polling (Vercel limitation)

## 📊 Deployment Timeline

1. **Flask ML API** (Railway/Render): ~10-15 mins
2. **Next.js App** (Vercel): ~5-10 mins
3. **Environment Variables**: ~5 mins
4. **Third-party Updates**: ~5 mins
5. **Testing**: ~10 mins

**Total: ~35-45 minutes**

## 🆘 Common Issues

### Build fails on Vercel
```bash
# Run locally first to check for errors:
npm run build

# Check build output for TypeScript errors
```

### ML API not responding
```bash
# Test the API:
curl https://your-ml-api.railway.app/

# Should return: {"status": "ok", ...}
```

### Email not sending
- Check SMTP credentials in Vercel env vars
- Verify Gmail app password is correct
- Check function logs in Vercel dashboard

## 📚 Full Documentation

See `VERCEL_DEPLOYMENT_GUIDE.md` for detailed instructions.
