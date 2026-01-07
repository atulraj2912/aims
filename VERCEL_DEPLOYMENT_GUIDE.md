# Vercel Deployment Guide for AIMS

## 🚀 Pre-Deployment Checklist

### 1. External ML API Setup (CRITICAL)
Since Vercel doesn't support Python/Flask, you need to deploy the ML API separately:

#### Option A: Railway.app (Recommended)
1. Go to [Railway.app](https://railway.app)
2. Create new project → Deploy from GitHub
3. Select `ml-models` folder
4. Add `requirements.txt` for dependencies
5. Set start command: `python detection_api.py`
6. Copy the deployed URL (e.g., `https://your-app.railway.app`)

#### Option B: Render.com
1. Go to [Render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Root directory: `ml-models`
5. Build command: `pip install -r requirements.txt`
6. Start command: `python detection_api.py`
7. Copy the deployed URL

#### Option C: Google Cloud Run / AWS Lambda
Deploy the Flask API as a containerized service.

### 2. Disable WebSocket (Vercel Limitation)
Vercel doesn't support WebSockets. The app already falls back gracefully, but you can:
- Use Vercel's Edge functions for real-time features
- Or deploy a separate WebSocket server on Railway/Render

## 📦 Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Framework: **Next.js** (auto-detected)
5. Root Directory: `./` (leave default)

### Step 3: Configure Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

#### Supabase (Required)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

#### Clerk Authentication (Required)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
```

#### Email Configuration (Required)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password_here
SMTP_FROM=Your Store <your_email@gmail.com>
SHOPKEEPER_EMAIL=shopkeeper@email.com
SHOPKEEPER_NAME=Your Store Name
```

#### ML APIs (Required)
```
FLASK_API_URL=https://your-flask-api.railway.app
HF_API_KEY=your_huggingface_api_key_here
ROBOFLOW_API_KEY=your_roboflow_api_key_here
ROBOFLOW_MODEL=your_model_name
ROBOFLOW_VERSION=3
```

#### App URL (Will be auto-generated)
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```
*Note: Update this after first deployment with your actual Vercel URL*

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Copy your production URL (e.g., `https://aims.vercel.app`)

### Step 5: Post-Deployment Updates
1. Go back to Environment Variables
2. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
3. Redeploy (Deployments → ⋯ → Redeploy)

## ⚙️ Configuration Updates Needed

### Update Clerk Allowed Origins
1. Go to Clerk Dashboard
2. Settings → Allowed Origins
3. Add your Vercel URL: `https://your-app.vercel.app`

### Update Supabase Allowed Origins
1. Go to Supabase Dashboard
2. Authentication → URL Configuration
3. Add Site URL: `https://your-app.vercel.app`
4. Add Redirect URLs: `https://your-app.vercel.app/*`

## 🔍 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Ensure TypeScript compiles locally: `npm run build`

### API Routes 500 Error
- Check environment variables are set
- Verify Supabase connection
- Check function logs in Vercel dashboard

### ML Detection Not Working
- Verify `FLASK_API_URL` points to your deployed Flask API
- Check Flask API is running: `curl https://your-flask-api.railway.app/`
- Add CORS headers in Flask API for Vercel domain

### Email Not Sending
- Verify SMTP credentials
- Check Gmail "Less secure app access" or use App Password
- Review function logs for detailed errors

## 📊 Features Status on Vercel

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard | ✅ Works | Full functionality |
| Inventory API | ✅ Works | Via Supabase |
| Replenishment | ✅ Works | Serverless functions |
| Email System | ✅ Works | Via Nodemailer |
| AI Detection | ⚠️ External | Requires separate Flask deployment |
| WebSocket | ❌ Limited | Falls back to polling |
| Real-time Updates | ⚠️ Polling | 60-second intervals |

## 🎯 Production Recommendations

1. **CDN & Performance**
   - Vercel automatically handles this
   - Images are optimized with Next.js Image component

2. **Security**
   - All API keys in environment variables ✅
   - No secrets in code ✅
   - HTTPS by default ✅

3. **Monitoring**
   - Use Vercel Analytics (built-in)
   - Set up Sentry for error tracking (optional)

4. **Database**
   - Ensure Supabase is on paid plan for production
   - Set up connection pooling

5. **Email Deliverability**
   - Consider SendGrid/Mailgun for production
   - Current Gmail setup works but has limits

## 🔄 CI/CD Pipeline

Vercel automatically:
- Deploys on every push to `main` branch
- Creates preview deployments for PRs
- Runs build checks before deployment

To customize:
1. Create `.github/workflows/vercel.yml` for GitHub Actions
2. Or use Vercel's built-in Git integration (recommended)

## 📝 Next Steps After Deployment

1. ✅ Test all features on production URL
2. ✅ Update email templates with production URL
3. ✅ Test supplier approval workflow end-to-end
4. ✅ Verify AI detection with deployed Flask API
5. ✅ Monitor error logs for first 24 hours
6. ✅ Set up custom domain (optional)

## 🆘 Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Supabase with Vercel](https://supabase.com/docs/guides/hosting/vercel)
- [Clerk with Vercel](https://clerk.com/docs/deployments/deploy-to-vercel)
