# 🚀 100% Free Deployment Options (No Credit Card Required)

## ⭐ Option 1: Vercel + Supabase (RECOMMENDED - Completely Free Forever)

**Why**: Best free tier, no credit card, professional quality

### Step 1: Deploy Database on Supabase (Free Forever)

```bash
# 1. Go to https://supabase.com
# 2. Sign up with GitHub (free, no credit card)
# 3. Create new project: "nexus-quiz"
# 4. Wait for database to provision (~2 minutes)
# 5. Go to Settings → Database → Connection string
# 6. Copy "Connection string" in URI format
```

Your DATABASE_URL will look like:
```
postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

**Note**: Change Prisma schema from MySQL to PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"  // Changed from mysql
  url      = env("DATABASE_URL")
}
```

### Step 2: Deploy App on Vercel (Free Forever)

```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy to Vercel"
git push

# 2. Go to https://vercel.com
# 3. Sign up with GitHub (free, no credit card)
# 4. Click "Add New" → "Project"
# 5. Import your GitHub repo
# 6. Add environment variables:
```

**Environment Variables to Add**:
```
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
JWT_SECRET=your-random-32-char-secret
NODE_ENV=production
```

Generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```bash
# 7. Click "Deploy" ✅
```

### Step 3: Run Database Migrations

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Set DATABASE_URL locally for migration
$env:DATABASE_URL="your-supabase-connection-string"

# Push schema
npx prisma db push

# Seed database (optional)
npm run db:seed
```

✅ **Done!** Your app is live at `https://nexus-quiz.vercel.app`

**What You Get (100% Free)**:
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ 500 MB PostgreSQL database
- ✅ No credit card required
- ✅ Never expires

---

## ⭐ Option 2: Netlify + Supabase

Similar to Vercel but with Netlify:

```bash
# 1. Set up Supabase database (same as above)

# 2. Deploy to Netlify
npm install -g netlify-cli
netlify login
netlify init

# 3. Configure build settings:
# Build command: npm run build
# Publish directory: .next

# 4. Add environment variables in Netlify dashboard

# 5. Deploy
netlify deploy --prod
```

---

## ⭐ Option 3: Render (Free Tier)

**Note**: Free tier sleeps after 15 minutes of inactivity

```bash
# 1. Go to https://render.com
# 2. Sign up with GitHub (free)
# 3. Create "New PostgreSQL" database (free)
# 4. Create "New Web Service" from GitHub
# 5. Set build command: npm install && npx prisma generate && npm run build
# 6. Set start command: npx prisma migrate deploy && npm start
# 7. Add environment variables
# 8. Deploy
```

---

## ⭐ Option 4: Fly.io (Free Allowance)

```bash
# Install Fly CLI (Windows)
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Login
fly auth login

# Launch app
fly launch --name nexus-quiz

# Add PostgreSQL (free tier)
fly postgres create --name nexus-quiz-db

# Attach database
fly postgres attach nexus-quiz-db

# Set JWT secret
fly secrets set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Deploy
fly deploy
```

**Fly.io Free Tier**:
- 3 shared-cpu VMs
- 256 MB RAM each
- 3 GB persistent volume storage
- 160 GB outbound bandwidth

---

## 🎯 Recommended Setup: Vercel + Supabase

This is the **easiest and most reliable free option**:

### Quick Deploy (5 Minutes)

```bash
# 1. Update Prisma to PostgreSQL
# Edit prisma/schema.prisma:
# Change: provider = "mysql"
# To: provider = "postgresql"

# 2. Create Supabase account & database
# https://supabase.com → New project

# 3. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push

# 4. Deploy to Vercel
# https://vercel.com → Import from GitHub
# Add DATABASE_URL from Supabase
# Add JWT_SECRET (generate new random string)

# 5. Run migrations
npx prisma db push

# Done! 🎉
```

---

## 📋 Comparison of Free Options

| Platform | Database | Bandwidth | Sleep/Downtime | Best For |
|----------|----------|-----------|----------------|----------|
| **Vercel + Supabase** | 500 MB PostgreSQL | 100 GB/mo | ❌ Never | **Production** |
| Netlify + Supabase | 500 MB PostgreSQL | 100 GB/mo | ❌ Never | Production |
| Render | Included | 100 GB/mo | ✅ After 15 min | Dev/Testing |
| Fly.io | 3 GB PostgreSQL | 160 GB/mo | ❌ Never | Full-stack |

---

## 🔧 Switch from MySQL to PostgreSQL

Since most free tiers use PostgreSQL, update your schema:

```prisma
datasource db {
  provider = "postgresql"  // Changed from mysql
  url      = env("DATABASE_URL")
}
```

PostgreSQL is actually better for this app:
- ✅ Better JSON support
- ✅ More reliable with Prisma
- ✅ Better full-text search
- ✅ More free hosting options

---

## 🚀 Deploy Right Now (Recommended Path)

```bash
# Step 1: Update database to PostgreSQL (30 seconds)
# Edit prisma/schema.prisma

# Step 2: Sign up for Supabase (1 minute)
# https://supabase.com

# Step 3: Sign up for Vercel (1 minute)
# https://vercel.com

# Step 4: Connect & Deploy (2 minutes)
# Import GitHub repo → Add env vars → Deploy

# Total time: ~5 minutes
# Cost: $0 forever
```

---

## 💡 Why Vercel + Supabase is Best

1. **Zero Config**: Both platforms auto-detect and configure
2. **No Sleep**: App stays fast 24/7
3. **Professional**: Same stack used by companies
4. **Generous Limits**: More than enough for hobby projects
5. **Great DX**: Excellent dashboards and logs
6. **Forever Free**: Not a trial, actually free forever

---

## 🆘 Need Help?

If you want me to deploy it for you, just say:
- "Deploy to Vercel with Supabase"
- "Set up on Render"
- "Use Fly.io"

I'll walk you through each step! 🚀
