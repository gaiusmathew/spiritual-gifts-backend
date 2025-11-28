# 🚀 Deploy to Vercel - Quick Guide

## What I Fixed

✅ Updated `server.js` to work with Vercel serverless functions
✅ Added lazy database initialization (no startup errors)
✅ Updated `vercel.json` with proper configuration

## Your Connection Details

**Transaction Pooler URL** (use this!):
```
DATABASE_URL=postgresql://postgres.seuffajuxeittqxcqycw:qcF6r_E%24%23kkr%23Wd@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**Password URL-Encoded**:
- Original: `qcF6r_E$#kkr#Wd`
- Encoded: `qcF6r_E%24%23kkr%23Wd` ← Use this in the URL

## Deploy Steps (5 minutes)

### Step 1: Set Environment Variables in Vercel

1. Go to: https://vercel.com/dashboard
2. Click on your project: `spiritual-gifts-backend`
3. Go to **Settings** → **Environment Variables**
4. Add these TWO variables:

**Variable 1: DATABASE_URL**
```
Name: DATABASE_URL
Value: postgresql://postgres.seuffajuxeittqxcqycw:qcF6r_E%24%23kkr%23Wd@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
Environments: ✅ Production, ✅ Preview, ✅ Development
```

**Variable 2: JWT_SECRET**
```
Name: JWT_SECRET
Value: spiritual_gift
Environments: ✅ Production, ✅ Preview, ✅ Development
```

### Step 2: Commit & Push Updated Code

```bash
cd /Users/gmat11/Documents/Dev/spiritual-gifts/backend

# Stage the changes
git add server.js vercel.json

# Commit
git commit -m "Fix: Update server for Vercel serverless with Supabase pooler"

# Push to deploy
git push
```

OR if Vercel is already deployed, just redeploy from dashboard:
- Go to **Deployments** tab
- Click **⋯** on latest deployment
- Click **Redeploy**

### Step 3: Wait for Deployment

Vercel will automatically:
1. Build your app (30-60 seconds)
2. Deploy to production
3. Show you the live URL

### Step 4: Test It!

```bash
# Test health check
curl https://spiritual-gifts-backend.vercel.app/api/health

# Expected response:
# {"status":"ok","message":"Spiritual Gifts API is running"}

# Test login
curl -X POST https://spiritual-gifts-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@spiritualgifts.com"}'

# Should return token and user object
```

## What Changed in Code

### server.js
- ✅ Removed `startServer()` function that was causing crashes
- ✅ Added lazy initialization middleware
- ✅ Only listens on port in development (not production)
- ✅ Database initializes on first request, not at startup

### vercel.json
- ✅ Added `functions` configuration
- ✅ Set `maxDuration` to 10 seconds

## Why It Was Failing Before

**Problem**: Serverless functions don't have a persistent server
- Your old code tried to `listen()` on a port
- It ran database initialization at startup
- Vercel expects just an exported Express app

**Solution**: 
- Removed `startServer()` and `app.listen()`
- Added middleware that initializes DB on first request
- Exported app directly for Vercel

## Troubleshooting

### If deployment fails:

**Check 1: Environment Variables Set?**
```
Go to Settings → Environment Variables
Verify both DATABASE_URL and JWT_SECRET are there
```

**Check 2: Correct Connection String?**
```
Must use POOLER connection (port 6543)
Password must be URL-encoded (%24 for $, %23 for #)
```

**Check 3: Check Vercel Logs**
```
Go to Deployments → Click on deployment → Functions tab
Look for errors in the logs
```

### If it's slow on first request:

**This is normal!** Serverless "cold start"
- First request: 3-5 seconds (initializing DB)
- Subsequent requests: Fast (~100ms)
- After 5 minutes idle: Cold start again

## Visual Checklist

```
□ Set DATABASE_URL in Vercel
□ Set JWT_SECRET in Vercel  
□ Commit server.js changes
□ Push to trigger deployment
□ Wait for build to complete
□ Test /api/health endpoint
□ Test /api/auth/login endpoint
□ Update frontend API_URL if needed
```

## Frontend Update

If your frontend is also on Vercel, update the API URL:

**Environment Variable**:
```
Name: NEXT_PUBLIC_API_URL
Value: https://spiritual-gifts-backend.vercel.app/api
```

## Quick Commands

```bash
# Push changes
git add -A
git commit -m "Deploy with Supabase pooler"
git push

# Test after deployment
curl https://spiritual-gifts-backend.vercel.app/api/health
```

## Success Indicators

✅ Deployment shows "Ready" in Vercel dashboard
✅ Health check returns: `{"status":"ok",...}`
✅ Login endpoint returns token
✅ No 500 errors in function logs
✅ Questions endpoint works (with auth token)

---

## You're Ready! 

Just:
1. **Set the environment variables** in Vercel dashboard
2. **Push the code** (or redeploy)
3. **Test the endpoints**

Your backend will be live! 🚀

