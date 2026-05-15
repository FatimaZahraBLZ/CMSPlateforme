# RBAC Architecture Implementation - Complete

## Overview

Implemented the professional CMS role-based access control (RBAC) architecture exactly as recommended:

- **Global platform roles** in `users` table: `super_admin`, `admin`, `editor`
- **Website-specific roles** in `user_website_access` table: `admin`, `editor`
- **Super admin bypass**: Bypasses `user_website_access` table entirely
- **Website ownership**: Tracked via `websites.created_by`

---

## Architecture Rules

### 1. Super Admin (`super_admin`)

**Access:**
- Sees ALL websites without needing `user_website_access` rows
- Has full access to all websites
- Can manage team access for any website

**Implementation:**
- No rows in `user_website_access` needed (clean architecture)
- Queries check `users.role` first, bypass access table

**Example Flow:**
```
Super Admin Login
  ↓
Check role = 'super_admin' ✓
  ↓
Return ALL websites from websites table
  ↓
No access table check performed
```

### 2. Admin / Editor

**Access:**
- Sees only websites in `user_website_access` where they're assigned
- Must have explicit access row for each website
- Can manage editors within their websites

**Implementation:**
- Must have row in `user_website_access` to see website
- Role determined from `user_website_access.role`

**Example Flow:**
```
Admin/Editor Login
  ↓
Check role = 'super_admin'? ✗
  ↓
Query user_website_access table
  ↓
Return only websites where user has access row
```

---

## Code Changes

### 1. WebsiteModel.php

#### `getWebsitesForUser(userId, userRole)`

**Before:**
```php
// Only checked user_website_access (super_admin couldn't see all websites!)
SELECT w.* FROM websites w
INNER JOIN user_website_access uwa ON w.id = uwa.website_id
WHERE uwa.user_id = ?
```

**After:**
```php
// Super admin bypass
if ($userRole === 'super_admin') {
    SELECT * FROM websites  // ALL websites!
} else {
    SELECT w.* FROM websites w
    INNER JOIN user_website_access uwa ON w.id = uwa.website_id
    WHERE uwa.user_id = ?  // Only assigned websites
}
```

#### `userCanAccessWebsite(userId, websiteId, userRole)`

**Before:**
```php
// Always checked access table (super_admin fragile!)
SELECT id FROM user_website_access 
WHERE user_id = ? AND website_id = ?
```

**After:**
```php
// Check role first
if ($userRole === 'super_admin') {
    return true;  // Always has access
}

// Only check table for admin/editor
SELECT id FROM user_website_access 
WHERE user_id = ? AND website_id = ?
```

#### `createWebsite()`

**Before:**
```php
// Always created access row, even for super_admin
$this->grantAccessToWebsite($userId, $websiteId, $userId);
```

**After:**
```php
// Only create access row for admin/editor
$user = getUserById($userId);
if ($user['role'] !== 'super_admin') {
    $this->grantAccessToWebsite($userId, $websiteId, $userId);
}
// Super admin: website created with created_by, no access row needed
```

---

### 2. PageModel.php

#### `getUserRoleForWebsite(userId, websiteId)`

**Before:**
```php
// Required access row to exist, had override for super_admin
SELECT uwa.role, u.role FROM user_website_access uwa
JOIN users u WHERE uwa.user_id = ? AND uwa.website_id = ?
if ($row['global_role'] === 'super_admin') return 'admin';
```

**After:**
```php
// Check global role FIRST
$user = SELECT role FROM users WHERE id = ?
if ($user['role'] === 'super_admin') {
    return 'admin';  // No database check needed!
}

// Only check access table for admin/editor
SELECT role FROM user_website_access 
WHERE user_id = ? AND website_id = ?
```

**Benefits:**
- ✅ Super admin returns 'admin' role without needing access row
- ✅ Works correctly even if no row exists
- ✅ All dependent controllers (Pages, Menus) work automatically

---

### 3. WebsitesController.php

#### `index()` method

**Added:**
```php
// Fetch user's global role
$userRole = $this->getUserRole($userId);
if (!$userRole) {
    return unauthorized;
}

// Pass role to model
$websites = $this->websiteModel->getWebsitesForUser($userId, $userRole);
```

#### `update()` method

**Added:**
```php
// Fetch user's global role
$userRole = $this->getUserRole($userId);

// Pass role to access check
if (!$this->websiteModel->userCanAccessWebsite($userId, $websiteId, $userRole)) {
    return unauthorized;
}
```

#### `getUserRole()` helper

**Added:**
```php
private function getUserRole(string $userId): ?string
{
    $stmt = $this->pdo->prepare('SELECT role FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    return $user ? $user['role'] : null;
}
```

---

## Database No Changes Required

Schema remains **exactly the same**:

```sql
-- users table (already correct)
role ENUM('super_admin', 'admin', 'editor')

-- websites table (already has created_by)
created_by CHAR(36)

-- user_website_access table (unchanged)
role ENUM('admin', 'editor')  -- No 'super_admin' here!
```

---

## Behavior Changes

### Super Admin Website Visibility

**Before:**
```
Super Admin A creates website X
  ↓
Super Admin A gets row in user_website_access
  ↓
Super Admin A sees website X ✓

Super Admin B creates website Y
  ↓
Super Admin B gets row in user_website_access
  ↓
Super Admin A CANNOT see website Y ✗  ❌ WRONG!
```

**After:**
```
Super Admin A creates website X
  ↓
No row created in user_website_access
  ↓
Super Admin A queries websites table directly
  ↓
Super Admin A sees website X ✓

Super Admin B creates website Y
  ↓
No row created in user_website_access
  ↓
Super Admin A queries websites table directly
  ↓
Super Admin A sees website Y ✓  ✅ CORRECT!
```

### Admin Website Visibility

**Before:**
```
Admin A assigned to website X
  ↓
Row created in user_website_access
  ↓
Admin A sees website X ✓

Admin A NOT assigned to website Y
  ↓
No row for website Y
  ↓
Admin A cannot see website Y ✓
```

**After:**
```
Same behavior - unchanged ✓
```

---

## Access Flow Diagram

```
User Login
  ↓
Fetch user from database (get role)
  ↓
Is role = 'super_admin'?
  ├─ YES → Return ALL websites (no table check)
  └─ NO → Check user_website_access table
            ↓
         Return only assigned websites
```

---

## Affected Endpoints

### ✅ Automatic Fixes (No controller changes needed)

These controllers call `getUserRoleForWebsite()` which now works correctly:

- **PagesController**
  - `GET /api/pages?website_id=X`
  - `POST /api/pages`
  - `PUT /api/pages/{id}`
  - `DELETE /api/pages/{id}`
  - `POST /api/pages/{id}/publish`
  - `POST /api/pages/{id}/unpublish`

- **MenuController**
  - `GET /api/menus?website_id=X`
  - `POST /api/menus`
  - `PUT /api/menus/{id}`
  - `DELETE /api/menus/{id}`
  - `POST /api/menu-items`
  - `PUT /api/menu-items/{id}`
  - `DELETE /api/menu-items/{id}`

### ✅ Updated

- **WebsitesController**
  - `GET /api/websites` - Now shows all websites for super_admin
  - `PUT /api/websites/{id}` - Now supports super_admin access

---

## Testing Scenarios

### Scenario 1: Super Admin Access

```
User: Super Admin
Role: super_admin

GET /api/websites
└─ Response: [Website A, Website B, Website C] (all in system)

GET /api/pages?website_id=C
└─ Response: All pages from website C (created by any user)

PUT /api/websites/C
└─ Response: ✓ Success (super admin can edit any website)
```

### Scenario 2: Admin with Limited Access

```
User: Admin John
Role: admin
Assigned to: Website X only

GET /api/websites
└─ Response: [Website X] (only assigned)

GET /api/pages?website_id=X
└─ Response: ✓ Pages from Website X

GET /api/pages?website_id=Y
└─ Response: ✗ Unauthorized (not assigned)

PUT /api/websites/X
└─ Response: ✓ Success
```

### Scenario 3: Editor

```
User: Editor Jane
Role: editor
Assigned to: Website X as editor

GET /api/pages?website_id=X
└─ Response: ✓ Can view pages

POST /api/pages
└─ Response: ✓ Can create pages

DELETE /api/websites/X
└─ Response: ✗ Unauthorized (can't delete, editor role)
```

---

## Migration Guide

### If you have existing super_admin rows in user_website_access

**Optional cleanup** (not required, but recommended):

```sql
-- This is SAFE to run - super admin access still works
DELETE FROM user_website_access 
WHERE user_id IN (
  SELECT id FROM users WHERE role = 'super_admin'
);
```

**Why safe?**
- Super admins don't depend on access rows anymore
- They access websites via global role check
- Cleanup is optional - having rows doesn't hurt

---

## Security Benefits

✅ **Cleaner separation** of global vs. scoped permissions  
✅ **No fragility** - super admin doesn't depend on access table rows  
✅ **Professional pattern** - matches WordPress, Shopify, Webflow  
✅ **Auditable** - ownership tracked in `websites.created_by`  
✅ **Future-proof** - ready for features like:
- Ownership transfer
- Billing per website owner
- Audit logs
- Activity tracking

---

## Summary of Changes

| Component | Change | Reason |
|-----------|--------|--------|
| WebsiteModel.getWebsitesForUser | Add role parameter, check super_admin | Super admin sees all websites |
| WebsiteModel.userCanAccessWebsite | Add role parameter, check super_admin | Super admin bypasses access table |
| WebsiteModel.createWebsite | Skip access row for super_admin | Super admin doesn't need rows |
| PageModel.getUserRoleForWebsite | Check global role first | Bypass access table for super_admin |
| WebsitesController.index | Fetch and pass user role | Support new logic |
| WebsitesController.update | Fetch and pass user role | Support new logic |
| WebsitesController.getUserRole | New helper method | Fetch user role efficiently |

All changes maintain **backward compatibility** while implementing the professional CMS pattern.
