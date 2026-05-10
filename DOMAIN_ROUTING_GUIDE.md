# Domain-Based Routing Implementation Guide

## Overview

This implementation allows you to switch from subdomain-only routing (`subdomain.localhost`) to using full domain names stored in your database (`subdomain.cms` or any domain like `client.example.com`).

## Database Setup

### 1. Add UNIQUE Constraint on Domain Column

Run the migration to add a unique constraint:

```bash
php backend/migrations/add_domain_unique_constraint.php
```

**Database Schema**:
```sql
ALTER TABLE websites 
ADD CONSTRAINT unique_domain UNIQUE (domain);
```

**Why**: Ensures each website is assigned a unique domain, preventing conflicts.

## Backend Implementation

### 1. WebsiteModel Methods

Added methods to `backend/models/WebsiteModel.php`:

```php
// Check if domain is already in use
public function domainExists(string $domain, ?string $excludeWebsiteId = null): bool

// Get website by domain name
public function getWebsiteByDomain(string $domain): ?array
```

### 2. API Endpoints

#### Admin Endpoint: Check Domain Availability
```
GET /api/websites/check-domain?domain=client1.cms&exclude_id={websiteId}
```
- Returns: `{ status: 'success', exists: boolean, domain: string }`
- Used during website creation/editing to validate domain uniqueness

#### Public Endpoint: Get Website by Domain
```
GET /api/public/website-by-domain?domain=client1.cms
```
- Returns: `{ status: 'success', website: {...} }`
- Used for public website routing (replaces subdomain-based lookup)
- Alternative to: `GET /api/public/website?subdomain=client1`

## Frontend Implementation

### 1. API Methods (src/app/services/api.ts)

```typescript
// Check if domain is available (for website creation/editing)
async checkDomain(domain: string, excludeWebsiteId?: string): Promise<boolean>

// Get website data by domain (for public site access)
async getPublicWebsiteByDomain(domain: string): Promise<any>
```

### 2. SubdomainService Enhancements (src/app/services/subdomainService.ts)

New methods for domain-based routing:

```typescript
// Get current hostname (for database lookups)
static getCurrentDomain(): string

// Check if domain matches current location
static isDomainMatch(domain: string): boolean

// Build URL for domain-based location
static buildDomainUrl(domain: string): string
```

## Implementation Steps

### Step 1: Database Migration

```bash
cd backend
php migrations/add_domain_unique_constraint.php
```

**Output**:
- ✅ Constraint added successfully
- ⚠️  Or: "Cannot add constraint - duplicates found" (requires cleanup)

### Step 2: Update Website Creation Form

Add domain validation to `src/app/pages/websites/WebsitesPage.tsx`:

```typescript
const [domainError, setDomainError] = useState<string | null>(null);
const [checkingDomain, setCheckingDomain] = useState(false);

// Debounced domain check
useEffect(() => {
  if (!formData.domain) {
    setDomainError(null);
    return;
  }

  const timer = setTimeout(async () => {
    setCheckingDomain(true);
    try {
      const exists = await api.checkDomain(
        formData.domain,
        editingWebsiteId || undefined
      );
      if (exists) {
        setDomainError(`Domain "${formData.domain}" is already in use`);
      } else {
        setDomainError(null);
      }
    } finally {
      setCheckingDomain(false);
    }
  }, 500); // Debounce 500ms

  return () => clearTimeout(timer);
}, [formData.domain, editingWebsiteId]);
```

Add UI feedback:
```typescript
<Input
  label="Domain *"
  placeholder="client1.cms"
  value={formData.domain}
  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
  disabled={checkingDomain}
  className={domainError ? 'border-red-500' : ''}
/>
{checkingDomain && <p className="text-sm text-blue-600">Checking availability...</p>}
{domainError && <p className="text-sm text-red-600">⚠️ {domainError}</p>}

// Disable save button if domain conflict
<Button disabled={!!domainError || checkingDomain}>
  Create Website
</Button>
```

### Step 3: Update Public Layout for Domain Routing

Modify `src/app/layouts/PublicLayout.tsx` to support both subdomain and domain routing:

```typescript
useEffect(() => {
  const loadWebsite = async () => {
    try {
      // Try domain-based lookup first (if using domain routing)
      const domain = SubdomainService.getCurrentDomain();
      let response;
      
      // Option 1: Use domain lookup
      response = await api.getPublicWebsiteByDomain(domain);
      
      // Option 2: Fall back to subdomain lookup
      if (!response.website) {
        const subdomain = SubdomainService.getSubdomain();
        response = await api.getPublicWebsite(subdomain);
      }
      
      if (response.website) {
        setWebsite(response.website);
      }
    } catch (err) {
      setError('Failed to load website');
    }
  };

  loadWebsite();
}, []);
```

## Example Usage

### Creating a Website with Domain Validation

```typescript
// User fills in domain: "client1.cms"
// Frontend debounces and checks availability
// API Response: { exists: false, domain: "client1.cms" }
// UI: "✅ Domain available"
// User clicks Save
// Backend creates website with domain="client1.cms"
```

### Public Access via Domain

```
User visits: client1.cms
Browser requests: GET /api/public/website-by-domain?domain=client1.cms
Backend returns: { website: { id, name, domain: "client1.cms", ... } }
Frontend renders: Public site for client1
```

## Current Routes

### Admin API Routes
- `GET /api/websites` - List websites
- `POST /api/websites` - Create website
- `PUT /api/websites/{id}` - Update website
- `DELETE /api/websites/{id}` - Delete website
- `GET /api/websites/check-domain` - **NEW** Check domain availability

### Public API Routes
- `GET /api/public/website?subdomain={sub}` - Get website by subdomain (legacy)
- `GET /api/public/website-by-domain?domain={domain}` - **NEW** Get website by domain
- `GET /api/public/pages?website_id={id}` - Get pages for website
- `GET /api/public/page?website_id={id}&slug={slug}` - Get single page

## Comparison: Subdomain vs Domain Routing

### Current (Subdomain-Based)
```
URL: client1.localhost:5173
Extract subdomain: "client1"
Query: SELECT * FROM websites WHERE subdomain = 'client1'
```

### New (Domain-Based)
```
URL: client1.cms
Get domain: "client1.cms"
Query: SELECT * FROM websites WHERE domain = 'client1.cms'
```

## Migration from Subdomain to Domain

If you want to migrate existing websites:

1. **Ensure domain column is populated**:
```php
// If empty, populate from subdomain
UPDATE websites 
SET domain = CONCAT(subdomain, '.cms') 
WHERE domain IS NULL OR domain = '';
```

2. **Add UNIQUE constraint**:
```bash
php backend/migrations/add_domain_unique_constraint.php
```

3. **Update DNS** (for production):
```
*.cms → your-server-ip
client1.cms → your-server-ip
client2.cms → your-server-ip
```

4. **Test routing**:
- Visit `client1.cms` in browser
- Should load website with domain='client1.cms'

## Database Example

```
websites table:
┌─────────────────────────────────────────────────────┐
│ id  │ name       │ subdomain │ domain       │ status │
├─────┼────────────┼───────────┼──────────────┼────────┤
│ 1   │ Direct     │ direct    │ direct.cms   │ active │
│ 2   │ Testedit   │ testedit  │ testedit.cms │ active │
│ 3   │ Client One │ client1   │ client1.cms  │ active │
└─────────────────────────────────────────────────────┘

UNIQUE KEY: domain (unique_domain)
UNIQUE KEY: subdomain (if added previously)
```

## Testing

### Backend Testing

```php
// Test domain checking
$websiteModel = new WebsiteModel($pdo);

// Check if domain exists
$exists = $websiteModel->domainExists('client1.cms');
// Returns: true

// Check excluding a website
$exists = $websiteModel->domainExists('client1.cms', $websiteId);
// Returns: false if checking the same website

// Get website by domain
$website = $websiteModel->getWebsiteByDomain('client1.cms');
// Returns: array with website data
```

### API Testing

```bash
# Check domain availability
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8001/api/websites/check-domain?domain=newsite.cms"

# Get website by domain (public, no auth)
curl "http://localhost:8001/api/public/website-by-domain?domain=client1.cms"
```

## Files Modified

### Backend
- `backend/models/WebsiteModel.php` - Added domain methods
- `backend/controllers/WebsitesController.php` - Added checkDomain endpoint
- `backend/controllers/PublicController.php` - Added getWebsiteByDomain endpoint
- `backend/index.php` - Added new routes
- `backend/migrations/add_domain_unique_constraint.php` - New migration

### Frontend
- `src/app/services/api.ts` - Added domain API methods
- `src/app/services/subdomainService.ts` - Added domain utilities
- `src/app/pages/websites/WebsitesPage.tsx` - Add domain validation (TODO)

## Benefits

✅ **Flexibility**: Use any domain name for your sites
✅ **Production-Ready**: Works with real domains like client.example.com
✅ **Uniqueness**: Database ensures no duplicate domains
✅ **Real-Time Validation**: Immediate feedback during website creation
✅ **Backward Compatible**: Both subdomain and domain routing can coexist
✅ **Better UX**: Users choose their exact domain name

## Troubleshooting

### "Domain already exists" during migration
```php
// Find duplicates
SELECT domain, COUNT(*) as cnt 
FROM websites 
GROUP BY domain 
HAVING cnt > 1;

// Resolve by renaming some domains
UPDATE websites SET domain = CONCAT(domain, '_old') 
WHERE id IN (select id from duplicates);
```

### Constraint already exists
The migration script checks and reports if constraint already exists.

### Domain not found in public
- Verify domain exists in database: `SELECT * FROM websites WHERE domain = 'xxx.cms'`
- Check website status is 'active', 'published', or 'draft'
- Verify DNS/hosts file points to correct server

