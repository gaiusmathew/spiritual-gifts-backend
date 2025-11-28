# Backend Deployment Guide - Vercel

This guide will help you deploy the Spiritual Gifts API to Vercel.

## Prerequisites

- Vercel account (free): https://vercel.com/signup
- Vercel CLI installed (optional): `npm i -g vercel`

## Important: SQLite Limitation on Vercel

⚠️ **Vercel's serverless environment does NOT support SQLite** because:
- Serverless functions are stateless
- No persistent file system
- Each request runs in a new container

### Recommended Solutions:

#### **Option 1: Use Vercel Postgres (Recommended)**
Free tier available, fully managed PostgreSQL database.

#### **Option 2: Use PlanetScale (MySQL)**
Free tier, serverless MySQL database.

#### **Option 3: Use MongoDB Atlas**
Free tier, NoSQL database.

#### **Option 4: Use Railway or Render**
These platforms support SQLite and are better for this app.

## Quick Deployment to Vercel (With Database Change)

Since this app uses SQLite, I recommend deploying to **Railway** or **Render** instead, which support SQLite better.

### Alternative: Deploy to Railway (Recommended)

Railway supports SQLite and is perfect for this app!

1. **Install Railway CLI:**
```bash
npm i -g @railway/cli
```

2. **Login to Railway:**
```bash
railway login
```

3. **Initialize project:**
```bash
cd backend
railway init
```

4. **Deploy:**
```bash
railway up
```

5. **Set environment variables:**
```bash
railway variables set JWT_SECRET=your_secure_secret_key
railway variables set NODE_ENV=production
```

6. **Your API will be live!**

## Alternative: Deploy to Render

Render also supports SQLite and has a free tier.

1. Go to https://render.com
2. Connect your GitHub repository
3. Create new Web Service
4. Select the `backend` directory
5. Set build command: `npm install`
6. Set start command: `npm start`
7. Add environment variables:
   - `JWT_SECRET`: Your secret key
   - `NODE_ENV`: production
8. Deploy!

## If You Still Want Vercel (Need to Migrate to PostgreSQL)

### Step 1: Install PostgreSQL package

```bash
npm install pg
```

### Step 2: Create Vercel Postgres Database

1. Go to Vercel Dashboard
2. Create new Postgres database
3. Copy connection string

### Step 3: Update database code

You'll need to replace SQLite code with PostgreSQL queries.

### Step 4: Deploy to Vercel

```bash
vercel login
vercel
```

## Environment Variables for Production

Set these in your deployment platform:

```env
PORT=5000
JWT_SECRET=your_very_secure_random_string_at_least_32_characters_long
NODE_ENV=production
DATABASE_URL=your_database_connection_string_if_using_postgres
```

## Deployment Checklist

- [ ] Choose deployment platform (Railway/Render recommended)
- [ ] Set environment variables
- [ ] Test API health endpoint
- [ ] Create default admin user
- [ ] Test authentication endpoints
- [ ] Update frontend NEXT_PUBLIC_API_URL
- [ ] Test quiz submission
- [ ] Verify database persistence

## Recommended: Use Railway

**Why Railway?**
- ✅ Supports SQLite out of the box
- ✅ Persistent file system
- ✅ Free tier available
- ✅ Easy deployment
- ✅ Automatic HTTPS
- ✅ No code changes needed

**Deployment URL will be:**
```
https://your-app.railway.app/api
```

## Update Frontend After Deployment

Update `frontend/.env`:
```env
NEXT_PUBLIC_API_URL=https://your-api-url.railway.app/api
```

## Testing Production Deployment

```bash
# Health check
curl https://your-api-url/api/health

# Login
curl -X POST https://your-api-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@spiritualgifts.com"}'
```

## Need Help?

- Railway docs: https://docs.railway.app/
- Render docs: https://render.com/docs
- Vercel docs: https://vercel.com/docs

## Summary

**Best Options for This App:**
1. 🥇 **Railway** - Easiest, supports SQLite
2. 🥈 **Render** - Good free tier, supports SQLite  
3. 🥉 **Vercel** - Requires database migration to PostgreSQL

I recommend Railway for the quickest deployment with no code changes! 🚀

