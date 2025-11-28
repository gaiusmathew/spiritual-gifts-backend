# 🚀 Quick Start - Supabase PostgreSQL

Get your backend running with Supabase in 5 minutes!

## Step 1: Get Supabase Connection String (2 min)

1. Go to [supabase.com](https://app.supabase.com/)
2. Open your project
3. **Settings** → **Database** → **Connection String**
4. Copy the **URI** format
5. Replace `[YOUR-PASSWORD]` with your actual password

Your connection string looks like:
```
postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres
```

## Step 2: Create .env File (1 min)

In the `backend` folder, create a `.env` file:

```env
DATABASE_URL=postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres
JWT_SECRET=use-any-long-random-string-here
NODE_ENV=development
PORT=5000
```

**Generate a JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 3: Install & Run (2 min)

```bash
cd backend
npm install
npm start
```

## ✅ Success!

You should see:
```
Connected to PostgreSQL database
Users table created/verified
Questions table created/verified
...
Database initialized successfully
Questions seeded successfully
Gift descriptions seeded successfully
Default admin user created: admin@spiritualgifts.com
Server is running on port 5000
```

## 🧪 Test It

```bash
# Health check
curl http://localhost:5000/api/health

# Should return: {"status":"ok","message":"Spiritual Gifts API is running"}
```

## 📖 Need More Help?

- **Full Setup Guide**: [SUPABASE-SETUP.md](./SUPABASE-SETUP.md)
- **Migration Details**: [../SUPABASE-MIGRATION.md](../SUPABASE-MIGRATION.md)
- **API Documentation**: [README.md](./README.md)

## Common Issues

**"Connection refused"**
- Check your DATABASE_URL is correct
- Verify your Supabase project is active
- Check your password has no special characters that need encoding

**"SSL error"**
- This is handled automatically, but if you see it, make sure NODE_ENV is set

**"Cannot find module 'pg'"**
- Run `npm install` again

## What's Next?

1. ✅ Backend is running!
2. 🎨 Start the frontend: `cd ../frontend && npm install && npm run dev`
3. 🔑 Login as admin: `admin@spiritualgifts.com`
4. 📊 Test the quiz!

---

**That's it! You're ready to go! 🎉**

