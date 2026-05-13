# Menu Button Configuration - Complete Implementation Guide

## Overview
This implementation adds optional button support to menus. Each menu (Header/Footer) can have a single button that links to a page, external URL, or phone number.

## Database Changes

### Migration Script
Run the migration to add button fields to the menus table:

```
File: backend/migrations/add_menu_button_fields.php
GET request: /api/setup or run directly via PHP CLI
```

**New Columns Added:**
- `has_button` (BOOLEAN) - Whether button is enabled
- `button_label` (VARCHAR(255)) - Button display text
- `button_type` (ENUM('page', 'link', 'phone')) - Link type
- `button_page_id` (CHAR(36)) - Foreign key to pages table (if type='page')
- `button_link` (VARCHAR(500)) - URL (if type='link')
- `button_phone` (VARCHAR(20)) - Phone number (if type='phone')
- `button_color` (VARCHAR(50)) - Button styling/color

## Backend Implementation

### 1. MenuModel Updates
**File:** `backend/models/MenuModel.php`

**Methods Updated:**
- `getMenuById()` - Now returns button fields
- `getMenusForWebsite()` - Now returns button fields
- `getMenuByType()` - Now returns button fields
- `updateMenu()` - Now accepts and saves button data

**Example Usage:**
```php
$menuModel->updateMenu($menuId, [
    'name' => 'Footer Links',
    'has_button' => true,
    'button_label' => 'Get Started',
    'button_type' => 'link',
    'button_link' => 'https://example.com/get-started',
    'button_color' => 'primary'
]);
```

### 2. MenuController Updates
**File:** `backend/controllers/MenuController.php`

**Endpoint:**
- `PUT /api/menus/{menuId}?website_id=xxx` - Update menu including button

**Example Request:**
```javascript
fetch(`/api/menus/${menuId}?website_id=${websiteId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    has_button: true,
    button_label: 'Prendre Rendez-vous',
    button_type: 'phone',
    button_phone: '+33123456789',
    button_color: 'primary'
  })
});
```

### 3. PublicController Updates
**File:** `backend/controllers/PublicController.php`

**New Method:**
- `getPublishedMenuWithButton()` - Returns menu with button data for public website

**Endpoint Response:**
The page API now returns:
```json
{
  "status": "success",
  "navigation": {
    "header": {
      "id": "xxx",
      "name": "Header Menu",
      "type": "header",
      "has_button": true,
      "button_label": "Get Started",
      "button_type": "link",
      "button_link": "https://example.com",
      "button_color": "primary",
      "items": [...]
    },
    "footer": {
      "id": "yyy",
      "name": "Footer Menu",
      "type": "footer",
      "has_button": true,
      "button_label": "Contact Us",
      "button_type": "phone",
      "button_phone": "+33123456789",
      "button_color": "primary",
      "items": [...]
    }
  }
}
```

## Frontend Implementation

### 1. MenusPage Component Updates
**File:** `src/app/pages/menus/MenusPage.tsx`

**New State:**
```typescript
const [editingButton, setEditingButton] = useState(false);
const [buttonData, setButtonData] = useState({
  has_button: false,
  button_label: '',
  button_type: 'link' as 'page' | 'link' | 'phone',
  button_page_id: '',
  button_link: '',
  button_phone: '',
  button_color: 'primary',
});
```

**New Handler:**
- `handleUpdateButton()` - Saves button configuration to backend

**New UI Card:**
A "Menu Button" card with options to:
- Enable/disable button
- Enter button label
- Choose link type (Page, URL, Phone)
- Conditional fields based on link type
- Select button color/style

**UI Preview:**
When enabled, shows a preview of the button with:
- Button label
- Link destination
- Color style

## Frontend Rendering (Public Website)

### Example React Component
```typescript
interface MenuButton {
  has_button: boolean;
  button_label: string;
  button_type: 'page' | 'link' | 'phone';
  button_link?: string;
  button_phone?: string;
  button_slug?: string;
  button_color?: string;
}

const MenuButtonComponent: React.FC<{ button: MenuButton }> = ({ button }) => {
  if (!button.has_button) return null;

  let href = '#';
  if (button.button_type === 'page') {
    href = `/${button.button_slug}`;
  } else if (button.button_type === 'link') {
    href = button.button_link || '#';
  } else if (button.button_type === 'phone') {
    href = `tel:${button.button_phone?.replace(/\s/g, '')}`;
  }

  const colorClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-orange-600 hover:bg-orange-700 text-white',
  };

  return (
    <a
      href={href}
      className={`inline-block px-6 py-2 rounded font-medium transition-colors ${
        colorClasses[button.button_color] || colorClasses.primary
      }`}
    >
      {button.button_label}
    </a>
  );
};
```

## Usage Examples

### Example 1: Header with "Get Started" Button
```
Button Label: "Get Started"
Link Type: External Link
URL: https://example.com/get-started
Color: Primary (Blue)
```

### Example 2: Footer with "Call Us" Button
```
Button Label: "Prendre Rendez-vous"
Link Type: Phone Number
Phone: +33 (0)1 23 45 67 89
Color: Success (Green)
```

### Example 3: Footer with Contact Page Button
```
Button Label: "Contact"
Link Type: Link to Page
Page: Contact (auto-generates /contact)
Color: Secondary (Gray)
```

## Testing

1. **Admin UI Testing:**
   - Open MenusPage
   - Click "Menu Button" section
   - Toggle "Enable Button"
   - Fill in button details
   - Click "Save Button"
   - Verify button appears in preview

2. **API Testing:**
   ```bash
   curl -X PUT "http://localhost:5000/api/menus/{menuId}?website_id={websiteId}" \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json" \
     -d '{"button_label": "Click Me", "has_button": true, "button_type": "link", "button_link": "https://example.com"}'
   ```

3. **Published Site Testing:**
   - Fetch menu from public API
   - Verify button data is included
   - Render button dynamically
   - Test all three link types (page, URL, phone)

## Database Structure

```sql
ALTER TABLE menus ADD COLUMN (
    has_button BOOLEAN DEFAULT FALSE,
    button_label VARCHAR(255) DEFAULT NULL,
    button_type ENUM('page', 'link', 'phone') DEFAULT NULL,
    button_page_id CHAR(36) DEFAULT NULL,
    button_link VARCHAR(500) DEFAULT NULL,
    button_phone VARCHAR(20) DEFAULT NULL,
    button_color VARCHAR(50) DEFAULT 'primary'
);

ALTER TABLE menus 
ADD CONSTRAINT fk_menus_button_page 
FOREIGN KEY (button_page_id) REFERENCES pages(id) ON DELETE SET NULL;
```

## Key Features

✅ **Optional Buttons** - Not required, buttons only show if enabled
✅ **Multiple Link Types** - Page links, external URLs, phone numbers
✅ **Dynamic Rendering** - Published site renders button only if enabled
✅ **Customizable Style** - 5 color options
✅ **Admin UI** - Intuitive configuration in MenusPage
✅ **Backward Compatible** - Existing menus work without changes
✅ **Responsive** - Button data works on mobile and desktop
✅ **SEO Friendly** - Page links use proper slugs

## File Changes Summary

**Backend:**
- `backend/migrations/add_menu_button_fields.php` (NEW)
- `backend/models/MenuModel.php` (UPDATED)
- `backend/controllers/MenuController.php` (ALREADY HAS updateMenu)
- `backend/controllers/PublicController.php` (UPDATED)

**Frontend:**
- `src/app/pages/menus/MenusPage.tsx` (UPDATED)

## Migration Steps

1. Run the migration script to add database columns
2. Update backend files as shown
3. Update frontend MenusPage component
4. Test in admin UI
5. Test on published website
6. Deploy to production
