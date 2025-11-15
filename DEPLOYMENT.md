# AIMS Dashboard - Deployment Guide

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

Vercel is the creator of Next.js and offers the best deployment experience.

#### Steps:
1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "AIMS Dashboard MVP complete"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Deploy"
   - Done! Your app is live in ~2 minutes

3. **Automatic Deployments**
   - Every push to main automatically deploys
   - Preview deployments for pull requests
   - Rollback to any previous version instantly

---

### Option 2: Local Production Build

For running the production build locally or on your own server.

#### Steps:
1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

3. **Access the application**
   - Open http://localhost:3000

#### Production Optimizations Applied:
- ✅ Code minification
- ✅ Image optimization
- ✅ Automatic code splitting
- ✅ Static generation where possible
- ✅ Optimized CSS

---

### Option 3: Docker Container

For containerized deployment (Kubernetes, Docker Swarm, etc.)

#### Dockerfile
Create `Dockerfile` in the root:

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
```

#### Build and Run
```bash
# Build image
docker build -t aims-dashboard .

# Run container
docker run -p 3000:3000 aims-dashboard
```

---

### Option 4: Static Export (GitHub Pages, Netlify, etc.)

Note: Some features require server-side rendering, so this option has limitations.

#### Steps:
1. **Update next.config.ts**
   ```typescript
   const nextConfig = {
     output: 'export',
   }
   ```

2. **Build static files**
   ```bash
   npm run build
   ```

3. **Deploy the `out` folder** to any static hosting service

---

## 🔧 Environment Configuration

### Environment Variables (Future)

Create `.env.local` for environment-specific configuration:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/aims

# Vision Core Service
VISION_CORE_API_URL=http://vision-core-service:8000

# Analytics Engine
ANALYTICS_ENGINE_URL=http://analytics-engine:8001

# API Settings
API_TIMEOUT=30000
```

### Current MVP
No environment variables required - all mock data is included.

---

## 📊 Performance Optimization

### 1. Enable Compression
Already handled by Next.js production build.

### 2. Caching Strategy
```typescript
// In API routes, add caching headers
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
    },
  });
}
```

### 3. Database Connection Pooling (Future)
When integrating PostgreSQL, use connection pooling:
```typescript
import { Pool } from 'pg';
const pool = new Pool({ max: 20 });
```

---

## 🔒 Security Checklist

### Before Production Deployment:

- [ ] Add authentication (NextAuth.js recommended)
- [ ] Implement CORS restrictions
- [ ] Add rate limiting to API routes
- [ ] Validate all API inputs
- [ ] Use HTTPS only
- [ ] Add security headers
- [ ] Implement CSRF protection
- [ ] Sanitize user inputs
- [ ] Add API key authentication for external services
- [ ] Enable audit logging

### Security Headers
Add to `next.config.ts`:
```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
};
```

---

## 📈 Monitoring & Logging

### Recommended Tools:

1. **Vercel Analytics** (Free with Vercel)
   - Real User Monitoring (RUM)
   - Web Vitals tracking
   - Serverless function insights

2. **Sentry** (Error Tracking)
   ```bash
   npm install @sentry/nextjs
   ```

3. **Logging Service**
   - Winston for structured logging
   - CloudWatch, Datadog, or LogRocket

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy AIMS Dashboard

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm install
        
      - name: Lint
        run: npm run lint
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 🌐 Domain Setup

### Custom Domain (Vercel)
1. Go to Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. SSL certificate auto-generated

### DNS Configuration Example:
```
Type: CNAME
Name: aims
Value: cname.vercel-dns.com
```

---

## 📱 Mobile/PWA Setup (Future Enhancement)

### Progressive Web App
1. Create `public/manifest.json`
2. Add service worker
3. Enable offline mode
4. Add to home screen capability

---

## 🧪 Pre-Deployment Testing

### Checklist:
- [ ] Run `npm run build` successfully
- [ ] Test production build locally (`npm start`)
- [ ] Check all API endpoints
- [ ] Verify auto-refresh works
- [ ] Test approve/reject functionality
- [ ] Check responsive design on mobile
- [ ] Verify no console errors
- [ ] Test in multiple browsers
- [ ] Check loading states
- [ ] Verify error handling

---

## 🚨 Rollback Strategy

### Vercel
- Instant rollback to any previous deployment
- Click on deployment → Promote to Production

### Docker
```bash
# Tag versions
docker tag aims-dashboard:latest aims-dashboard:v1.0

# Rollback
docker run -p 3000:3000 aims-dashboard:v1.0
```

### Manual
- Keep backup of working `node_modules`
- Git tag releases: `git tag v1.0.0`
- Revert commits if needed

---

## 📊 Scalability Considerations

### Horizontal Scaling
- Deploy multiple instances behind load balancer
- Use serverless functions (Vercel/AWS Lambda)
- Implement Redis for session storage

### Vertical Scaling
- Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096`
- Optimize database queries
- Add database read replicas

### Database Scaling (Future)
- PostgreSQL with read replicas
- Connection pooling
- Query optimization
- Caching layer (Redis)

---

## 🎯 Production Checklist

### Pre-Launch:
- [ ] All features tested
- [ ] Security audit completed
- [ ] Performance optimization done
- [ ] Documentation updated
- [ ] Backup strategy in place
- [ ] Monitoring tools configured
- [ ] Error tracking enabled
- [ ] Analytics setup
- [ ] Domain configured
- [ ] SSL certificate active

### Post-Launch:
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Monitor server resources
- [ ] Check API response times
- [ ] Verify auto-refresh working
- [ ] Test approval workflow

---

## 📞 Support & Maintenance

### Regular Tasks:
- **Daily**: Monitor error logs
- **Weekly**: Review performance metrics
- **Monthly**: Security updates
- **Quarterly**: Dependency updates

### Update Commands:
```bash
# Check outdated packages
npm outdated

# Update dependencies
npm update

# Security audit
npm audit
npm audit fix
```

---

## 🎉 Quick Deploy Commands

### Vercel (Fastest)
```bash
npm install -g vercel
vercel login
vercel
```

### Local Production
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t aims-dashboard .
docker run -p 3000:3000 aims-dashboard
```

---

## 📝 Post-Deployment Verification

1. ✅ Visit deployed URL
2. ✅ Check all 2 SKUs load
3. ✅ Verify auto-refresh (wait 5 seconds)
4. ✅ Test approve button
5. ✅ Test reject button
6. ✅ Check mobile responsiveness
7. ✅ Verify no console errors
8. ✅ Test in different browsers

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Port Issues
```bash
# Change port
PORT=3001 npm start
```

### Memory Issues
```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

---

## 🎯 Production URLs (Examples)

- **Vercel**: https://aims-dashboard.vercel.app
- **Custom Domain**: https://aims.yourdomain.com
- **Local**: http://localhost:3000

---

**Ready to Deploy!** 🚀

Choose your deployment method and launch your AIMS Command Dashboard to the world!

**Team ERROR404** | Production Deployment Guide
