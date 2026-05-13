# CMS Platform - Authentication & Login Flow Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Frontend Components](#frontend-components)
4. [Backend Components](#backend-components)
5. [Database Tables](#database-tables)
6. [Authentication Flow (Sequence Diagram)](#authentication-flow-sequence-diagram)
7. [Step-by-Step Process](#step-by-step-process)
8. [Security Features](#security-features)
9. [Role-Based Access Control](#role-based-access-control)
10. [Testing](#testing)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The CMS Platform uses a **hybrid authentication system** combining:
- **JWT tokens** for stateless API authentication
- **Sessions** for tracking user activity and graceful logouts
- **CORS with credentials** for secure cross-origin requests
- **Password hashing** (bcrypt) for secure credential storage
- **Role-based access control** for frontend route protection

This dual approach ensures:
- ✅ **Scalability**: JWT doesn't require server-side storage
- ✅ **Session tracking**: Sessions log all user activity
- ✅ **Role-based access**: User role embedded in JWT and enforced in frontend routing
- ✅ **Security**: Passwords never exposed, HTTPS-ready
- ✅ **Access control**: Routes protected by user roles (super_admin, admin, editor)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ LoginPage.tsx                                            │   │
│  │ - Renders login form                                    │   │
│  │ - Collects email + password                            │   │
│  │ - Displays error messages                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ AuthContext.tsx                                          │   │
│  │ - Manages user state (React Context)                   │   │
│  │ - Stores token & user info in localStorage            │   │
│  │ - Coordinates login/logout operations                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ProtectedRoute.tsx                                       │   │
│  │ - Route protection component                            │   │
│  │ - Checks user authentication & role                    │   │
│  │ - Redirects unauthorized users                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ApiService.ts                                            │   │
│  │ - HTTP client with base URL: http://localhost:8000    │   │
│  │ - Sends POST /api/auth/login request                  │   │
│  │ - Handles CORS + credentials                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                             ↓↑ (CORS + Credentials)
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (PHP - MVC)                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ index.php                                                │   │
│  │ - Router: /api/auth/login → AuthController::login()   │   │
│  │ - CORS headers (with credentials support)             │   │
│  │ - Built-in PHP server support                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ AuthController.php                                       │   │
│  │ - Receives email + password                            │   │
│  │ - Validates input                                      │   │
│  │ - Calls UserModel & AuthService                        │   │
│  │ - Returns JWT + sessionId + user info                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│           ↙           ↓           ↖                              │
│  ┌──────────────┐ ┌──────────┐ ┌─────────────────┐              │
│  │ UserModel    │ │AuthService│ │ Activity Logger │              │
│  │ - Query user │ │- Bcrypt  │ │ - Log action   │              │
│  │ - Update    │ │- JWT gen │ │ - Store in DB  │              │
│  │  last_login │ │- Session │ │                 │              │
│  └──────────────┘ └──────────┘ └─────────────────┘              │
│           ↓           ↓           ↓                              │
└─────────────────────────────────────────────────────────────────┘
                             ↓ (MySQL)
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (MySQL)                           │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────────┐           │
│  │ users        │ │ sessions     │ │ activity_logs  │           │
│  │ - id         │ │ - id         │ │ - id           │           │
│  │ - email      │ │ - user_id    │ │ - user_id      │           │
│  │ - password_  │ │ - expires_at │ │ - action       │           │
│  │   hash       │ │ - created_at │ │ - created_at   │           │
│  │ - role       │ │              │ │                │           │
│  │ - status     │ │              │ │                │           │
│  └──────────────┘ └──────────────┘ └────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Frontend Components

### **1. LoginPage.tsx**
**Location:** `src/app/pages/auth/LoginPage.tsx`

**Responsibilities:**
- Renders login form with email + password fields
- Calls `AuthContext.login()` on form submit
- Displays error messages
- Shows loading state during authentication
- Redirects to dashboard on success

**Key Code:**
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    await login(email, password);           // Call from AuthContext
    navigate('/dashboard');                 // Redirect on success
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid email or password';
    setError(message);
    console.error('Login error:', message);
  } finally {
    setLoading(false);
  }
};
```

---

### **2. AuthContext.tsx**
**Location:** `src/app/contexts/AuthContext.tsx`

**Responsibilities:**
- Global state management for authentication
- Manages user data + JWT token
- Persists credentials to localStorage
- Provides login/logout functions to child components

**State:**
```tsx
const [user, setUser] = useState<User | null>(null);        // User object
const [token, setToken] = useState<string | null>(null);    // JWT token
```

**Login Function:**
```tsx
const login = async (email: string, password: string) => {
  try {
    const response = await api.login(email, password);      // Call API
    
    if (response.status !== 'success') {
      throw new Error(response.message || 'Login failed');
    }

    const loggedUser: User = {
      id: response.user.id,
      name: response.user.name,
      email: response.user.email,
      role: response.user.role,                             // 'super_admin', 'admin', 'editor'
      status: response.user.status,
      avatar: response.user.avatar || '',
      createdAt: new Date(),
    };

    setUser(loggedUser);                                     // Update state
    setToken(response.token);                               // Store JWT
    localStorage.setItem('cms_user', JSON.stringify(loggedUser));
    localStorage.setItem('cms_token', response.token);
  } catch (error) {
    console.error('Login failed in AuthContext:', error);
    throw error;
  }
};
```

---

### **3. ProtectedRoute.tsx**
**Location:** `src/app/components/ProtectedRoute.tsx`

**Responsibilities:**
- Route protection component for role-based access control
- Checks if user is authenticated and has required role
- Redirects unauthorized users to dashboard or login
- Wraps protected page components

**Key Code:**
```tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to dashboard if not authorized
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
```

---

### **4. ApiService.ts**
**Location:** `src/app/services/api.ts`

**Responsibilities:**
- HTTP client for backend API calls
- Base URL: `http://localhost:8000`
- Handles CORS + credentials
- Sends login request to PHP backend

**Login Method:**
```tsx
async login(email: string, password: string) {
  try {
    const res = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',                    // Enable cookies/credentials
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || `Login failed (${res.status})`);
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
```

---

## 🔧 Backend Components

### **1. Backend Router (index.php)**
**Location:** `backend/index.php`

**Responsibilities:**
- Routes HTTP requests to controllers
- Handles CORS headers
- Supports OPTIONS (preflight) requests
- Loads configuration and controllers

**CORS Configuration:**
```php
$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
$allowed_origins = ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');     // Critical for credentials mode
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

**Router Logic:**
```php
if ($path === '/api/auth/login' && $method === 'POST') {
    $controller = new AuthController($pdo);
    $controller->login();
    exit;
}
```

---

### **2. AuthController.php**
**Location:** `backend/controllers/AuthController.php`

**Responsibilities:**
- Processes login request
- Validates credentials
- Generates JWT + session
- Logs activity
- Returns user info or error

**Login Process:**
```php
public function login(): void
{
    // 1. Parse input
    $data = json_decode(file_get_contents('php://input'), true);
    if (empty($data['email']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Email and password required']);
        return;
    }

    // 2. Find user by email
    $user = $this->userModel->findByEmail($email);
    if (!$user) {
        $this->respondInvalid();    // Return 401 error
        return;
    }

    // 3. Verify password (bcrypt)
    if (!$this->authService->verifyPassword($password, $user['password_hash'])) {
        $this->respondInvalid();
        return;
    }

    // 4. Check status is active
    if ($user['status'] !== 'active') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Account is inactive']);
        return;
    }

    // 5. Update last_login timestamp
    $this->userModel->updateLastLogin($user['id']);

    // 6. Generate JWT token (1 hour expiration)
    $jwt = $this->authService->createJwt([
        'sub' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
    ]);

    // 7. Create session (7 day expiration)
    $sessionId = $this->authService->createSession(
        $user['id'],
        $_SERVER['REMOTE_ADDR'] ?? null,
        $_SERVER['HTTP_USER_AGENT'] ?? null
    );

    // 8. Log activity
    $this->saveActivity($user, 'login', 'authentication', null, 'User logged in');

    // 9. Return success response
    echo json_encode([
        'status' => 'success',
        'token' => $jwt,
        'sessionId' => $sessionId,
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'status' => $user['status']
        ],
    ]);
}
```

---

### **3. UserModel.php**
**Location:** `backend/models/UserModel.php`

**Responsibilities:**
- Database operations for users
- Find user by email
- Update last login

**Methods:**
```php
public function findByEmail(string $email): ?array
{
    $stmt = $this->pdo->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    return $stmt->fetch() ?: null;
}

public function updateLastLogin(string $userId): bool
{
    $stmt = $this->pdo->prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?');
    return $stmt->execute([$userId]);
}
```

---

### **4. AuthService.php**
**Location:** `backend/services/AuthService.php`

**Responsibilities:**
- Password verification (bcrypt)
- JWT generation + validation
- Session management

**Key Methods:**

#### **Password Verification:**
```php
public function verifyPassword(string $plainPassword, string $hash): bool
{
    return password_verify($plainPassword, $hash);
}
```

#### **JWT Generation:**
```php
public function createJwt(array $payload): string
{
    $header = json_encode(['typ' => 'JWT', 'alg' => JWT_ALGO]);
    
    $payload = array_merge($payload, [
        'iat' => time(),                          // Issued at
        'exp' => time() + 3600,                   // Expires in 1 hour
    ]);

    $base64UrlHeader = $this->base64UrlEncode($header);
    $base64UrlPayload = $this->base64UrlEncode(json_encode($payload));

    $signature = hash_hmac('sha256', $base64UrlHeader . '.' . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = $this->base64UrlEncode($signature);

    return $base64UrlHeader . '.' . $base64UrlPayload . '.' . $base64UrlSignature;
}
```

#### **Session Creation:**
```php
public function createSession(string $userId, ?string $ip = null, ?string $agent = null): ?string
{
    $sessionId = bin2hex(random_bytes(32));          // Generate unique session ID
    $expiresAt = (new DateTime('+7 days'))->format('Y-m-d H:i:s');

    $stmt = $this->pdo->prepare(
        'INSERT INTO sessions (id, user_id, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)'
    );

    $success = $stmt->execute([$sessionId, $userId, $ip, $agent, $expiresAt]);
    return $success ? $sessionId : null;
}
```

---

## 💾 Database Tables

### **1. users Table**
Stores user accounts and credentials.

```sql
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,                    -- UUID
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,        -- Bcrypt hash
    role ENUM('super_admin', 'admin', 'editor') NOT NULL DEFAULT 'editor',
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    avatar VARCHAR(500) NULL,
    last_login_at TIMESTAMP NULL,               -- Updated on every login
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Seed Data:**
```sql
INSERT INTO users (id, name, email, password_hash, role, status) VALUES
('00000000-0000-0000-0000-000000000001', 'Super Admin', 'admin@cms.com', '$2y$10$[bcrypt_hash]', 'super_admin', 'active'),
('00000000-0000-0000-0000-000000000002', 'Editor User', 'editor@cms.com', '$2y$10$[bcrypt_hash]', 'editor', 'active');
```

---

### **2. sessions Table**
Tracks active user sessions for activity logging + graceful logouts.

```sql
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,                -- Unique session ID (hex)
    user_id CHAR(36) NOT NULL,
    ip_address VARCHAR(45) NULL,                -- IPv4 or IPv6
    user_agent TEXT NULL,                       -- Browser info
    expires_at TIMESTAMP NOT NULL,              -- 7-day lifetime
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sessions_user_id (user_id),
    INDEX idx_sessions_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### **3. activity_logs Table**
Audit trail for all user actions including logins.

```sql
CREATE TABLE activity_logs (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,              -- 'login', 'create', 'update', etc.
    target_type VARCHAR(50) NOT NULL,          -- 'authentication', 'page', 'article', etc.
    target_id CHAR(36) NULL,
    target_name VARCHAR(255) NULL,
    details JSON NULL,                          -- Additional context
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_logs_user FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_activity_logs_user_id (user_id),
    INDEX idx_activity_logs_action (action),
    INDEX idx_activity_logs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 🔄 Authentication Flow (Sequence Diagram)

```
┌─────────┐      ┌──────────────────┐      ┌──────────────┐      ┌────────┐
│ Browser │      │ Frontend (React) │      │ Backend (PHP)│      │ Database
└────┬────┘      └────────┬─────────┘      └──────┬───────┘      └────┬───┘
     │                    │                       │                    │
     │  User enters       │                       │                    │
     │  credentials       │                       │                    │
     ├───────────────────>│                       │                    │
     │                    │  LoginPage.tsx        │                    │
     │                    │  collects email +     │                    │
     │                    │  password             │                    │
     │                    │                       │                    │
     │                    │  AuthContext.login()  │                    │
     │                    │  called               │                    │
     │                    │                       │                    │
     │                    │  ApiService.login()   │                    │
     │                    │  POST /api/auth/login │                    │
     │                    ├──────OPTIONS ────────>│                    │
     │                    │<─────204 OK ─────────┤  (preflight)       │
     │                    │  (CORS preflight OK) │                    │
     │                    │                       │                    │
     │                    │  POST /api/auth/login │                    │
     │                    │  {email, password}    │                    │
     │                    ├──────POST ───────────>│                    │
     │                    │                       │AuthController      │
     │                    │                       │::login()           │
     │                    │                       │  1. Parse input    │
     │                    │                       │  2. Find user      │
     │                    │                       ├──SELECT * FROM─── >│
     │                    │                       │  users WHERE       │
     │                    │                       │  email = ?         │
     │                    │                       │<────200 OK ──────┤
     │                    │                       │  [user row]        │
     │                    │                       │                    │
     │                    │                       │  3. Verify pwd    │
     │                    │                       │  password_verify() │
     │                    │                       │                    │
     │                    │                       │  4. Check status  │
     │                    │                       │  (active?)        │
     │                    │                       │                    │
     │                    │                       │  5. Generate JWT  │
     │                    │                       │  AuthService      │
     │                    │                       │  ::createJwt()    │
     │                    │                       │                    │
     │                    │                       │  6. Create session│
     │                    │                       ├──INSERT INTO ────>│
     │                    │                       │  sessions         │
     │                    │                       │<────OK ──────────┤
     │                    │                       │  sessionId        │
     │                    │                       │                    │
     │                    │                       │  7. Update       │
     │                    │                       │  last_login_at    │
     │                    │                       ├──UPDATE users ───>│
     │                    │                       │<────OK ──────────┤
     │                    │                       │                    │
     │                    │                       │  8. Log activity  │
     │                    │                       ├──INSERT INTO ────>│
     │                    │                       │  activity_logs    │
     │                    │                       │<────OK ──────────┤
     │                    │                       │                    │
     │                    │                       │  9. Return JSON  │
     │                    │<─ 200 OK + JSON ─────┤  {status,token,   │
     │                    │  {status:'success',...}│   sessionId,user} │
     │                    │                       │                    │
     │                    │ AuthContext          │                    │
     │                    │ updates state        │                    │
     │                    │ + localStorage       │                    │
     │                    │                       │                    │
     │ Redirect to        │                       │                    │
     │ /dashboard ───────>│                       │                    │
     │                    │                       │                    │
     │                    │ ProtectedRoute        │                    │
     │                    │ checks user role      │                    │
     │                    │ (super_admin/admin/   │                    │
     │                    │  editor)              │                    │
     │                    │                       │                    │
     │                    │ If authorized:        │                    │
     │                    │ render dashboard      │                    │
     │                    │                       │                    │
     │                    │ If not authorized:    │                    │
     │                    │ redirect to /dashboard│                    │
     │                    │ (or /login if not     │                    │
     │                    │  authenticated)       │                    │
     │                    │                       │                    │
```

---

## 📝 Step-by-Step Process

### **Phase 1: User Input**

1. User navigates to login page: `http://localhost:5173/login`
2. Enters email: `admin@cms.com`
3. Enters password: `admin`
4. Clicks "Sign In" button

### **Phase 2: Frontend Submission**

5. **LoginPage.tsx** captures form submit
6. Calls `AuthContext.login(email, password)`
7. **AuthContext.tsx** calls `ApiService.login(email, password)`
8. **ApiService.tsx** sends:
   ```
   POST http://localhost:8000/api/auth/login
   Content-Type: application/json
   credentials: 'include'
   
   {"email":"admin@cms.com","password":"admin"}
   ```

### **Phase 3: CORS Preflight (Browser)**

9. Browser sends **OPTIONS** request (preflight check)
10. Backend responds with CORS headers:
    ```
    Access-Control-Allow-Origin: http://localhost:5173
    Access-Control-Allow-Credentials: true
    ```
11. Browser allows actual POST request

### **Phase 4: Backend Processing**

12. **Backend Router (index.php)** receives POST
13. Routes to **AuthController::login()**
14. **AuthController** extracts email + password from JSON body

### **Phase 5: Database Lookup**

15. **UserModel::findByEmail()** queries:
    ```sql
    SELECT * FROM users WHERE email = 'admin@cms.com' LIMIT 1
    ```
16. Returns user row with all fields

### **Phase 6: Credential Verification**

17. **AuthService::verifyPassword()** checks:
    ```php
    password_verify('admin', $user['password_hash'])
    ```
    Uses bcrypt to compare plaintext with stored hash

18. If mismatch → return **401 Unauthorized**

### **Phase 7: Status Check**

19. **AuthController** verifies `user['status'] === 'active'`
20. If inactive → return **403 Forbidden**

### **Phase 8: Token Generation**

21. **AuthService::createJwt()** generates JWT:
    ```
    Header  : {typ: 'JWT', alg: 'HS256'}
    Payload : {sub: user_id, email, role, iat, exp}
    Signature: HMAC-SHA256(header.payload, JWT_SECRET)
    ```
    Result: `eyJ0eXAiOi...AwNX0.0RnoRoJ9...`

22. JWT contains:
    - User ID (sub)
    - Email
    - Role (super_admin / admin / editor)
    - Issued time (iat)
    - Expiration (exp) - 1 hour

### **Phase 9: Session Creation**

23. **AuthService::createSession()** generates session:
    - Unique ID: 64-char hex string
    - User ID: links to users table
    - IP address: for audit trail
    - User agent: browser info
    - Expires: 7 days

24. Inserts into `sessions` table:
    ```sql
    INSERT INTO sessions (id, user_id, ip_address, user_agent, expires_at) 
    VALUES ('160d377c17910b2b97b7605f4dc0eafe...', 
            '00000000-0000-0000-0000-000000000001', 
            '::1', 
            'Mozilla/5.0...',
            2026-04-09 16:39:29)
    ```

### **Phase 10: Activity Logging**

25. **AuthController::saveActivity()** logs:
    ```sql
    INSERT INTO activity_logs (id, user_id, user_name, action, target_type, ...) 
    VALUES (uuid, '00000000...', 'Super Admin', 'login', 'authentication', ...)
    ```

### **Phase 11: Last Login Update**

26. **UserModel::updateLastLogin()** updates:
    ```sql
    UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = '00000000...'
    ```

### **Phase 12: Response to Frontend**

27. **AuthController** returns JSON:
    ```json
    {
      "status": "success",
      "token": "eyJ0eXAiOi...",
      "sessionId": "160d377c17910b2b97b7605f4dc0eafe...",
      "user": {
        "id": "00000000-0000-0000-0000-000000000001",
        "name": "Super Admin",
        "email": "admin@cms.com",
        "role": "super_admin",
        "status": "active"
      }
    }
    ```

### **Phase 13: Frontend State Update**

28. **AuthContext** receives response
29. Updates state:
    ```tsx
    setUser(loggedUser)        // React state
    setToken(response.token)   // React state
    ```
30. Persists to localStorage:
    ```js
    localStorage.setItem('cms_user', JSON.stringify(loggedUser))
    localStorage.setItem('cms_token', response.token)
    ```

### **Phase 14: Redirect & Role-Based Access Control**

31. **LoginPage.tsx** calls `navigate('/dashboard')`
32. **DashboardLayout** checks `if (!user) redirect to login`
33. **ProtectedRoute** component wraps each dashboard route
34. Checks if user role is in `allowedRoles` array for the route
35. If authorized: render the requested page
36. If not authorized: redirect to `/dashboard` (fallback)
37. Dashboard displays with role-filtered menu items
38. Shows user name + role in topbar

**Role Permissions:**
- **super_admin**: All routes + all menu items
- **admin**: Most routes except roles/global-settings/activity-logs
- **editor**: Content routes (dashboard, pages, articles, media, preview, publish)

---

## 🛡️ Security Features

### **1. Password Security**
- ✅ **Bcrypt hashing**: One-way hash with salt
- ✅ **No plaintext**: Passwords never stored or logged
- ✅ **Unique hashes**: Same password produces different hash each time

```php
// Hash password when creating user
$hash = password_hash('admin', PASSWORD_BCRYPT);

// Verify during login
if (password_verify($plainPassword, $storedHash)) { ... }
```

### **2. JWT Security**
- ✅ **Signed tokens**: HMAC-SHA256 signature prevents tampering
- ✅ **Expiration**: 1-hour lifetime limits token abuse
- ✅ **Role embedded**: No extra DB query needed to check permissions
- ✅ **Secret key**: Uses `JWT_SECRET` from config

```php
// Token includes expiration
'exp' => time() + 3600  // 1 hour

// Signature prevents modification
$signature = hash_hmac('sha256', $data, JWT_SECRET, true);
```

### **3. CORS Security**
- ✅ **Whitelist origins**: Only specific domains allowed
- ✅ **Credentials mode**: `credentials: 'include'` restricted to safe origins
- ✅ **Preflight checks**: Browser validates before sending
- ✅ **No wildcard** `*` with credentials

```php
$allowed_origins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
];

// Only set specific origin, not wildcard
header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Credentials: true');
```

### **4. Database Security**
- ✅ **Parameterized queries**: Prevents SQL injection
- ✅ **Foreign keys**: Enforces referential integrity
- ✅ **Unique email**: No duplicate logins
- ✅ **Timestamp audit**: last_login_at tracks activity

```php
$stmt = $this->pdo->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);  // Prevents injection
```

### **5. Input Validation**
- ✅ **Required fields**: Email + password must be present
- ✅ **Type checking**: Status must be 'active'
- ✅ **Error messages**: Generic "Invalid credentials" (doesn't reveal if email exists)

```php
if (empty($data['email']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Email and password required']);
}
```

---

## 🔐 Role-Based Access Control

The CMS implements comprehensive role-based access control (RBAC) to restrict system access based on user roles. The system supports three roles: `super_admin`, `admin`, and `editor`.

### **Role Definitions**

#### **super_admin**
- **Full System Access**: Complete access to all features and modules
- **User Management**: Create, edit, delete all user accounts
- **System Configuration**: Access to global settings, activity logs, and role management
- **Content Management**: All content creation and publishing capabilities

#### **admin**
- **Administrative Access**: Most system features except super-admin only areas
- **User Management**: Limited user management (cannot manage super_admins)
- **Content Oversight**: Full content management and publishing
- **System Monitoring**: Access to settings and configurations
- **Restricted Areas**: Cannot access roles management, global settings, activity logs

#### **editor**
- **Content Creation**: Focus on content creation and editing
- **Limited Access**: Dashboard, pages, articles, media library, preview, publish
- **No Administrative**: Cannot access user management, settings, or system configuration

### **Frontend Implementation**

#### **ProtectedRoute Component**
**Location:** `src/app/components/ProtectedRoute.tsx`

Routes are protected using the `ProtectedRoute` component that:
- Verifies user authentication
- Checks user role against `allowedRoles` array
- Redirects unauthorized users to dashboard
- Prevents access to restricted routes

#### **Route Configuration**
**Location:** `src/app/routes.tsx`

Each dashboard route specifies allowed roles:
```tsx
{
  path: 'users',
  element: <ProtectedRoute allowedRoles={['super_admin', 'admin']}><UsersPage /></ProtectedRoute>,
},
{
  path: 'roles',
  element: <ProtectedRoute allowedRoles={['super_admin']}><RolesPage /></ProtectedRoute>,
},
```

#### **Menu Filtering**
**Location:** `src/app/layouts/DashboardLayout.tsx`

Sidebar menu items are filtered based on user role:
```tsx
const filteredMenuItems = menuItems.filter(item =>
  user && item.roles.includes(user.role)
);
```

### **Backend Role Integration**

The backend includes role information in:
- **JWT Payload**: Role embedded for stateless authorization
- **Login Response**: User object contains role field
- **Database**: Users table stores role enum values

### **Access Control Matrix**

| Module/Feature | super_admin | admin | editor |
|----------------|-------------|-------|--------|
| Dashboard | ✅ | ✅ | ✅ |
| Users | ✅ | ✅ | ❌ |
| Roles & Permissions | ✅ | ❌ | ❌ |
| Websites | ✅ | ✅ | ❌ |
| Pages | ✅ | ✅ | ✅ |
| Articles | ✅ | ✅ | ✅ |
| Media Library | ✅ | ✅ | ✅ |
| Menus | ✅ | ✅ | ❌ |
| Translations | ✅ | ✅ | ❌ |
| Theme | ✅ | ✅ | ❌ |
| SEO | ✅ | ✅ | ❌ |
| Site Settings | ✅ | ✅ | ❌ |
| Global Settings | ✅ | ❌ | ❌ |
| Activity Logs | ✅ | ❌ | ❌ |
| Preview | ✅ | ✅ | ✅ |
| Publish | ✅ | ✅ | ✅ |

### **Security Considerations**

- **Role Validation**: Both frontend and backend validate roles
- **Fallback Redirect**: Unauthorized access redirects to dashboard
- **Menu Hiding**: Restricted menu items are not displayed
- **Route Protection**: Direct URL access is blocked
- **Session Persistence**: Role information persists across sessions

---

## 🧪 Testing

### **Test Case 1: Successful Login**

**Credentials:**
- Email: `admin@cms.com`
- Password: `admin`

**Expected Result:**
1. Browser console shows "Login response received: {status: 'success', token: '...', user: {...}}"
2. Redirects to `/dashboard`
3. Dashboard displays username "Super Admin"
4. Role is "super_admin"
5. localStorage has `cms_user` + `cms_token`

**Test Command (curl):**
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cms.com","password":"admin"}'
```

**Expected Response:**
```json
{
  "status": "success",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "sessionId": "160d377c17910b2b97...",
  "user": {
    "id": "00000000-0000-0000-0000-000000000001",
    "name": "Super Admin",
    "email": "admin@cms.com",
    "role": "super_admin",
    "status": "active"
  }
}
```

---

### **Test Case 2: Wrong Password**

**Credentials:**
- Email: `admin@cms.com`
- Password: `wrong_password`

**Expected Result:**
1. HTTP 401 response
2. Error message: "Invalid email or password"
3. No redirect, stays on login page

**Expected Response:**
```json
{
  "status": "error",
  "message": "Invalid email or password"
}
```

---

### **Test Case 3: Non-existent Email**

**Credentials:**
- Email: `nonexistent@cms.com`
- Password: `any_password`

**Expected Result:**
1. HTTP 401 response
2. Error message: "Invalid email or password" (generic, doesn't reveal email doesn't exist)

---

### **Test Case 4: Inactive Account**

*Note: First change a user's status to inactive in DB*

**Credentials:**
- Email: `editor@cms.com` (if set to inactive)
- Password: `editor`

**Expected Result:**
1. HTTP 403 response
2. Error message: "Account is inactive"

---

### **Test Case 5: Missing Fields**

**Payload:** `{}`

**Expected Result:**
1. HTTP 400 response
2. Error message: "Email and password required"

---

## 🔍 Troubleshooting

### **Issue 1: CORS Error - "Wildcard '*' not allowed with credentials"**

**Symptom:**
```
Access to fetch at 'http://localhost:8000/api/auth/login' from origin 'http://localhost:5173' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' 
when the request's credentials mode is 'include'.
```

**Cause:** Backend sends `Access-Control-Allow-Origin: *` but frontend uses `credentials: 'include'`

**Fix:**
```php
// ❌ Wrong
header('Access-Control-Allow-Origin: *');

// ✅ Correct
$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
}
```

---

### **Issue 2: "Invalid email or password" with correct credentials**

**Symptom:** Login fails but user row exists in DB

**Diagnosis Steps:**

1. **Check if API is called:**
   - Open browser DevTools → Network tab
   - Login attempt
   - Look for `POST /api/auth/login` request
   - If no request appears → frontend issue (wrong URL?)
   - If request shows 500 error → backend PHP error

2. **Check user row exists:**
   ```sql
   SELECT id, email, role, status, password_hash FROM users WHERE email='admin@cms.com';
   ```
   Should return 1 row

3. **Verify password hash:**
   ```php
   <?php
   $plainPassword = 'admin';
   $hash = '$2y$10$...'; // from users.password_hash
   echo password_verify($plainPassword, $hash) ? 'OK' : 'FAIL';
   ?>
   ```

4. **Check status is active:**
   ```sql
   SELECT status FROM users WHERE email='admin@cms.com';
   ```
   Should return `active`

5. **Run backend debug:**
   Check `backend/debug.log` for messages like:
   - "not found: admin@cms.com"
   - "wrong password for: admin@cms.com"

---

### **Issue 3: Backend doesn't start - "Failed to open stream: No such file or directory"**

**Symptom:** PHP error about missing `vendor/autoload.php`

**Cause:** Composer autoload attempted but not installed

**Fix:** Already fixed in code - removed unused `require_once` from UserModel.php

---

### **Issue 4: Token not saved to localStorage**

**Symptom:** Login works but localStorage empty

**Check:**
1. Browser DevTools → Application tab → Local Storage
2. Should have `cms_user` + `cms_token` after login

**Likely cause:** localStorage API error (rare), check console for throw errors

---

### **Issue 5: Redirected back to login after successful login**

**Symptom:** Dashboard shows briefly then redirects to login

**Cause:** DashboardLayout checks `if (!user)` but user is null

**Check:**
1. localStorage has `cms_user`?
2. AuthContext initial load works?
   - Check `useEffect` in AuthContext loads from localStorage on mount

---

## 📊 State Flow Diagram

```
┌─────────────────────────────────────────┐
│        UNAUTHENTICATED STATE            │
│  user = null                            │
│  token = null                           │
│ ┌─────────────────────────────────────┐ │
│ │ DashboardLayout checks:             │ │
│ │ if (!user) → redirect to /login     │ │
│ └─────────────────────────────────────┘ │
└──────────────┬──────────────────────────┘
               │
               │ User enters credentials
               │ click "Sign In"
               ↓
┌─────────────────────────────────────────┐
│     LOGIN FORM SUBMITTED                │
│ AuthContext.login(email, password)      │
│ ↓                                       │
│ ApiService.login()                      │
│ ↓                                       │
│ fetch() POST /api/auth/login            │
└──────────────┬──────────────────────────┘
               │
      ┌────────┴────────┐
      ↓                 ↓
   SUCCESS          FAILURE
     │                 │
     ↓                 ↓
┌─────────────┐   ┌──────────────┐
│ setUser()   │   │ throw Error  │
│ setToken()  │   │ show message │
│             │   │              │
│ localStorage├──→│ LoginPage    │
│ persistence │   │ displays:    │
└──────┬──────┘   │ "Invalid..." │
       │          └──────────────┘
       │
       ↓
┌─────────────────────────────────────────┐
│        AUTHENTICATED STATE              │
│  user = {id, name, email, role, ...}    │
│  token = "eyJ0eXAi..."                  │
│ ┌─────────────────────────────────────┐ │
│ │ navigate('/dashboard')              │ │
│ │ ↓                                   │ │
│ │ DashboardLayout renders             │ │
│ │ menu + content accessible           │ │
│ │ user name shown in topbar            │ │
│ └─────────────────────────────────────┘ │
└──────────────┬──────────────────────────┘
               │
               │ User clicks Logout
               ↓
┌─────────────────────────────────────────┐
│     LOGOUT TRIGGERED                    │
│ AuthContext.logout()                    │
│ ↓                                       │
│ setUser(null)                           │
│ setToken(null)                          │
│ localStorage.removeItem()               │
│ ↓                                       │
│ navigate('/login')                      │
└──────────────┬──────────────────────────┘
               │
               ↓
        [Back to UNAUTHENTICATED]
```

---

## 🚀 Running the System

### **Start Backend**
```bash
cd d:\CMSPlateforme\backend
php -S localhost:8000
```

### **Start Frontend**
```bash
cd d:\CMSPlateforme
npm run dev
```

### **Navigate to Login**
Open browser: `http://localhost:5173`

### **Test Credentials**
- Email: `admin@cms.com`
- Password: `admin`
- Role: `super_admin`

---

## 📚 Reference

- **Frontend Auth Context:** `src/app/contexts/AuthContext.tsx`
- **Login Page:** `src/app/pages/auth/LoginPage.tsx`
- **API Service:** `src/app/services/api.ts`
- **Backend Router:** `backend/index.php`
- **Auth Controller:** `backend/controllers/AuthController.php`
- **Auth Service:** `backend/services/AuthService.php`
- **User Model:** `backend/models/UserModel.php`
- **Seeder Script:** `backend/seed_users.php`

---

**Last Updated:** April 16, 2026 by Fatima ezzahra boulouiz 
