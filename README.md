# CMS Platform Frontend

A comprehensive CMS platform built with React, TypeScript, and Tailwind CSS for managing multiple client websites.

## Features

### Authentication
- Login system with role-based access
- Demo credentials:
  - Admin: `admin@cms.com` / `admin`
  - Editor: `editor@cms.com` / `editor`
- Session management with localStorage

### Dashboard
- Overview statistics
- Recent activity feed
- Quick actions
- Website selection

### Website Management
- Create and manage multiple websites
- Configure domain, languages, and themes
- Status tracking (draft/published)

### Content Management
- **Pages**: Create and manage website pages with SEO settings
- **Articles**: Blog/news management with categories
- **Media Library**: Upload and organize images, videos, documents
- **Menus**: Build header and footer navigation menus
- **Translations**: Multi-language support (EN, FR, AR)

### Customization
- **Theme Editor**: Customize colors, typography, and layout
- **SEO Settings**: Meta tags, social media, analytics integration
- **Homepage Builder**: Configure homepage sections

### Publishing
- Preview website before publishing
- Device preview (desktop, tablet, mobile)
- Language switcher
- Pre-publish checklist
- One-click publish

### User Management
- Create and manage users
- Role-based permissions:
  - **Super Admin**: Full access
  - **Admin**: Manage content, settings, publish
  - **Editor**: Manage content and media only
  - **Visitor**: Public website access only

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Project Structure

```
src/app/
├── components/          # Reusable UI components
│   └── ui/             # Button, Card, Input, Modal, etc.
├── contexts/           # React contexts
│   ├── AuthContext.tsx
│   └── CMSContext.tsx
├── layouts/            # Page layouts
│   ├── AuthLayout.tsx
│   ├── DashboardLayout.tsx
│   └── PublicLayout.tsx
├── pages/              # Page components
│   ├── auth/           # Login
│   ├── dashboard/      # Dashboard home
│   ├── websites/       # Website management
│   ├── pages/          # Pages management
│   ├── articles/       # Articles management
│   ├── media/          # Media library
│   ├── menus/          # Menu builder
│   ├── translations/   # Translations
│   ├── theme/          # Theme settings
│   ├── seo/            # SEO settings
│   ├── users/          # User management
│   ├── preview/        # Preview mode
│   ├── publish/        # Publish workflow
│   └── public/         # Public website pages
├── services/           # API and data services
│   ├── api.ts          # API service (ready for PHP backend)
│   └── mockData.ts     # Mock data
├── types/              # TypeScript types
│   └── index.ts
├── App.tsx             # Main app component
└── routes.ts           # Route configuration
```

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Start development server:
```bash
pnpm dev
```

3. Login with demo credentials:
   - Admin: `admin@cms.com` / `admin`
   - Editor: `editor@cms.com` / `editor`

## Backend Integration

The frontend is ready to connect to a PHP backend API. The `src/app/services/api.ts` file provides a structure for all API calls:

- Authentication endpoints
- Website CRUD operations
- Content management (pages, articles, media)
- User management
- Settings and configuration
- Publishing workflow

Replace the mock implementations with actual API calls to your PHP backend.

## Key Workflows

### 1. Website Creation Flow
1. Navigate to "Websites"
2. Click "Create Website"
3. Fill in details (name, client, domain, language)
4. Select the website to start managing it

### 2. Content Management Flow
1. Select a website from the Websites page
2. Create pages in the "Pages" section
3. Add articles in the "Articles" section
4. Upload media in the "Media Library"
5. Configure menus in "Menus"
6. Add translations for multilingual support

### 3. Publishing Flow
1. Configure theme and SEO settings
2. Preview the website (desktop/tablet/mobile)
3. Check the publish checklist
4. Click "Publish Website"

## Responsive Design

The CMS is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1280px+)
- Tablet (768px+)
- Mobile (375px+)

## Role-Based Access

Different user roles have different permissions:
- **Super Admin**: Access to all features
- **Admin**: Cannot manage other super admins
- **Editor**: Limited to content and media management
- **Visitor**: Public website access only

## Future Enhancements

- Real-time collaboration
- Version control for content
- Advanced media editing
- Built-in form builder
- Email templates
- Webhook integration
- Advanced analytics dashboard
- Content scheduling
- A/B testing
- CDN integration

## License

Proprietary - All rights reserved by fatima ezzahra boulouiz
