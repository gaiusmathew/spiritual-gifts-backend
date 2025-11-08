# Supabase PostgreSQL Setup Guide

This guide will help you migrate from SQLite to Supabase PostgreSQL for the Spiritual Gifts Quiz application.

## Prerequisites

- A Supabase account (free tier works great!)
- Your Supabase project created
- Node.js and npm installed

## Step 1: Get Your Supabase Connection String

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Click on **Settings** (gear icon) in the left sidebar
4. Navigate to **Database**
5. Scroll down to **Connection String** section
6. Copy the **URI** connection string (it looks like this):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
7. Replace `[YOUR-PASSWORD]` with your actual database password

## Step 2: Configure Environment Variables

Create a `.env` file in the `backend` directory with the following content:

```env
# Supabase PostgreSQL Configuration
DATABASE_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres

# JWT Secret - Generate a secure random string
# You can use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-this

# Node Environment
NODE_ENV=development

# Server Port
PORT=5000
```

### Important Notes:
- Replace the `DATABASE_URL` with your actual Supabase connection string
- Generate a new `JWT_SECRET` using the command above or any secure random string generator
- Never commit the `.env` file to version control (it's in `.gitignore`)

## Step 3: Install Dependencies

The backend has been updated to use PostgreSQL instead of SQLite:

```bash
cd backend
npm install
```

This will install the `pg` (PostgreSQL) driver package.

## Step 4: Initialize the Database

When you start the server, it will automatically:
- Create all necessary tables
- Seed questions (30 questions across 6 gift categories)
- Seed gift descriptions
- Create a default admin user

Run the server:

```bash
npm start
# or for development with auto-reload
npm run dev
```

You should see console messages confirming:
```
Connected to PostgreSQL database
Users table created/verified
Questions table created/verified
Gift descriptions table created/verified
Quiz responses table created/verified
Response details table created/verified
Database initialized successfully
Questions seeded successfully
Gift descriptions seeded successfully
Default admin user created: admin@spiritualgifts.com
Server is running on port 5000
```

## Step 5: Verify Database Tables

You can verify the tables were created in your Supabase dashboard:

1. Go to **Table Editor** in the left sidebar
2. You should see these tables:
   - `users`
   - `questions`
   - `gift_descriptions`
   - `quiz_responses`
   - `response_details`

## Database Schema

### users
- `id` (SERIAL PRIMARY KEY)
- `fullname` (TEXT NOT NULL)
- `email` (TEXT UNIQUE NOT NULL)
- `role` (TEXT DEFAULT 'user')
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

### questions
- `id` (SERIAL PRIMARY KEY)
- `gift_category` (TEXT NOT NULL)
- `question_text` (TEXT NOT NULL)
- `question_order` (INTEGER NOT NULL)

### gift_descriptions
- `id` (SERIAL PRIMARY KEY)
- `gift_category` (TEXT UNIQUE NOT NULL)
- `description` (TEXT NOT NULL)

### quiz_responses
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER NOT NULL, FOREIGN KEY → users.id)
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

### response_details
- `id` (SERIAL PRIMARY KEY)
- `response_id` (INTEGER NOT NULL, FOREIGN KEY → quiz_responses.id)
- `question_id` (INTEGER NOT NULL, FOREIGN KEY → questions.id)
- `answer_value` (INTEGER NOT NULL)

## Default Admin User

A default admin user is automatically created:
- **Email**: `admin@spiritualgifts.com`
- **Role**: admin

You can login with this email to access the admin dashboard.

## Deployment Considerations

### For Vercel or Other Platforms

When deploying to production:

1. Set the environment variables in your hosting platform:
   - `DATABASE_URL` - Your Supabase connection string
   - `JWT_SECRET` - Your production JWT secret
   - `NODE_ENV=production`

2. Supabase free tier includes:
   - 500 MB database space
   - Unlimited API requests
   - 50,000 monthly active users
   - 2 GB bandwidth per month

This should be more than enough for a quiz application!

### Connection Pooling

The application uses PostgreSQL connection pooling via the `pg` library's `Pool` class, which efficiently manages database connections.

## Troubleshooting

### Connection Issues

If you can't connect to Supabase:

1. **Check your connection string** - Make sure you replaced `[YOUR-PASSWORD]` with your actual password
2. **Check SSL settings** - Supabase requires SSL in production
3. **Check firewall** - Supabase is accessible from anywhere, but check your local firewall
4. **Verify project status** - Make sure your Supabase project is active

### SSL Certificate Issues

If you get SSL certificate errors, the code automatically handles this with:

```javascript
ssl: process.env.NODE_ENV === 'production' ? {
  rejectUnauthorized: false
} : false
```

This allows Supabase's self-signed certificates in production.

## Benefits of Supabase PostgreSQL

✅ **Better Performance** - PostgreSQL is faster and more scalable than SQLite
✅ **Real Database** - Proper ACID compliance, transactions, and concurrent access
✅ **Hosted Solution** - No need to manage database files
✅ **Free Tier** - Generous free tier for small to medium apps
✅ **Automatic Backups** - Supabase handles backups for you
✅ **Easy Scaling** - Can upgrade to paid tier as you grow
✅ **Built-in Auth** - Supabase offers auth services if you want to integrate later

## Migration Complete! 🎉

Your backend is now running on Supabase PostgreSQL instead of SQLite. All routes and functionality remain the same - just with a more robust, production-ready database.

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js pg Library](https://node-postgres.com/)

