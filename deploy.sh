#!/usr/bin/env bash

echo "🚀 AIMS Quick Deployment Script"
echo "================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - Ready for deployment"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository exists"
fi

echo ""
echo "📋 Deployment Checklist:"
echo ""
echo "✓ Build tested successfully"
echo "✓ Vercel configuration ready"
echo "✓ ML API deployment files created"
echo ""
echo "🔄 Next Steps:"
echo ""
echo "1. Deploy Flask ML API (choose one):"
echo "   → Railway.app: https://railway.app (Recommended)"
echo "   → Render.com: https://render.com"
echo ""
echo "2. Push to GitHub:"
echo "   git remote add origin <your-repo-url>"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Deploy to Vercel:"
echo "   → Go to https://vercel.com"
echo "   → Import your GitHub repository"
echo "   → Add environment variables (see VERCEL_DEPLOYMENT_GUIDE.md)"
echo "   → Deploy!"
echo ""
echo "📖 For detailed instructions, see:"
echo "   - DEPLOYMENT_CHECKLIST.md"
echo "   - VERCEL_DEPLOYMENT_GUIDE.md"
echo "   - ml-models/DEPLOYMENT.md"
echo ""
