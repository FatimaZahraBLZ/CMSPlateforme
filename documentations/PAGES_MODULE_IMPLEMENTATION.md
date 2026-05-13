# Pages Module CRUD Implementation

## Overview
This document describes the final working Pages module implementation for the CMS. It covers the backend model, controllers, routes, and the frontend React pages module that now uses the real API with zero TypeScript errors.

## Architecture Flow
```
Frontend (React) → API Service (api.ts) → Backend Routes (backend/index.php) → Controllers → Models → Database
```

---

## Step 1: Backend Model - PageModel.php

**Location:** `backend/models/PageModel.php`

**Purpose:** Executes page CRUD operations and validates website access for the authenticated user.

**Key Methods:**

1. **`getPagesForWebsite($websiteId, $language = null)`**
   - Returns pages scoped to the requested website and optional language
   - Uses website ownership validation before returning results

2. **`createPage($data)`**
   - Inserts a new page row for the provided website
   - Requires `website_id`, `title`, `slug`, `language`, and `status`
   - Returns the inserted page or ID

3. **`getPageById($pageId)`**
   - Retrieves a single page by ID
   - Used by update/delete guards to confirm website ownership

4. **`updatePage($pageId, $data)`**
   - Updates existing page fields
   - The page is first validated for website access
   - Returns a boolean result

5. **`deletePage($pageId)`**
   - Deletes a page and any related translation rows
   - Validates access before deletion
   - Returns a boolean result

6. **`userCanAccessWebsite($userId, $websiteId)`**
   - Checks `user_website_access` for the current user
   - Ensures multi-tenant isolation and authorization checks

**Key Features:**
- Website-scoped access control via `user_website_access`
- Page language filtering by request parameter
- Draft/published status supported
- Timestamps for auditing

---

## Step 2: Backend Controller - PagesController.php

**Location:** `backend/controllers/PagesController.php`

**Purpose:** Exposes authenticated CRUD endpoints for page management.

**Endpoints:**

1. **`GET /api/pages?website_id=X&language=en`**
   - Authenticates with JWT bearer token
   - Verifies user access to `website_id`
   - Returns JSON shape `{ status: 'success', pages: [...] }`

2. **`POST /api/pages`**
   - Requires JSON body with `website_id`, `title`, `slug`, `content`, `language`, `status`
   - Validates user access to the target website
   - Returns `{ status: 'success', page: {...} }`

3. **`PUT /api/pages/:id`**
   - Loads existing page by `id`
   - Verifies user access to `existingPage['website_id']`
   - Updates the record and returns updated page object

4. **`DELETE /api/pages/:id`**
   - Verifies user access to the page’s website
   - Deletes the page and returns `{ status: 'success' }`

**Key Behavior:**
- All methods extract the bearer token from headers
- Unauthorized access returns `401`
- Missing data returns `400`
- `user_id` is derived from JWT claims, not request body

---

## Step 3: Backend Routing - index.php

**Location:** `backend/index.php`

**Purpose:** Registers API endpoints for page operations.

**Routes Added:**
```php
if ($path === '/api/pages' && $method === 'GET') {
    $controller = new PagesController($pdo);
    $controller->index();
}

if ($path === '/api/pages' && $method === 'POST') {
    $controller = new PagesController($pdo);
    $controller->create();
}

if (preg_match('#^/api/pages/([^/]+)$#', $path, $matches) && $method === 'PUT') {
    $controller = new PagesController($pdo);
    $controller->update($matches[1]);
}

if (preg_match('#^/api/pages/([^/]+)$#', $path, $matches) && $method === 'DELETE') {
    $controller = new PagesController($pdo);
    $controller->delete($matches[1]);
}
```

**How It Works:**
- The router matches request paths and HTTP methods
- `:id` in the URL is extracted via regex and passed to the controller
- Each method handles auth and response formatting

---

## Step 4: Frontend API Service - api.ts

**Location:** `src/app/services/api.ts`

**Purpose:** Wraps backend HTTP calls in typed frontend methods.

### Authentication Helper
**`getAuthHeaders()`**
- Reads `cms_token` from localStorage
- Returns `{ Authorization: 'Bearer <token>' }`
- Used for all authenticated fetch calls

### Page Methods

1. **`getPages(websiteId: string, language?: string)`**
   ```typescript
   const pages = await api.getPages(selectedWebsite.id, 'en');
   ```
   - Requests `GET /api/pages?website_id=X&language=en`
   - Returns `data.pages || []`

2. **`createPage(data: any)`**
   ```typescript
   const created = await api.createPage({
     title: 'About Us',
     slug: 'about-us',
     content: '...',
     website_id: selectedWebsite.id,
     language: 'en',
     status: 'draft'
   });
   ```
   - Requests `POST /api/pages`
   - Returns `response.page`

3. **`updatePage(id: string, data: any)`**
   ```typescript
   await api.updatePage(pageId, { ...pageData });
   ```
   - Requests `PUT /api/pages/:id`
   - Returns `response.page`

4. **`deletePage(id: string)`**
   ```typescript
   await api.deletePage(pageId);
   ```
   - Requests `DELETE /api/pages/:id`
   - Returns confirmation response

**Important:**
- `getPages()` now returns the real backend array from `data.pages`
- `createPage()` / `updatePage()` now return `response.page` when available
- `website_id` is passed as `selectedWebsite.id`

---

## Step 5: Frontend Page Component - PagesPage.tsx

**Location:** `src/app/pages/pages/PagesPage.tsx`

**Purpose:** Provides the live pages CRUD UI using the backend API.

**Final Implementation:**
- Uses `useCMS()` for `selectedWebsite` and `currentLanguage`
- Uses `useAuth()` to enforce role-based actions
- Fetches pages from API on website or language change
- Handles create, update, delete, publish/unpublish
- Includes loading, empty, error, and notification states

### Key behaviors

- Fetch pages from backend:
  ```tsx
  const data = await api.getPages(selectedWebsite.id, currentLanguage);
  setPages(Array.isArray(data) ? data : []);
  ```
- Create page with website context:
  ```tsx
  website_id: selectedWebsite.id
  language: currentLanguage
  ```
- Publish/unpublish action includes `website_id` so backend validation passes
- Delete is hidden from `editor` role in UI, with backend authorization still enforced

### UI states supported
- Loading spinner while API fetches pages
- Error banner with retry button
- Empty state CTA when no pages exist
- Success notifications for create/update/delete/publish actions

---

## Data Flow Example: Creating a Page

```
User fills in modal form
         ↓
api.createPage({ title, slug, content, website_id, language, status })
         ↓
POST /api/pages with Authorization header
         ↓
PagesController::create() validates JWT and website access
         ↓
PageModel::createPage() inserts the page row
         ↓
Backend responds with { status: 'success', page: { ... } }
         ↓
PagesPage.tsx refreshes page list via api.getPages()
```

---

## Authentication & Authorization Flow

1. Login stores `cms_token` in localStorage
2. Frontend uses `getAuthHeaders()` on all protected requests
3. Backend extracts bearer token and validates JWT
4. Backend derives user ID from token payload
5. Page APIs verify user access to the requested website
6. Unauthorized or invalid access returns `401`

---

## Security Measures

✅ JWT authentication for all page endpoints  
✅ Website access validation before page read/update/delete  
✅ `website_id` passed from frontend as `selectedWebsite.id`  
✅ UI role-based controls plus backend enforcement  
✅ Backend always verifies the current user's permissions  

---

## Final Notes

This version is the working implementation of the Pages module with no frontend TypeScript errors and correct API shape handling. The frontend now uses real website IDs, requests the backend payload arrays properly, and clears stale website selections when a selected website is no longer available.


**Required:**
- Backend database tables: `pages`, `page_translations`, `user_website_access`
- PHP 7.4+ with PDO SQLite/MySQL support
- Frontend React app running on localhost:5173 (Vite dev server)
- Backend running on localhost:8000

**Test URLs:**
```
GET http://localhost:8000/api/pages?website_id=1&language=en
POST http://localhost:8000/api/pages (with JWT header)
PUT http://localhost:8000/api/pages/1 (with JWT header)
DELETE http://localhost:8000/api/pages/1 (with JWT header)
```

Use tools like Postman or cURL to test endpoints directly before testing in the UI.
