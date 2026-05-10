# Clean Architecture: Multi-Tenant Role System Fix

## Overview

This document describes the implementation of a proper multi-tenant role system for the CMS, following the **OPTION A** design pattern.

### Key Principle

✅ **Keep role in `user_website_access` table**
✅ **Use `users.role` only for platform-level roles** (like `super_admin`)

## Why This Design?

In a multi-tenant CMS, a single user can have different roles on different websites:

| User | Website A | Website B |
|------|-----------|-----------|
| Fatima | admin | editor |

This is **only possible** if roles are scoped per website in `user_website_access`.

## Implementation Details

### 1. Database Schema

**`user_website_access` table:**
```sql
ALTER TABLE user_website_access
MODIFY role ENUM('admin', 'editor') NOT NULL DEFAULT 'editor';
```

Changes:
- ❌ Removed `'super_admin'` from the role ENUM (super_admin is a global role only)
- ✅ Added `NOT NULL` constraint to prevent empty roles
- ✅ Set `DEFAULT 'editor'` for new records

**Why?** Super admin is a platform-level role (in `users.role`), not a website-level role. Website-level roles are only `'admin'` and `'editor'`.

### 2. Data Migration

**File:** `backend/fix_role_data_and_constraint.php`

**What it does:**
1. Fixes all existing empty/null roles in `user_website_access`
2. Maps user's global role to website-level role:
   - `super_admin` → `admin` (gets admin access to all websites)
   - `admin` → `admin`
   - `editor` → `editor`
3. Adds the `NOT NULL DEFAULT 'editor'` constraint

**Run this once:**
```bash
cd backend
php fix_role_data_and_constraint.php
```

### 3. Backend Logic

#### Model: `getUserRoleForWebsite()`

**File:** `backend/models/PageModel.php`

```php
public function getUserRoleForWebsite(string $userId, string $websiteId): ?string
{
    $stmt = $this->pdo->prepare("
        SELECT uwa.role, u.role AS global_role
        FROM user_website_access uwa
        JOIN users u ON u.id = uwa.user_id
        WHERE uwa.user_id = ? AND uwa.website_id = ?
        LIMIT 1
    ");

    $stmt->execute([$userId, $websiteId]);
    $row = $stmt->fetch();

    if (!$row) return null;

    // 🔥 SUPER ADMIN OVERRIDE
    if ($row['global_role'] === 'super_admin') {
        return 'admin';  // Super admin gets admin access to all websites
    }

    return $row['role'];
}
```

This method:
1. Fetches both the website-scoped role and global role
2. Returns `'admin'` for super_admin users (automatic override)
3. Returns the website-scoped role for regular users

#### Controller: Permission Checks

**File:** `backend/controllers/PagesController.php`

**CREATE / UPDATE pages:**
```php
$role = $this->pageModel->getUserRoleForWebsite($payload['sub'], $data['website_id']);

if (!$role || !in_array($role, ['admin', 'editor'])) {
    $this->respondUnauthorized('Access denied for this website');
    return;
}
```

✅ Both admin and editor can create/update

**DELETE pages:**
```php
$role = $this->pageModel->getUserRoleForWebsite($payload['sub'], $existingPage['website_id']);

if ($role !== 'admin') {
    $this->respondUnauthorized('Only admins can delete pages');
    return;
}
```

❌ Only admin can delete (editor cannot)

### 4. Granting Access to Users

**File:** `backend/models/WebsiteModel.php`

```php
public function grantAccessToWebsite(string $userId, string $websiteId, string $grantedBy): bool
{
    // Get user's global role
    $stmt = $this->pdo->prepare('SELECT role FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) return false;

    // Use user's role (editor stays editor, everyone else gets admin)
    $role = ($user['role'] === 'editor') ? 'editor' : 'admin';

    // Insert access record
    $stmt = $this->pdo->prepare(
        'INSERT INTO user_website_access (id, user_id, website_id, role, granted_by)
         VALUES (?, ?, ?, ?, ?)'
    );

    $accessId = $this->generateUuid();
    return $stmt->execute([$accessId, $userId, $websiteId, $role, $grantedBy]);
}
```

**Usage when assigning users to websites:**
```php
// Assign a user to a website (automatically uses their global role)
$websiteModel->grantAccessToWebsite($userId, $websiteId, $currentUserId);
```

## Test Scenarios

### ✅ Test 1: Admin User

**Setup:** User with `role = 'admin'` assigned to website

**Results:**
- ✅ Can create pages
- ✅ Can update pages
- ✅ Can delete pages

### ✅ Test 2: Editor User

**Setup:** User with `role = 'editor'` assigned to website

**Results:**
- ✅ Can create pages
- ✅ Can update pages
- ❌ Cannot delete pages (returns 401 Unauthorized)

### ✅ Test 3: Super Admin User

**Setup:** User with `role = 'super_admin'` (global) assigned to website

**Results:**
- ✅ Can create pages
- ✅ Can update pages
- ✅ Can delete pages (automatic override)

### ❌ Test 4: No Access

**Setup:** User not in `user_website_access` for website

**Results:**
- ❌ Cannot list pages (returns 401 Unauthorized)
- ❌ Cannot create pages (returns 401 Unauthorized)

## Files Modified

1. **`backend/setup_database.php`**
   - Updated `user_website_access` role column definition

2. **`backend/models/PageModel.php`**
   - Already has `getUserRoleForWebsite()` method
   - Handles super_admin override

3. **`backend/models/WebsiteModel.php`**
   - Added `grantAccessToWebsite()` helper method
   - Updated `createWebsite()` to use proper role assignment

4. **`backend/controllers/PagesController.php`**
   - Fixed `create()` method (was malformed)
   - Fixed `delete()` method to check for admin-only
   - Updated `create()` and `update()` to check role permission

5. **`backend/fix_role_data_and_constraint.php`** (new)
   - One-time migration script to fix existing data
   - Adds database constraint

## Running the Fix

1. **Backup your database** (optional but recommended)

2. **Run the migration:**
   ```bash
   cd backend
   php fix_role_data_and_constraint.php
   ```

3. **Verify in your database:**
   ```sql
   -- Check role distribution
   SELECT role, COUNT(*) FROM user_website_access GROUP BY role;
   
   -- Should show something like:
   -- admin  | 5
   -- editor | 3
   
   -- Check for any remaining empty roles
   SELECT COUNT(*) FROM user_website_access WHERE role IS NULL OR role = '';
   -- Should return 0
   ```

4. **Test the API endpoints** with different users and roles

## API Response Examples

### ✅ Success: Editor creates page

```bash
curl -X POST http://localhost:8001/api/pages \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "website_id": "website-123",
    "title": "My Page",
    "slug": "my-page",
    "language": "en",
    "status": "draft",
    "content": "..."
  }'
```

Response:
```json
{
  "status": "success",
  "page": { "id": "...", "title": "My Page", ... }
}
```

### ❌ Error: Editor tries to delete page

```bash
curl -X DELETE http://localhost:8001/api/pages/page-123 \
  -H "Authorization: Bearer <token>"
```

Response:
```json
{
  "status": "error",
  "message": "Only admins can delete pages"
}
```

HTTP Status: `401 Unauthorized`

## Summary

| Role | Create | Update | Delete | Notes |
|------|--------|--------|--------|-------|
| super_admin | ✅ | ✅ | ✅ | Global platform role, automatic override |
| admin | ✅ | ✅ | ✅ | Website-level role |
| editor | ✅ | ✅ | ❌ | Website-level role, limited access |
| no access | ❌ | ❌ | ❌ | Not in user_website_access |

This design allows flexible, multi-tenant role management while maintaining security and clear permission boundaries.
