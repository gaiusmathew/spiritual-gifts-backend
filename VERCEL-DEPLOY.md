# Deploy Backend to Vercel - Quick Guide

## ⚠️ Important: SQLite Limitation

Vercel's serverless functions **do not support SQLite** because:
- No persistent file system
- Each request runs in isolation
- Database would reset on every request

## Two Options for Vercel

### Option 1: Keep SQLite → Use Railway/Render Instead ✅ (Recommended)

This is the easiest option with NO code changes needed!

**Deploy to Railway:**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy (from backend folder)
cd backend
railway init
railway up

# Set environment variables
railway variables set JWT_SECRET=your_secure_secret_key
railway variables set NODE_ENV=production

# Done! Your API is live with SQLite working perfectly
```

**Railway Benefits:**
- ✅ SQLite works out of the box
- ✅ Persistent file system
- ✅ Free tier available
- ✅ No code changes
- ✅ Easy deployment

---

### Option 2: Migrate to PostgreSQL → Use Vercel Postgres

If you want to use Vercel, you need to switch from SQLite to PostgreSQL.

#### Step 1: Create Vercel Postgres Database

1. Go to Vercel Dashboard
2. Navigate to Storage
3. Create Postgres Database
4. Copy connection details

#### Step 2: Install PostgreSQL

```bash
cd backend
npm install pg
npm uninstall sqlite3
```

#### Step 3: Update Database Code

You'll need to modify:
- `database/init.js` - Use `pg` instead of `sqlite3`
- All SQL queries - PostgreSQL syntax differs slightly
- Connection string instead of file path

#### Step 4: Deploy to Vercel

```bash
vercel login
vercel

# Set environment variables in Vercel Dashboard:
# - JWT_SECRET
# - DATABASE_URL (from Vercel Postgres)
```

---

## Recommended: Use Railway

Since your app already uses SQLite perfectly, I **strongly recommend Railway**:

### Quick Railway Deployment

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Initialize project (from backend folder)
cd backend
railway init

# 4. Deploy
railway up

# 5. Set environment variables
railway variables set JWT_SECRET=your_secure_secret_key_here
railway variables set NODE_ENV=production

# 6. Your API is live!
# Railway will give you a URL like: https://your-app.up.railway.app
```

### Update Frontend

```env
# frontend/.env
NEXT_PUBLIC_API_URL=https://your-app.up.railway.app/api
```

---

## Vercel Configuration Files

I've created these files for Vercel compatibility:
- ✅ `vercel.json` - Vercel configuration
- ✅ `.vercelignore` - Files to ignore
- ✅ `server.js` - Exports app for Vercel

**But remember:** These will only work if you migrate to PostgreSQL!

---

## Deploy Frontend to Vercel

The frontend works great on Vercel! (No database issues)

```bash
cd frontend

# Deploy to Vercel
vercel

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL

# Enter your backend URL (from Railway)
https://your-backend.up.railway.app/api
```

---

## Complete Deployment Strategy

**Best Setup:**
- 🚀 **Backend**: Railway (supports SQLite)
- 🌐 **Frontend**: Vercel (perfect for Next.js)

**Steps:**
1. Deploy backend to Railway
2. Get backend URL
3. Deploy frontend to Vercel
4. Set NEXT_PUBLIC_API_URL to Railway URL
5. Done! ✅

---

## Cost Comparison

| Platform | Free Tier | SQLite Support | Ease |
|----------|-----------|----------------|------|
| **Railway** | 500 hrs/month | ✅ Yes | ⭐⭐⭐⭐⭐ |
| **Render** | 750 hrs/month | ✅ Yes | ⭐⭐⭐⭐ |
| **Vercel** | Unlimited | ❌ No (need Postgres) | ⭐⭐⭐ |

---

## Environment Variables

### Backend (Railway/Render)
```env
PORT=5000
JWT_SECRET=your_secure_secret_minimum_32_characters_long
NODE_ENV=production
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
```

---

## Quick Start Commands

### Deploy Backend to Railway
```bash
cd backend
railway login
railway init
railway up
railway variables set JWT_SECRET=your_secret_key
railway open  # Open in browser to see URL
```

### Deploy Frontend to Vercel
```bash
cd frontend
vercel login
vercel
# Follow prompts, set environment variable
```

---

## Vercel Files Included

✅ `vercel.json` - Configuration for Vercel deployment  
✅ `.vercelignore` - Files to exclude from deployment  
✅ `server.js` - Updated to export app for Vercel  
✅ `VERCEL-DEPLOY.md` - This guide  
✅ `DEPLOYMENT.md` - General deployment guide  

---

## My Recommendation

**Use Railway for backend** because:
1. No code changes needed
2. SQLite works perfectly
3. Persistent storage
4. Easy deployment
5. Free tier is generous
6. Better for this use case

**Use Vercel for frontend** because:
1. Next.js deploys perfectly
2. Automatic HTTPS
3. Global CDN
4. Great performance
5. Easy environment variables

**Total setup time: ~10 minutes!** 🚀

---

## Need Help?

- Railway: https://railway.app/
- Vercel: https://vercel.com/
- Render: https://render.com/

Choose Railway for the fastest, easiest deployment with zero code changes! ✨

