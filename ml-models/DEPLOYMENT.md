# Deploying Flask ML API to Railway

## Quick Deploy to Railway.app

### 1. Create `Procfile`
```
web: python detection_api.py
```

### 2. Update `detection_api.py` for Production

Add this at the bottom of the file:
```python
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
```

### 3. Deploy Steps

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Click "Add variables":
   - No special env vars needed for basic deployment

6. **Important**: Set Root Directory
   - Go to Settings → Service
   - Set "Root Directory" to `ml-models`
   - Or create a separate repo for just the ML API

7. Click "Deploy"
8. Copy your deployment URL (e.g., `https://aims-ml-api.up.railway.app`)

### 4. Update Vercel Environment Variables

In your Vercel dashboard:
```
FLASK_API_URL=https://your-app.up.railway.app
```

### 5. Test the API

```bash
curl https://your-app.up.railway.app/
```

Should return: `{"status": "ok", "message": "AIMS Detection API"}`

## Alternative: Render.com

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Configure:
   - **Name**: aims-ml-api
   - **Root Directory**: `ml-models`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python detection_api.py`
5. Deploy

## Alternative: Google Cloud Run

```bash
# From ml-models directory
gcloud run deploy aims-ml-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Troubleshooting

### Build Fails
- Check `requirements.txt` has all dependencies
- Verify Python version (3.11+ recommended)
- Check build logs in Railway/Render dashboard

### API Returns 500
- Check application logs
- Verify model files are included
- Check memory limits (increase if needed)

### CORS Issues
Make sure Flask app has:
```python
from flask_cors import CORS
CORS(app, resources={r"/*": {"origins": "*"}})
```

Or specific origins:
```python
CORS(app, resources={r"/*": {"origins": ["https://your-app.vercel.app"]}})
```
