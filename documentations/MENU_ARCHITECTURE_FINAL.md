# Menu Architecture - Final Design Documentation

## Overview

The CMS uses a unified menu system for both **Header** and **Footer**, with support for dynamic CTAs in the header only. Everything is database-driven - no hardcoded navigation.

---

## Database Schema

### Tables Used

```
menus
├── id (UUID)
├── website_id (UUID)
├── type ('header' | 'footer')
├── language (e.g., 'en', 'fr')
├── name (e.g., "Header Menu", "Footer Menu")
├── has_button (boolean) - Header only
├── button_label
├── button_type ('page' | 'link' | 'phone')
├── button_page_id
├── button_link
├── button_phone
├── button_color
└── [timestamps]

menu_items
├── id (UUID)
├── menu_id (FK → menus.id)
├── label (Display text)
├── section_name (Optional - for footer grouping)
├── type ('page' | 'external' | 'custom')
├── page_id (FK → pages.id for 'page' type)
├── link (URL for 'external' or 'custom')
├── order_position (Sort order)
├── is_active (boolean)
└── [timestamps]
```

### Key Fields

- **section_name**: Allows footer items to be grouped into columns
  - Examples: "Company", "Services", "Legal", "Resources"
  - NULL for header items (header doesn't use sections)
  - Enables professional multi-column footers

---

## Header Menu

### Features

✅ Dynamic navigation links  
✅ Optional Primary CTA Button  
✅ Button text customizable  
✅ Button destination: Page, External Link, or Phone  
✅ Button styling (color)  

### Common Button Labels

- "Contact Us"
- "Book Appointment"
- "Get Started"
- "Login"
- "Sign Up"

### Schema

```sql
menus (type='header')
└── menu_items (no section_name)
    ├── Contact
    ├── About
    ├── Services
    └── [optional CTA button in header menu itself]
```

### Frontend Rendering

```jsx
<header>
  <nav>
    {/* Navigation items from menu_items */}
    {headerMenuItems.map(item => <Link>{item.label}</Link>)}
  </nav>
  
  {/* CTA Button - if enabled */}
  {headerMenu?.has_button && <Link>{headerMenu.button_label}</Link>}
</header>
```

---

## Footer Menu

### Features

✅ Grouped menu items by section  
✅ Contact information  
✅ Social links  
✅ Copyright  
❌ NO CTA button (unnecessary)  

### Professional Structure Example

```
Footer
├── Company
│   ├── About
│   ├── Careers
│   └── Blog
├── Services
│   ├── Web Design
│   ├── Development
│   └── SEO
├── Legal
│   ├── Privacy Policy
│   └── Terms of Service
└── Contact
    └── help@example.com
```

### Schema

```sql
menus (type='footer')
└── menu_items (with section_name)
    ├── { label: "About", section_name: "Company" }
    ├── { label: "Careers", section_name: "Company" }
    ├── { label: "Web Design", section_name: "Services" }
    ├── { label: "Privacy", section_name: "Legal" }
    └── ...
```

### Frontend Rendering

```jsx
<footer>
  {/* Group items by section_name */}
  {groupedSections.map(section => (
    <div>
      <h3>{section.name}</h3>
      <ul>
        {section.items.map(item => <Link>{item.label}</Link>)}
      </ul>
    </div>
  ))}
</footer>
```

---

## CMS UI Structure

### Header Tab
Features available:
- ✅ Reorder menu items (drag-drop)
- ✅ Add menu item
- ✅ Delete menu item
- ✅ Edit CTA button settings
  - Toggle enable/disable
  - Set button text
  - Choose destination (page, link, phone)
  - Set button color

### Footer Tab
Features available:
- ✅ Reorder menu items
- ✅ Add menu item
- ✅ Delete menu item
- ✅ Set section name (for grouping)
- ❌ NO button settings (intentionally excluded)

---

## Critical Architectural Rules

### Rule 1: Everything from Database
```
Database → Website

No hardcoded links.
Add in CMS → instantly visible
Delete in CMS → disappears
Reorder in CMS → reordered live
Change in CMS → updated instantly
```

### Rule 2: No Button in Footer
```
Header = Links + Optional CTA
Footer = Links Only (organized by section)

Footer buttons = clutter
Better to focus on clear navigation
```

### Rule 3: Same Table for Both
```
menus
├── header (1 per website per language)
└── footer (1 per website per language)

menu_items
├── header items (no section_name)
└── footer items (with section_name)

One table. Clean. Scalable.
```

### Rule 4: Sections are Optional
```
menu_items.section_name

For header: Always NULL
For footer: Can be NULL or a section name

If NULL in footer: Item appears ungrouped
If set: Item grouped in that section
```

---

## Migration Checklist

- [x] Create menus table with button fields (header)
- [x] Create menu_items table with base fields
- [x] Create migration for add_menu_button_fields.php
- [x] Create migration for add_footer_section_name.php (NEW)
- [ ] Run: `/api/setup` to apply migrations
- [ ] Test header button functionality
- [ ] Test footer with section grouping
- [ ] Update MenuModel to handle section_name
- [ ] Update frontend to group footer by section

---

## API Endpoints

### Public Endpoints

```
GET /api/public/menus?website_id=XXX&type=header&language=en
GET /api/public/menus?website_id=XXX&type=footer&language=en
```

Returns:
```json
{
  "status": "success",
  "menus": [{
    "id": "xxx",
    "type": "header|footer",
    "name": "Header Menu",
    "has_button": true,
    "button_label": "Get Started",
    "button_type": "link",
    "button_link": "https://...",
    "button_color": "primary",
    "items": [
      {
        "id": "yyy",
        "label": "About",
        "type": "page",
        "page_slug": "about",
        "section_name": null,
        "order_position": 1
      }
    ]
  }]
}
```

### Admin Endpoints

```
PUT /api/menus/:menuId?website_id=XXX
  - Update button settings
  - Update menu name

POST /api/menus/:menuId/items
  - Add item with section_name

PUT /api/menus/:menuId/items/:itemId
  - Update section_name for footer grouping
  - Reorder
```

---

## Frontend Implementation

### Current Status
✅ Header with dynamic button  
✅ Footer with items  
⏳ Footer section grouping (ready to implement)

### Next: Footer Section Grouping

```tsx
// Group footer items by section_name
const groupedFooter = footerItems.reduce((acc, item) => {
  const section = item.section_name || 'Other';
  if (!acc[section]) acc[section] = [];
  acc[section].push(item);
  return acc;
}, {});

// Render sections
Object.entries(groupedFooter).map(([section, items]) => (
  <div key={section}>
    <h3>{section}</h3>
    <ul>
      {items.map(item => <li><Link>{item.label}</Link></li>)}
    </ul>
  </div>
))
```

---

## Empty State Messages

### Header Menu Empty
```
Your header navigation is empty.
Add links to pages, external URLs, or create new pages.
```

### Footer Menu Empty
```
Your footer is empty.
Add links to policies, services, contact info, or company pages.
Organize them into sections (Company, Legal, Services, etc.)
```

---

## Future Enhancements

### Phase 2: Footer Customization
- [ ] Newsletter signup in footer
- [ ] Contact form section
- [ ] Social media icons configuration
- [ ] Copyright year automation

### Phase 3: Advanced Grouping
- [ ] Multi-level menu items (parent/child)
- [ ] Icon support for items
- [ ] Item descriptions/subtitles

### Phase 4: Personalization
- [ ] Show/hide items per user role
- [ ] A/B test different menu layouts
- [ ] Analytics on menu clicks

---

## Summary

**Header Menu**: Navigation + Optional CTA button  
**Footer Menu**: Grouped navigation, no button  
**Architecture**: One menus table, one menu_items table, database-driven  
**Key Field**: `section_name` for footer grouping (optional)  
**Rule**: Everything from database, nothing hardcoded  

This is the professional, scalable CMS menu system.
