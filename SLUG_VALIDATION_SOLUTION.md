# Slug Conflict Resolution - Complete Implementation

## Problem Analysis

**Error**: "Page slug already exists for this language"

**Root Cause**: 
- Database constraint `UNIQUE KEY unique_website_slug_language (website_id, slug, language)` prevents duplicate slugs within the same website/language combination
- Frontend had no validation to check slug availability before attempting to save
- Users were unaware of conflicts until after attempting to save

**Database State**: 
- Unique constraint correctly enforces: (website_id, slug, language) combination must be unique
- No duplicate slugs currently exist in the database
- Constraint is working as designed

## Solution Implemented

### 1. Backend Changes

#### Added Method to PageModel (`backend/models/PageModel.php`)
```php
public function slugExists(string $websiteId, string $slug, string $language, ?string $excludePageId = null): bool
{
    if ($excludePageId) {
        $stmt = $this->pdo->prepare(
            'SELECT 1 FROM pages WHERE website_id = ? AND slug = ? AND language = ? AND id != ? LIMIT 1'
        );
        $stmt->execute([$websiteId, $slug, $language, $excludePageId]);
    } else {
        $stmt = $this->pdo->prepare(
            'SELECT 1 FROM pages WHERE website_id = ? AND slug = ? AND language = ? LIMIT 1'
        );
        $stmt->execute([$websiteId, $slug, $language]);
    }
    
    return $stmt->rowCount() > 0;
}
```

**Features**:
- Checks if a slug exists for a given website/language combination
- Supports excluding a page ID (for updates, allows the same page to keep its slug)
- Returns boolean indicating if slug is in use

#### Added Method to PagesController (`backend/controllers/PagesController.php`)
```php
public function checkSlug(): void
{
    // Validates JWT token and user permissions
    // Returns: { status: 'success', exists: boolean, slug: string }
}
```

**Features**:
- Validates user has access to the website
- Checks slug availability with language filtering
- Returns JSON response with availability status

#### Updated Router (`backend/index.php`)
```php
if ($path === '/api/pages/check-slug' && $method === 'GET') {
    $controller = new PagesController($pdo);
    $controller->checkSlug();
    exit;
}
```

**Endpoint**: `GET /api/pages/check-slug?website_id={id}&slug={slug}&language={lang}&exclude_id={pageId}`

### 2. Frontend Changes

#### Added API Method (`src/app/services/api.ts`)
```typescript
async checkPageSlug(websiteId: string, slug: string, language: string = 'en', excludePageId?: string) {
    // Calls the backend API endpoint
    // Returns: boolean indicating if slug exists
}
```

#### Updated PagesPage Component (`src/app/pages/pages/PagesPage.tsx`)

**Added State**:
- `slugError`: Tracks validation error message
- `checkingSlug`: Indicates if validation is in progress

**Added Validation Logic**:
- Debounced slug check (500ms) when slug changes
- Checks slug availability every time the slug field is modified
- Handles updates correctly by excluding the current page ID

**UI Enhancements**:
1. **Slug Input Field**:
   - Shows red border when slug conflict detected
   - Disabled during slug checking

2. **Validation Messages**:
   - "Checking availability..." during validation
   - Error message if slug is taken

3. **Save Buttons**:
   - Disabled if slug error exists
   - Disabled if slug check is in progress
   - Prevents submission with invalid slug

**Error Handling**:
- Prevents form submission if slug conflict detected
- Shows user-friendly error messages
- Allows editing to resolve conflicts

### 3. Testing

#### Backend Tests (`backend/test_slug_check.php`)
```
✅ Test 1: Slug 'home' exists in website → EXISTS
✅ Test 2: Non-existent slug 'unknown' → NOT FOUND  
✅ Test 3: Exclude page from check → NOT FOUND (correctly allows same slug for same page)
✅ Test 4: Slug 'home' in different website → EXISTS
✅ Test 5: Non-existent slug in different website → NOT FOUND
```

All tests pass successfully.

## User Workflow

### Creating a New Page
1. User clicks "Create Page"
2. User enters title → slug auto-generates
3. User modifies slug (if desired)
4. **Frontend validates slug**:
   - Debounced check after 500ms of no typing
   - Shows "Checking availability..." indicator
   - Shows error if slug already exists
5. Save buttons enabled only if slug is available
6. User saves page

### Editing a Page
1. User clicks "Edit" on existing page
2. Form pre-fills with current data
3. User modifies slug
4. **Frontend validates slug** (excludes current page):
   - Allows the same slug (since it's the same page)
   - Detects conflicts with other pages
5. Save buttons enabled only if slug is valid
6. User saves changes

### Slug Conflicts
If user tries to use an existing slug:
- Real-time validation shows error immediately
- User sees: "⚠️ Slug 'home' is already in use. Please choose a different one."
- Save buttons are disabled until conflict is resolved
- User must choose a different slug before saving

## Benefits

✅ **Prevents Errors**: Validates before submission, eliminating 409 errors
✅ **Real-Time Feedback**: User knows immediately if slug is available
✅ **Better UX**: Guides users to resolve conflicts proactively
✅ **Supports Updates**: Allows same slug when editing existing page
✅ **Multi-Website**: Works across multiple websites and languages
✅ **Debounced**: Efficient API calls (500ms debounce)
✅ **Clear Messages**: User-friendly error descriptions

## Implementation Details

### Slug Check Flow
```
User types slug
    ↓
Wait 500ms (debounce)
    ↓
Send: GET /api/pages/check-slug
    ↓
Backend validates JWT + permissions
    ↓
Database query: SELECT count FROM pages WHERE website_id=? AND slug=? AND language=? AND id!=excludeId
    ↓
Frontend receives: { exists: boolean }
    ↓
Update UI: Show error OR enable save buttons
```

### Unique Constraint
The database constraint remains unchanged:
```sql
UNIQUE KEY unique_website_slug_language (website_id, slug, language)
```

This ensures:
- Same slug can exist in different websites (✓)
- Same slug can exist in different languages (✓)
- Same slug cannot exist in same website + language (✓)

## Files Modified

1. `backend/models/PageModel.php` - Added `slugExists()` method
2. `backend/controllers/PagesController.php` - Added `checkSlug()` method
3. `backend/index.php` - Added route for `/api/pages/check-slug`
4. `src/app/services/api.ts` - Added `checkPageSlug()` method
5. `src/app/pages/pages/PagesPage.tsx` - Added slug validation UI

## Cleanup Files

- `backend/cleanup_duplicate_slugs.php` - Identifies duplicate slugs (if they occur)
- `backend/check_pages_duplicates.php` - Checks current database state
- `backend/test_slug_check.php` - Tests slug checking functionality

## Deployment Instructions

1. **Backend**: No database migration needed (uses existing constraint)
2. **Frontend**: Build will include new slug validation logic
3. **Testing**: Use browser dev tools Network tab to verify API calls
4. **Verification**: Try creating page with existing slug - should get error instead of 400

## Edge Cases Handled

✅ Creating new page with existing slug → Error (real-time)
✅ Updating page keeping same slug → Allowed (excludes self)
✅ Updating page with conflicting slug → Error (real-time)
✅ Slug check during async operation → Input disabled, buttons disabled
✅ Multiple websites with same slug → Works correctly (per website)
✅ Multiple languages with same slug → Works correctly (per language)

