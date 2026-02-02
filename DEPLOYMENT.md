# Free Deployment Guide for Nexus Quiz

## 🚀 Quick Start - Two Free Deployment Options

### Option 1: Vercel + PlanetScale (Recommended - Easiest)

**Cost**: 100% FREE  
**Time**: 10-15 minutes  
**Best for**: Hobby projects, portfolios, MVPs

#### Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- PlanetScale account (sign up at planetscale.com)

#### Step 1: Set up PlanetScale Database (Free MySQL)

```bash
# Install PlanetScale CLI (optional but recommended)
# Windows: Use scoop
scoop bucket add pscale https://github.com/planetscale/scoop-bucket
scoop install pscale mysql

# Or use the web dashboard at app.planetscale.com
```

**Via Dashboard** (easier):
1. Go to https://app.planetscale.com
2. Create new database: `nexus-quiz`
3. Select region closest to you
4. Click "Create database"
5. Go to "Connect" → Select "Prisma" 
6. Copy the `DATABASE_URL` connection string

**Free Tier Includes**:
- 5 GB storage
- 1 billion row reads/month
- 10 million row writes/month
- 1 production branch + 1 development branch

#### Step 2: Update Prisma Schema for PlanetScale

PlanetScale doesn't support foreign key constraints (uses referential integrity at app level):

```bash
# Update prisma/schema.prisma datasource
```

Add to your schema.prisma:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"  // Add this line for PlanetScale
}
```

#### Step 3: Push to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### Step 4: Deploy to Vercel

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Vercel auto-detects Next.js configuration
5. Add environment variables:
   - `DATABASE_URL`: (from PlanetScale)
   - `JWT_SECRET`: (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `GOOGLE_AI_API_KEY`: (your Google AI API key)
   - `NODE_ENV`: `production`
6. Click "Deploy"

#### Step 5: Run Database Migrations

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Push Prisma schema to PlanetScale
npx prisma db push

# (Optional) Seed database
npx prisma db seed
```

**Or use PlanetScale CLI**:
```bash
pscale connect nexus-quiz main --port 3309
# In another terminal:
DATABASE_URL="mysql://root@127.0.0.1:3309/nexus-quiz" npx prisma db push
```

✅ **Done!** Your app is live at `https://nexus-quiz-yourusername.vercel.app`

**Vercel Free Tier Includes**:
- Unlimited deployments
- Automatic HTTPS
- 100 GB bandwidth/month
- Automatic CI/CD
- Preview deployments for PRs
- Serverless functions

---

### Option 2: Railway (Free Trial - All-in-One)

**Cost**: FREE for 500 hours/month ($5 credit)  
**Time**: 15-20 minutes  
**Best for**: Full-stack apps with database

#### Step 1: Set up Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init
```

#### Step 2: Add MySQL Database

```bash
# In your project directory
railway add --database mysql

# This creates a MySQL database and sets DATABASE_URL automatically
```

#### Step 3: Configure Environment Variables

Create `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

Set environment variables:
```bash
railway variables set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
railway variables set NODE_ENV=production
railway variables set GOOGLE_AI_API_KEY=your_key_here
```

#### Step 4: Deploy

```bash
# Deploy to Railway
railway up

# Run migrations
railway run npx prisma migrate deploy

# (Optional) Seed database  
railway run npm run db:seed
```

✅ **Done!** Railway provides a URL like `https://nexus-quiz.up.railway.app`

**Railway Free Tier**:
- $5 credit/month (~500 execution hours)
- Includes database hosting
- Auto-scaling
- Metrics & logs

---

### Option 3: Render (Free Tier - Simpler Alternative)

**Cost**: FREE (with limitations)  
**Best for**: Low-traffic apps

1. Go to https://render.com
2. Create "New Web Service" from GitHub
3. Add "New PostgreSQL" database (free tier) OR connect to external MySQL
4. Set build command: `npm install && npx prisma generate && npm run build`
5. Set start command: `npx prisma migrate deploy && npm start`
6. Add environment variables
7. Deploy

**Render Free Tier**:
- Web service sleeps after 15 min inactivity
- 750 hours/month
- Free PostgreSQL database (90 days, then paid)

---

## 🔧 Required Configuration Changes

### 1. Enable Next.js Standalone Output

Update [next.config.js](next.config.js):

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // Add this line for Docker/containerized deployments
  eslint: { ignoreDuringBuilds: true },
  // ... rest of config
}
```

### 2. Update Prisma Schema (for PlanetScale)

Update [prisma/schema.prisma](prisma/schema.prisma):

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"  // Required for PlanetScale
}
```

### 3. Create Environment Variables Template

Create `.env.example`:
```env
# Database
DATABASE_URL="mysql://user:password@host:3306/database"

# Auth
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# AI (Optional)
GOOGLE_AI_API_KEY="your-google-ai-api-key"

# Next.js
NEXT_PUBLIC_API_URL="https://your-app.vercel.app"
NODE_ENV="production"
```

---

## 📊 Comparison Table

| Feature | Vercel + PlanetScale | Railway | Render |
|---------|---------------------|---------|--------|
| **Cost** | 100% Free | $5 credit/mo | Free (limits) |
| **Database** | 5GB MySQL | Included | 90 days free |
| **Bandwidth** | 100GB/mo | Unlimited | 100GB/mo |
| **Cold Starts** | None | None | 15-30 seconds |
| **Custom Domain** | ✅ Free | ✅ Free | ✅ Free |
| **Auto-deploys** | ✅ | ✅ | ✅ |
| **Best For** | Production-ready | Full-stack apps | Side projects |

---

## 🎯 Recommended: Vercel + PlanetScale

This combination gives you:
- ✅ **Unlimited** Next.js deployments
- ✅ **5GB** database storage
- ✅ **Global CDN** for static assets
- ✅ **Automatic HTTPS** & certificates
- ✅ **No cold starts** - always fast
- ✅ **Preview deployments** for PRs
- ✅ **Professional** for hobby projects

---

## 🚦 Quick Deploy Commands

```bash
# 1. Update Next.js config for standalone build
# (Add output: 'standalone' to next.config.js)

# 2. Update Prisma for PlanetScale
# (Add relationMode: "prisma" to schema.prisma)

# 3. Commit changes
git add .
git commit -m "Configure for free deployment"
git push

# 4. Deploy to Vercel (via dashboard or CLI)
npx vercel --prod

# 5. Set up database
npx prisma db push

# 6. Done! 🎉
```

---

## 🔐 Security Checklist

- [ ] Never commit `.env` files (add to `.gitignore`)
- [ ] Use strong JWT_SECRET (32+ random characters)
- [ ] Enable CORS properly in production
- [ ] Use environment variables in Vercel/Railway dashboard
- [ ] Enable 2FA on Vercel/PlanetScale accounts
- [ ] Review PlanetScale connection string security

---

## 📝 Post-Deployment

After deployment:
1. Test all features (login, quiz, leaderboard)
2. Monitor logs in Vercel/Railway dashboard
3. Set up custom domain (optional)
4. Configure analytics (Vercel Analytics is free)
5. Enable Web Vitals monitoring

---

## 🆘 Troubleshooting

**Database connection fails:**
```bash
# Verify DATABASE_URL format
# PlanetScale: mysql://user:pass@aws.connect.psdb.cloud/db?sslaccept=strict
```

**Build fails:**
```bash
# Clear cache and rebuild
vercel --force
```

**Prisma errors:**
```bash
# Regenerate client
npx prisma generate
```

---

## 💡 Upgrade Path

When you outgrow free tier:
- **Vercel Pro**: $20/mo (more bandwidth, team features)
- **PlanetScale Scaler**: $29/mo (10GB, more connections)
- **Railway**: Pay-as-you-go beyond free credit

But for most hobby/portfolio projects, **free tier is sufficient**! 🎉
