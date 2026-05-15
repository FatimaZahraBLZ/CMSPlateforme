# RBAC Architecture - Quick Reference Guide

## For Backend Developers

### Understanding User Roles

```
users.role = ?
├─ 'super_admin' → Global platform access (all websites)
├─ 'admin'       → Scoped access (assigned websites only)
└─ 'editor'      → Scoped access (assigned websites only)
```

### Checking Website Access

#### ✅ DO THIS (Automatic - model methods handle it)

```php
// In controllers, fetch user role once:
$userRole = $this->getUserRole($userId);

// Then use it:
$websites = $this->websiteModel->getWebsitesForUser($userId, $userRole);

if (!$this->websiteModel->userCanAccessWebsite($userId, $websiteId, $userRole)) {
    return unauthorized;
}

// For page/menu operations (automatic super_admin bypass):
$role = $this->pageModel->getUserRoleForWebsite($userId, $websiteId);
if (!$role) {
    return unauthorized;
}
```

#### ❌ DON'T DO THIS

```php
// Don't check only access table (breaks super_admin access)
$stmt = $pdo->prepare('SELECT * FROM user_website_access WHERE user_id = ? AND website_id = ?');

// Don't ignore user's global role
if (!checkAccessTable()) { ... }
```

### Super Admin Logic

**Super admin access is determined by ONE check:**

```php
if ($userRole === 'super_admin') {
    return ALL_WEBSITES;  // No access table check
}
```

**Super admin is NOT fragile because:**
- ✓ Doesn't depend on access table rows
- ✓ Determined purely by `users.role = 'super_admin'`
- ✓ Access table is optional for super_admin

### Website Creation Logic

```php
// When admin/editor creates website:
$websiteId = $websiteModel->createWebsite($data, $userId);
// Automatically creates access row

// When super_admin creates website:
$websiteId = $websiteModel->createWebsite($data, $superAdminId);
// Does NOT create access row (not needed)
// Super admin can see it via role check
```

### Database Dependency

```
getWebsitesForUser($userId, $userRole)
├─ If super_admin:   1 query (SELECT from websites)
└─ If admin/editor:  1 query (SELECT from websites + user_website_access JOIN)

userCanAccessWebsite($userId, $websiteId, $userRole)
├─ If super_admin:   0 queries (returns true immediately)
└─ If admin/editor:  1 query (SELECT from user_website_access)

getUserRoleForWebsite($userId, $websiteId)
├─ If super_admin:   1 query (SELECT from users, returns 'admin')
└─ If admin/editor:  1 query (SELECT from user_website_access)
```

---

## For Frontend Developers

### Permissions to Display

#### Super Admin Sees
```
Dashboard
├─ All Websites (100% of platform)
├─ Team Management (manage any user on any website)
├─ Settings (global platform settings)
└─ Analytics (all websites)
```

#### Admin Sees
```
Dashboard
├─ My Websites (only assigned)
│  ├─ Website A
│  ├─ Website B
│  └─ [Team Management for each]
├─ My Profile
└─ My Account Settings
```

#### Editor Sees
```
Dashboard
├─ My Websites (only assigned, limited actions)
│  ├─ Website A (edit pages, menus, but can't delete)
│  └─ Website B (edit pages, menus, but can't delete)
├─ My Profile
└─ My Account Settings
```

### API Responses

#### Super Admin
```javascript
GET /api/websites
Response: [
  { id: '1', name: 'Website A', createdBy: 'user-x', ... },
  { id: '2', name: 'Website B', createdBy: 'user-y', ... },
  { id: '3', name: 'Website C', createdBy: 'user-z', ... },
  // ALL websites in system
]
```

#### Admin
```javascript
GET /api/websites
Response: [
  { id: '1', name: 'Website A', role: 'admin', ... },
  { id: '3', name: 'Website C', role: 'admin', ... },
  // Only assigned websites
]
```

#### Editor
```javascript
GET /api/websites
Response: [
  { id: '1', name: 'Website A', role: 'editor', ... },
  // Only assigned websites where editor is assigned
]
```

### Permission Matrix for UI

| Feature                    | Super Admin | Admin | Editor |
|----------------------------|:-----------:|:-----:|:------:|
| View all websites          | ✅           | ❌     | ❌      |
| View assigned websites     | ✅           | ✅     | ✅      |
| Edit pages                 | ✅           | ✅     | ✅      |
| Edit menus                 | ✅           | ✅     | ✅      |
| Publish content            | ✅           | ✅     | ✅      |
| Manage team                | ✅           | ✅     | ❌      |
| Delete website             | ✅           | ✅     | ❌      |
| Platform settings          | ✅           | ❌     | ❌      |
| Access unassigned website  | ✅           | ❌     | ❌      |

---

## Troubleshooting

### Issue: Super admin can't see all websites

**Check:**
1. User's `role` is `'super_admin'` (not a typo)
2. Frontend is calling `GET /api/websites` with valid token
3. Backend is passing `$userRole` to `getWebsitesForUser()`

**Fix:**
```php
// Verify in WebsitesController.index()
$userRole = $this->getUserRole($userId);
// Must be called and passed to model
$websites = $this->websiteModel->getWebsitesForUser($userId, $userRole);
```

### Issue: Admin can access unassigned websites

**Check:**
1. Website access row exists in `user_website_access`
2. `userCanAccessWebsite()` is being called with correct role
3. No direct table queries (should use model methods)

**Fix:**
```php
// Don't do direct queries
// Use the model method:
if (!$this->websiteModel->userCanAccessWebsite($userId, $websiteId, $userRole)) {
    return unauthorized;
}
```

### Issue: Access denied when super admin should have access

**Check:**
1. Is the user really a super_admin? Check `users.role`
2. Is `userRole` variable being passed correctly?
3. Is there a typo in role name?

**Verify:**
```sql
SELECT id, email, role FROM users WHERE id = ?;
-- role should be exactly 'super_admin'
```

---

## When Adding New Features

### New Endpoint Checklist

When adding a new endpoint, ensure it checks access:

```php
public function newAction(string $websiteId): void
{
    // 1. Get token and validate
    $payload = $this->authService->validateJwt($token);
    $userId = $payload['sub'];
    
    // 2. Fetch user's role ← IMPORTANT!
    $userRole = $this->getUserRole($userId);
    
    // 3. Check access ← ALWAYS!
    if (!$this->websiteModel->userCanAccessWebsite($userId, $websiteId, $userRole)) {
        $this->respondUnauthorized('Access denied');
        return;
    }
    
    // 4. Proceed with action
    // ...
}
```

### New Model Method Checklist

When adding access checks to models:

```php
public function newModelMethod(string $userId, string $websiteId): mixed
{
    // 1. If you need user's role, fetch it (or require it as parameter)
    $userStmt = $this->pdo->prepare('SELECT role FROM users WHERE id = ?');
    
    // 2. Check global role first (super_admin bypass)
    if ($user['role'] === 'super_admin') {
        return getAllData();  // No restriction
    }
    
    // 3. For admin/editor, check access table
    $stmt = $this->pdo->prepare(
        'SELECT * FROM user_website_access WHERE user_id = ? AND website_id = ?'
    );
    if (!$stmt->fetch()) {
        return null;  // No access
    }
    
    return getData();
}
```

---

## Performance Notes

### Database Queries

The architecture is optimized for minimal queries:

```
Per request (typical flow):
1. getUserRole()                    → 1 query
2. getWebsitesForUser()             → 1 query
3. userCanAccessWebsite()           → 0-1 queries
                    Total: 2-3 queries
```

### Caching Opportunities

Consider caching user role in JWT or session:

```php
// In JWT payload, include:
{
  'sub': 'user-id',
  'role': 'super_admin'  // Add this
}

// Then avoid getUserRole() calls
$userRole = $payload['role'];
```

---

## Security Reminders

✅ Always validate JWT token  
✅ Always pass role to access checks  
✅ Use model methods (not direct SQL)  
✅ Check access before performing action  
✅ Log access denied attempts  
✅ Don't trust frontend role claims  
✅ Verify `users.role` from database  

---

## Related Documentation

- [RBAC_ARCHITECTURE_IMPLEMENTATION.md](./RBAC_ARCHITECTURE_IMPLEMENTATION.md) - Complete technical guide
- [verify_rbac_architecture.php](../backend/tests/verify_rbac_architecture.php) - Verification test
