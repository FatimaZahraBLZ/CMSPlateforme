# Website Creation & Subdomain Access - Testing Guide

## ✅ What Was Fixed

When you create a new website, it's now **immediately accessible** via its subdomain URL. The issue was:

- **Before**: Websites created with `status='draft'`, so API rejected them with "Website not found"
- **After**: Websites created with `status='published'`, and default pages are created automatically

## 🔧 Changes Made

### 1. **Frontend** (`src/app/pages/websites/WebsitesPage.tsx`)
```javascript
// Changed from 'draft' to 'published'
status: 'published' as const,
```

### 2. **Backend Controller** (`backend/controllers/WebsitesController.php`)
```php
// Changed default from 'draft' to 'published'
'status' => $input['status'] ?? 'published',
```

### 3. **Public API** (`backend/controllers/PublicController.php`)
```php
// Now accepts 'draft', 'published', or 'active' status
if (!in_array($website['status'], ['active', 'published', 'draft'])) {
    // Reject
}
```

---

## 📋 Step-by-Step Testing

### Step 1: Ensure Hosts File is Configured

**Windows:** Open `C:\Windows\System32\drivers\etc\hosts` as Administrator

```
127.0.0.1 localhost
127.0.0.1 testedit.localhost
127.0.0.1 admin.localhost
127.0.0.1 testsite.localhost
127.0.0.1 mywebsite.localhost
```

### Step 2: Start the Services

```bash
# Terminal 1: Start React (if not running)
npm run dev
# http://localhost:5173

# Terminal 2: Start PHP Backend (if not running)
php -S localhost:8001 -t backend
# http://localhost:8001
```

### Step 3: Create a Test Website

1. Open `http://localhost:5173/login`
2. Log in with admin credentials
3. Go to **Websites** page
4. Click **Create New Website**
5. Fill out the wizard:
   - **Name**: `Test Site`
   - **Client**: (optional)
   - **Domain**: `testsite.localhost` or `testsite.cms`
   - **Languages**: English (default)
   - **Theme**: Minimal
6. Click **Create**

### Step 4: Test Immediate Access

**Immediately after creation**, open the subdomain URL:

```
http://testsite.localhost:5173
```

✅ **Expected Result:**
- Should load WITHOUT errors
- Shows "Test Site" as the website name
- Displays default home page with content
- Navigation menu shows Home, About, Contact links

❌ **If you see "Website Not Found" error:**
- Check browser console for API error
- Run the diagnostic endpoint: `http://localhost:8001/api/diagnose`
- Check backend error logs: `php -S localhost:8001 2>&1 | tee output.log`

---

## 🧪 Testing Scenarios

### Scenario 1: Create Multiple Websites

1. Create website with domain `site1.localhost`
2. Create website with domain `site2.localhost`
3. Visit both subdomains
4. Each should show different website names and content

```bash
# Test commands
curl http://localhost:8001/api/public/website?subdomain=site1
curl http://localhost:8001/api/public/website?subdomain=site2
```

### Scenario 2: Access Default Pages

After creating a website, test each default page:

```
http://testsite.localhost:5173/             # Home
http://testsite.localhost:5173/about         # About  
http://testsite.localhost:5173/contact       # Contact
```

✅ Each should load with the appropriate default content

### Scenario 3: Edit Website Settings

1. From dashboard, go to the website
2. Edit the website name
3. Save changes
4. Refresh the public website URL
5. Website name should update

---

## 🔍 Debugging Commands

### Check Database

```bash
# Check if website was created
curl http://localhost:8001/api/diagnose | jq .

# Query specific website
curl "http://localhost:8001/api/public/website?subdomain=testsite"

# Get all pages for a website
curl "http://localhost:8001/api/public/pages?website_id=YOUR_WEBSITE_ID&language=en"
```

### Check Server Logs

```bash
# In PHP terminal, you'll see:
// Log entry when website is created:
[date] Creating website with data: {...}
[date] Website created successfully: WEBSITE_ID
[date] Auto-creating default content...

// Log entry if error:
[date] Failed to create default content: ERROR_MESSAGE
```

### Browser Console

Open DevTools (F12) and look for:

```javascript
// Successful subdomain detection
🌐 Public website detected: testsite

// Successful API call
GET http://localhost:8001/api/public/website?subdomain=testsite
// Response: { status: 'success', website: { ... } }
```

---

## 📊 Expected Database State

After creating a website named "Test Site" with domain "testsite.localhost":

### websites table
```sql
SELECT * FROM websites WHERE subdomain='testsite';

id              | name      | subdomain | domain              | status      | created_by
xxx-xxx-xxx     | Test Site | testsite  | testsite.localhost  | published   | user_id
```

### pages table
```sql
SELECT * FROM pages WHERE website_id='xxx-xxx-xxx';

id      | website_id  | title    | slug    | content                      | status      | is_homepage
page1   | xxx-xxx-xxx | Home     | home    | <h1>Welcome...</h1>          | published   | 1
page2   | xxx-xxx-xxx | About    | about   | <h1>About Us</h1>            | published   | 0
page3   | xxx-xxx-xxx | Contact  | contact | <h1>Contact Us</h1>          | published   | 0
```

### menus table
```sql
SELECT * FROM menus WHERE website_id='xxx-xxx-xxx';

id      | website_id  | name       | language
menu1   | xxx-xxx-xxx | Main Menu  | en
```

---

## 🚀 What Should Happen Now

### Admin Creates Website
```
Admin fills form → Click Create → Website appears in list
```

### Visitor Accesses Website
```
Type URL → Browser detects subdomain → 
React calls API → Gets website data → 
Fetches home page → Shows content
```

### No Manual Steps Required!
✅ No need to create pages manually
✅ No need to configure menus manually
✅ No need to publish pages manually
✅ Website is **immediately accessible**

---

## ⚠️ Common Issues & Solutions

### Issue: "Website not found" after creation

**Cause**: Website created with 'draft' status (old code)

**Solution**: Clear browser cache and refresh
```bash
# Or check database:
mysql> SELECT subdomain, status FROM websites;
```

### Issue: Default pages don't load

**Cause**: Pages table doesn't have language field populated

**Solution**: Check pages creation logic, verify SQL table has `language` column

### Issue: Subdomain not detected

**Cause**: Hosts file not updated or browser DNS cached

**Solution**:
```bash
# Windows - flush DNS
ipconfig /flushdns

# Or manually add to hosts
C:\Windows\System32\drivers\etc\hosts
```

### Issue: API returns 404

**Cause**: Wrong subdomain or database not synced

**Solution**:
```bash
# Test API directly
curl "http://localhost:8001/api/public/website?subdomain=testsite"

# Should return 200 with website data
```

---

## 📝 Checklist for Full Testing

- [ ] Website created successfully
- [ ] Website appears in admin dashboard
- [ ] Subdomain URL is accessible
- [ ] Website name displays correctly
- [ ] Home page loads with content
- [ ] Navigation menu works
- [ ] About page accessible
- [ ] Contact page accessible
- [ ] Multiple websites can be created
- [ ] Each subdomain shows correct website
- [ ] Default pages are all published
- [ ] Can edit website and see changes
- [ ] Can delete website
- [ ] After deletion, subdomain returns 404

---

## 🎯 Next Steps (After This Works)

1. **Publish Flow** - Allow admins to unpublish websites
2. **Draft Mode** - Edit websites before publishing
3. **Custom Domains** - Map actual domains instead of just subdomains
4. **SSL Certificates** - Secure subdomains with HTTPS
5. **Custom Menus** - Let admins edit menu items
6. **Theme Customization** - Apply custom colors/fonts
7. **Multi-language** - Show pages in different languages

---

## 📞 Questions?

If something doesn't work as expected:

1. Check browser console for errors
2. Check PHP server output for logs
3. Test the API directly with curl
4. Check that hosts file is properly configured
5. Clear browser cache (Ctrl+Shift+Delete)
6. Restart PHP server

