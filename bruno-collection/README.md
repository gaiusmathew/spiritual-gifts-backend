# Bruno API Collection - Spiritual Gifts API

This is a complete Bruno API collection for testing the Spiritual Gifts API.

## What is Bruno?

Bruno is a fast and Git-friendly open-source API client. It's similar to Postman but stores collections as plain text files.

- Website: https://www.usebruno.com/
- Download: https://www.usebruno.com/downloads

## Setup

1. **Install Bruno**: Download from https://www.usebruno.com/downloads

2. **Open Collection**:
   - Open Bruno
   - Click "Open Collection"
   - Navigate to `backend/bruno-collection/`
   - Select the folder

3. **Set Environment**:
   - Select "Local" environment in the dropdown
   - The base URL is already set to `http://localhost:5000/api`

## Usage Flow

### 1. Test Basic Health
```
Run: Health Check
```

### 2. Login as Default Admin (Quickest Way)
```
Run: Auth > Login as Default Admin
```
This will:
- Login with the automatically created admin user (`admin@spiritualgifts.com`)
- Automatically save the admin JWT token to environment
- Give you immediate access to all admin endpoints!

**OR** Create a new user:

### 3. Create User Account
```
Run: Auth > Signup
```
This will:
- Create a new user
- Automatically save the JWT token to environment

### 4. Login (Alternative)
```
Run: Auth > Login
```
Use this if you already have an account.

### 4. Get Quiz Questions
```
Run: Quiz > Get Questions
```
Returns all 70 questions with their IDs and categories.

### 5. Submit Quiz
```
Run: Quiz > Submit Quiz
```
Submits all 70 responses and returns calculated spiritual gifts.

### 6. View Quiz History
```
Run: Quiz > Get Quiz History
```
Shows all quizzes taken by the logged-in user.

### 7. View Quiz Result
```
Run: Quiz > Get Quiz Result
```
Get detailed results for a specific quiz (update the ID in URL).

## Admin Endpoints

### Default Admin User

A default admin user is automatically created when the backend starts:
- **Email:** `admin@spiritualgifts.com`
- **Name:** Admin User
- **Role:** admin

**Quick Admin Access:**
1. Run: `Auth > Login as Default Admin`
2. That's it! You now have admin access ✨

### Create Additional Admin Users

Once logged in as admin:
1. Run: `Admin > Create Admin User`
2. The new admin is created immediately via API
3. No database edits needed!

### Admin Operations

- **Create Admin User**: Create a new admin user via API
- **Get All Users**: List all users in the system
- **Get All Users - Filter by Role**: Filter users by role (user/admin)
- **Get All Users - Search**: Search users by name or email
- **Get All Users - Combined Filters**: Combine role and search filters
- **Get All Results**: View all user submissions
- **Get All Results - With Search**: Search by name/email
- **Get All Results - With Gift Filter**: Filter by gift category
- **Get All Results - Search and Filter**: Combine both
- **Get User Response Details**: View individual user responses
- **Get Gift Categories**: List all gift categories

## Collection Structure

```
bruno-collection/
├── environments/
│   └── Local.bru                          # Environment variables
├── Auth/
│   ├── Signup.bru                         # Create account
│   ├── Login.bru                          # User login
│   └── Create Admin User.bru              # Admin account creation
├── Quiz/
│   ├── Get Questions.bru                  # Get all questions
│   ├── Submit Quiz.bru                    # Submit responses
│   ├── Get Quiz History.bru               # User's quiz history
│   └── Get Quiz Result.bru                # Specific result
├── Admin/
│   ├── Create Admin User.bru              # Create admin via API
│   ├── Get All Users.bru                  # List all users
│   ├── Get All Users - Filter by Role.bru # Filter by user/admin
│   ├── Get All Users - Search.bru         # Search users
│   ├── Get All Users - Combined Filters.bru # Role + search
│   ├── Get All Results.bru                # All results
│   ├── Get All Results - With Search.bru  # Search results
│   ├── Get All Results - With Gift Filter.bru  # Filter by gift
│   ├── Get All Results - Search and Filter.bru # Combined
│   ├── Get User Response Details.bru      # User details
│   └── Get Gift Categories.bru            # List categories
├── Health Check.bru                       # API health check
├── bruno.json                             # Collection metadata
└── README.md                              # This file
```

## Environment Variables

The collection uses these variables:

- `base_url`: API base URL (default: http://localhost:5000/api)
- `token`: JWT authentication token (auto-set after login/signup)

## Query Parameters Reference

### Admin Results Endpoints

**Search Parameter:**
- `?search=john` - Search by name or email

**Gift Filter Parameter:**
- `?giftFilter=Teaching` - Filter by gift category

Valid gift categories:
- Teaching
- Exhorting
- Prophesying
- Word of Wisdom
- Word of Knowledge
- Evangelism

**Combined:**
- `?search=john&giftFilter=Mercy` - Both search and filter

## Response Examples

### Signup/Login Response
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "fullname": "John Doe",
    "email": "john.doe@example.com",
    "role": "user"
  }
}
```

### Get Questions Response
```json
{
  "questions": [
    {
      "id": 1,
      "gift_category": "Teaching",
      "question_text": "I am disciplined and willing to study hard...",
      "question_order": 1
    }
  ],
  "instructions": {
    "scale": [
      { "value": 5, "label": "Very true of me" },
      { "value": 4, "label": "Mostly true of me" },
      { "value": 3, "label": "Sometimes true of me" },
      { "value": 2, "label": "Rarely true of me" },
      { "value": 1, "label": "Not true of me" }
    ]
  }
}
```

### Submit Quiz Response
```json
{
  "message": "Quiz submitted successfully",
  "responseId": 1,
  "gifts": [
    {
      "category": "Mercy",
      "score": 24,
      "maxScore": 25,
      "percentage": 96,
      "averageScore": "4.80"
    }
  ]
}
```

## Tips

1. **Auto-save Token**: The Signup and Login requests automatically save the JWT token to the environment, so you don't need to manually copy it.

2. **Update IDs**: When testing specific results, update the IDs in the URL to match your actual data.

3. **Check Docs**: Each request has documentation in the "Docs" tab explaining parameters and usage.

4. **Environment Switching**: You can create additional environments (Production, Staging) by duplicating the Local environment.

## Troubleshooting

### Token Expired
If you get 403 errors:
- Run Login again to get a fresh token
- Tokens expire after 7 days

### Admin Access Denied
- Ensure you've updated the user role in the database
- Login again after changing the role

### Connection Refused
- Make sure the backend server is running on port 5000
- Check `npm run dev` in backend folder

## License

MIT

