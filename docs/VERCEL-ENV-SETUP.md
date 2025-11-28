# Vercel Environment Variables Setup

## Required Environment Variables

You need to set these in your Vercel project settings:

### 1. Go to Vercel Dashboard
https://vercel.com/dashboard

### 2. Select Your Project
Click on `spiritual-gifts-backend`

### 3. Go to Settings → Environment Variables

### 4. Add These Variables

#### DATABASE_URL (REQUIRED)
```
postgresql://postgres.seuffajuxeittqxcqycw:qcF6r_E%24%23kkr%23Wd@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**Important**: Use the **pooler connection string** (port 6543), not the direct connection.

#### JWT_SECRET (REQUIRED)
```
spiritual_gift
```

Or generate a new secure one:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### NODE_ENV (AUTO-SET)
```
production
```
(Vercel sets this automatically)

## Step-by-Step

1. **Go to**: https://vercel.com/your-username/spiritual-gifts-backend/settings/environment-variables

2. **Add DATABASE_URL**:
   - Name: `DATABASE_URL`
   - Value: `postgresql://postgres.seuffajuxeittqxcqycw:qcF6r_E%24%23kkr%23Wd@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

3. **Add JWT_SECRET**:
   - Name: `JWT_SECRET`
   - Value: `spiritual_gift` (or your secure secret)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

## After Setting Variables

You must **redeploy** your project:

### Option 1: Via Dashboard
1. Go to "Deployments" tab
2. Click on the three dots (⋯) on the latest deployment
3. Click "Redeploy"
4. ✅ Check "Use existing Build Cache"
5. Click "Redeploy"

### Option 2: Via Git
```bash
# Make any commit (even empty)
git commit --allow-empty -m "Trigger Vercel redeploy"
git push
```

## Verify It Works

After redeployment, test these endpoints:

```bash
# Health check
curl https://spiritual-gifts-backend.vercel.app/api/health

# Should return: {"status":"ok","message":"Spiritual Gifts API is running"}
```

```bash
# Test login
curl -X POST https://spiritual-gifts-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@spiritualgifts.com"}'

# Should return a token and user object
```

## Common Issues

### Issue 1: Function timeout
**Error**: Function execution timeout

**Solution**: Supabase pooler connection (port 6543) should be fast. If it still times out:
- Verify your DATABASE_URL is using port 6543 (pooler)
- Check Supabase project is active
- Ensure connection string has URL-encoded password

### Issue 2: Database connection failed
**Error**: Cannot connect to database

**Solution**:
- Double-check DATABASE_URL is set correctly
- Verify password special characters are URL-encoded:
  - `$` → `%24`
  - `#` → `%23`
- Use pooler connection (port 6543), not direct (5432)

### Issue 3: JWT secret not found
**Error**: JWT secret is required

**Solution**:
- Add JWT_SECRET environment variable
- Redeploy after adding

## Password URL Encoding

Your password: `qcF6r_E$#kkr#Wd`

URL-encoded: `qcF6r_E%24%23kkr%23Wd`

Special characters that need encoding:
- `$` → `%24`
- `#` → `%23`
- `@` → `%40`
- `&` → `%26`
- `+` → `%2B`
- ` ` (space) → `%20`

## Full Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]
```

Your configuration:
```
postgresql://postgres.seuffajuxeittqxcqycw:qcF6r_E%24%23kkr%23Wd@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
```

Breakdown:
- **User**: `postgres.seuffajuxeittqxcqycw`
- **Password**: `qcF6r_E%24%23kkr%23Wd` (URL-encoded)
- **Host**: `aws-1-ap-southeast-1.pooler.supabase.com`
- **Port**: `6543` (Transaction Pooler)
- **Database**: `postgres`

## Vercel Function Logs

To check what's happening:

1. Go to your project dashboard
2. Click "Deployments"
3. Click on the latest deployment
4. Click "Functions" tab
5. Click on a function to see logs

Look for errors like:
- Database connection errors
- Missing environment variables
- Timeout errors

## Testing Checklist

After deployment, verify:

- [ ] Health check works: `/api/health`
- [ ] Login works: `/api/auth/login`
- [ ] Signup works: `/api/auth/signup`
- [ ] Questions endpoint works: `/api/quiz/questions` (with auth)
- [ ] Admin endpoints work (with admin auth)

## Serverless Limitations

Vercel serverless functions have:
- **10-second timeout** (Hobby plan)
- **60-second timeout** (Pro plan)
- **Cold start** on first request (may be slow)

The pooler connection (port 6543) minimizes these issues.

## Need Help?

1. Check Vercel function logs
2. Verify environment variables are set
3. Test locally first: `npm start`
4. Check Supabase connection in Supabase dashboard

---

**After setting environment variables, redeploy and test!**

