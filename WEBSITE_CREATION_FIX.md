# Website Creation - Fix Guide

## Problem
When creating a website, you get this error:
```
SQLSTATE[23000]: Integrity constraint violation: 1452 
Cannot add or update a child row: a foreign key constraint fails 
(`cms_platform`.`websites`, CONSTRAINT `fk_websites_created_by` 
FOREIGN KEY (`created_by`) REFERENCES `users` (`id`))
```

## Root Cause
The `websites` table was missing the `created_by` column that tracks which user created each website.

## Solution

### Option 1: Fresh Database Setup (Recommended)
If you're starting fresh:

1. **Drop and recreate the database:**
   ```bash
   # From MySQL console
   DROP DATABASE cms_platform;
   CREATE DATABASE cms_platform;
   ```

2. **Initialize with API:**
   ```bash
   # Start your backend
   cd backend
   php -S localhost:8001
   ```

3. **Run setup endpoint in another terminal:**
   ```bash
   curl -X POST http://localhost:8001/api/setup
   ```

4. **Test website creation** - should work now ✅

### Option 2: Migrate Existing Database
If you have existing data you want to keep:

1. **Start backend:**
   ```bash
   cd backend
   php -S localhost:8001
   ```

2. **Run migration endpoint:**
   ```bash
   curl -X POST http://localhost:8001/api/migrate
   ```

   You should see:
   ```json
   {
     "status": "success",
     "message": "Database migration completed - created_by column added"
   }
   ```

3. **Test website creation** - should work now ✅

### Option 3: Manual MySQL Migration
If the above don't work:

```sql
USE cms_platform;

-- Check if column exists
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'websites' AND COLUMN_NAME = 'created_by';

-- If it doesn't exist, add it:
ALTER TABLE websites 
ADD COLUMN created_by VARCHAR(36) AFTER theme,
ADD CONSTRAINT fk_websites_created_by 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
```

## What Changed

### Backend Changes
1. **setup_database.php** - Updated schema to include `created_by` field
2. **migrate_database.php** - New script to add `created_by` to existing tables
3. **WebsiteModel.php** - Now includes `created_by` in INSERT statement
4. **WebsitesController.php** - Added error logging for debugging
5. **index.php** - Added `/api/migrate` endpoint

### Frontend Changes
1. **api.ts** - Added `migrateDatabase()` method

## Website Creation Flow (Fixed)

```
POST /api/websites (with JWT token)
    ↓
Extract user_id from JWT token
    ↓
INSERT INTO websites (created_by = user_id)
    ↓
INSERT INTO user_website_access (user_id, website_id)
    ↓
Create default pages, menus, settings
    ↓
Return website with ID
```

## Testing

Once fixed, try creating a website:

1. Log in as admin
2. Go to **Websites** page
3. Click **+ Create Website**
4. Fill in details:
   - Name: "Test Website"
   - Client: "Test Client"
   - Domain: "test.com"
   - Status: "draft"
5. Click **Create Website**
6. Website should appear in the list ✅

## Troubleshooting

### Still getting the error?
1. Check database connection is working:
   ```bash
   curl http://localhost:8001/api/ping
   ```

2. Check database status:
   ```bash
   curl http://localhost:8001/api/diagnose
   ```

3. Check backend error logs for detailed messages

### Want to see what's happening?
Check browser console for detailed error messages. The backend now logs:
- Website creation data
- Success/failure
- Full error traces

