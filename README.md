# Spiritual Gifts Quiz - Backend API

Backend API for the Spiritual Gifts Discovery Tool built with Express.js and SQLite.

## Features

- User authentication with JWT tokens
- Role-based access control (user/admin)
- Quiz management with 30 questions across 6 spiritual gift categories
- Automatic scoring and gift assessment
- Admin dashboard with search and filter capabilities

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```
PORT=5000
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

## Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Quiz
- `GET /api/quiz/questions` - Get all quiz questions (requires auth)
- `POST /api/quiz/submit` - Submit quiz responses (requires auth)
- `GET /api/quiz/history` - Get user's quiz history (requires auth)
- `GET /api/quiz/result/:responseId` - Get specific quiz result (requires auth)

### Admin (requires admin role)
- `POST /api/admin/create-admin` - Create a new admin user
- `GET /api/admin/users` - Get all users (supports ?role=user/admin and ?search=term)
- `GET /api/admin/results` - Get all user results with search/filter
- `GET /api/admin/user/:userId/response/:responseId` - Get detailed user response
- `GET /api/admin/gift-categories` - Get all gift categories

## Database Schema

### Tables
- **users** - User accounts
- **questions** - Quiz questions
- **quiz_responses** - Quiz submission records
- **response_details** - Individual question responses

## Spiritual Gift Categories

The quiz assesses 6 spiritual gift categories with 5 questions each (30 total):

1. Teaching
2. Exhorting
3. Prophesying
4. Word of Wisdom
5. Word of Knowledge
6. Evangelism

Questions are shuffled to avoid grouping by category.

## Default Admin User

A default admin user is automatically created when the server starts for the first time:

**Default Admin Credentials:**
- **Email:** `admin@spiritualgifts.com`
- **Name:** Admin User
- **Role:** admin

You can login immediately with this email to get admin access!

## Creating Additional Admin Users

### Method 1: Via API (Recommended)

Once you're logged in as an admin, you can create additional admin users via the API:

```bash
curl -X POST http://localhost:5000/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "fullname": "New Admin User",
    "email": "newadmin@example.com"
  }'
```

### Method 2: Manual Database Update

Alternatively, manually update the database:

```bash
# Access the SQLite database
sqlite3 database/spiritual-gifts.db

# Update a user to admin
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

## Development

The database will be automatically created and seeded with questions on first run.

## License

MIT

