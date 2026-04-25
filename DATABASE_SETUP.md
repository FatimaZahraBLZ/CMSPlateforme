# Database Setup Instructions

The CMS Platform requires a MySQL database with specific tables and seed data. Follow these steps to initialize your database:

## Prerequisites
- MySQL server running on localhost (or configure in `backend/config.php`)
- Database name: `cms_platform` (or update `backend/config.php`)

## Option 1: Automatic Setup via API (Recommended)

1. Start your backend server:
   ```bash
   # Using PHP built-in server (from backend directory)
   php -S localhost:8001
   
   # Or use your preferred server setup
   ```

2. Call the setup endpoint to initialize the database:
   ```bash
   curl -X POST http://localhost:8001/api/setup
   ```

   Or from the browser:
   ```
   POST http://localhost:8001/api/setup
   ```

3. The API will:
   - Create the `users` table
   - Insert seed users (if not already present)
   - Return test credentials

4. Test login credentials:
   - **Super Admin**: `admin@cms.com` / `admin`
   - **Editor**: `editor@cms.com` / `editor`

## Option 2: Manual Setup via PHP Scripts

### Step 1: Create Database Tables
```bash
php backend/setup_database.php
```

### Step 2: Seed Initial Users
```bash
php backend/seed_users.php
```

### Step 3: Verify Setup
```bash
php backend/init_database.php
```

## Option 3: MySQL Command Line

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS cms_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create users table
USE cms_platform;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'editor', 'visitor') DEFAULT 'editor',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    avatar VARCHAR(500),
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert seed users (replace with your credentials)
INSERT INTO users (id, name, email, password_hash, role, status, avatar, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'Super Admin', 'admin@cms.com', '$2y$10$...', 'super_admin', 'active', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', NOW(), NOW()),
('00000000-0000-0000-0000-000000000002', 'Editor User', 'editor@cms.com', '$2y$10$...', 'editor', 'active', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Editor', NOW(), NOW());
```

## Troubleshooting

### No users showing in the Users page
1. Check that the database connection is working:
   ```bash
   curl http://localhost:8001/api/ping
   ```

2. Check database initialization status:
   ```bash
   curl http://localhost:8001/api/diagnose
   ```

3. Verify the database exists:
   ```sql
   SHOW DATABASES;
   USE cms_platform;
   SHOW TABLES;
   SELECT COUNT(*) FROM users;
   ```

### Login fails with "user not found"
- Ensure seed users have been created
- Check the users table has data: `SELECT COUNT(*) FROM users;`
- Try running the setup endpoint again

### Permission errors
- Ensure logged-in user has role `super_admin` or `admin`
- Only `super_admin` can create new users
- Only `super_admin` and `admin` can list users

## Next Steps

1. Start the PHP backend server
2. Run the API setup endpoint
3. Log in with test credentials
4. Navigate to Users page to create new users

