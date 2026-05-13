# Quick Start - Database & Users Setup

## What Was Fixed

Your issues were caused by:
1. ❌ Database tables not initialized
2. ❌ No seed users in database  
3. ❌ Missing database diagnostic/setup endpoints
4. ❌ Incomplete error handling and logging

All issues have been resolved with:
- ✅ Automatic database initialization endpoint
- ✅ Automatic seed user creation
- ✅ Improved backend logging and error handling
- ✅ Better frontend error validation
- ✅ Diagnostic endpoint for troubleshooting

## How to Get Started

### Step 1: Start the Backend Server
From the `backend` directory:
```bash
php -S localhost:8001
```

### Step 2: Initialize Database (Choose One)

#### Option A: Automatic (Recommended)
```bash
curl -X POST http://localhost:8001/api/setup
```

This will:
- Create the `users` table
- Insert 2 seed users
- Return test credentials

#### Option B: Check Status First
```bash
curl http://localhost:8001/api/diagnose
```

Returns current database and user status.

### Step 3: Log In
Use these test credentials:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@cms.com | admin |
| Editor | editor@cms.com | editor |

### Step 4: Create Users
1. Navigate to **Users** page
2. Click **+ Add User** (Super Admin only)
3. Fill in the form and save
4. Users will appear in the table immediately

## Testing the Fix

### Check Everything Works
```bash
# 1. Check API is running
curl http://localhost:8001/api/ping
# Expected: {"status":"success","message":"API is alive"}

# 2. Check database status (before setup)
curl http://localhost:8001/api/diagnose
# Expected: users_table_exists: false, user_count: 0

# 3. Initialize database
curl -X POST http://localhost:8001/api/setup
# Expected: success, users_created: 2

# 4. Check database status (after setup)
curl http://localhost:8001/api/diagnose
# Expected: users_table_exists: true, user_count: 2
```

### Login and Create User
1. Log in with `admin@cms.com` / `admin`
2. Go to Users page
3. See the 2 seed users in the table
4. Click "+ Add User" to create a new user
5. New user appears immediately in the table

## Code Changes Summary

### Backend
- **backend/models/UserModel.php** - Explicit PDO fetch modes + error logging
- **backend/controllers/UsersController.php** - Detailed logging
- **backend/api_setup.php** - New database initialization endpoint
- **backend/index.php** - New setup and diagnose routes

### Frontend
- **src/app/pages/users/UsersPage.tsx** - Improved debugging and error handling
- **src/app/services/api.ts** - New `setupDatabase()` and `getDiagnostics()` methods

### Documentation
- **DATABASE_SETUP.md** - Complete setup guide with troubleshooting

## Common Issues & Solutions

### "Users response: Array(0)"
→ Database is not initialized. Run the `/api/setup` endpoint.

### Login fails: "user not found"
→ Seed users not created. Run `/api/setup` again.

### "You don't have permission to access this page"
→ Logged in user is not `super_admin` or `admin`. Use `admin@cms.com`.

### No database connection error
→ Check MySQL is running and database name in `backend/config.php` matches.

## Need More Help?

See detailed setup instructions in [DATABASE_SETUP.md](../DATABASE_SETUP.md)

