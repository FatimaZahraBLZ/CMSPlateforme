import React, { useMemo } from 'react';
import { RouterProvider, createBrowserRouter, Navigate, useNavigate } from 'react-router';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { SuperAdminLayout } from '../layouts/SuperAdminLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { EditorLayout } from '../layouts/EditorLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { SubdomainService } from '../services/SubdomainService';
import { useAuth } from '../contexts/AuthContext';

// Auth pages
import { LoginPage } from '../pages/auth/LoginPage';

// Dashboard pages
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { EditorDashboard } from '../pages/editor/EditorDashboard';
import { UsersPage } from '../pages/users/UsersPage';
import { RolesPage } from '../pages/roles/RolesPage';
import { WebsitesPage } from '../pages/websites/WebsitesPage';
import { WebsiteDetailsPage } from '../pages/websites/WebsiteDetailsPage';
import { PagesPage } from '../pages/pages/PagesPage';
import { ArticlesPage } from '../pages/articles/ArticlesPage';
import { MediaPage } from '../pages/media/MediaPage';
import { MenusPage } from '../pages/menus/MenusPage';
import { TranslationsPage } from '../pages/translations/TranslationsPage';
import { ThemePage } from '../pages/theme/ThemePage';
import { SEOPage } from '../pages/seo/SEOPage';
import { SiteSettingsPage } from '../pages/settings/SiteSettingsPage';
import { GlobalSettingsPage } from '../pages/settings/GlobalSettingsPage';
import { ActivityLogsPage } from '../pages/activity/ActivityLogsPage';
import { PreviewPage } from '../pages/preview/PreviewPage';
import { PublishPage } from '../pages/publish/PublishPage';

// Public pages
import { HomePage } from '../pages/public/HomePage';
import { AboutPage } from '../pages/public/AboutPage';
import { ServicesPage } from '../pages/public/ServicesPage';
import { ProjectsPage } from '../pages/public/ProjectsPage';
import { BlogPage } from '../pages/public/BlogPage';
import { ArticlePage } from '../pages/public/ArticlePage';
import { ContactPage } from '../pages/public/ContactPage';
import { PublicPage } from '../pages/public/PublicPage';

// Role Redirect Component
const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route based on user role
  if (user.role === 'super_admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user.role === 'admin') {
    return <Navigate to="/manage/dashboard" replace />;
  } else if (user.role === 'editor') {
    return <Navigate to="/editor" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

// CMS Router (for main platform and admin subdomains)
const cmsRouter = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        Component: LoginPage,
      },
    ],
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        path: 'dashboard',
        element: <ProtectedRoute allowedRoles={['super_admin', 'admin', 'editor']}><DashboardPage /></ProtectedRoute>,
      },
            {
        path: 'editor',
        element: <ProtectedRoute allowedRoles={['editor']}><EditorDashboard /></ProtectedRoute>,
      },
      {
        path: 'users',
        element: <ProtectedRoute allowedRoles={['super_admin', 'admin']}><UsersPage /></ProtectedRoute>,
      },
      {
        path: 'roles',
        element: <ProtectedRoute allowedRoles={['super_admin']}><RolesPage /></ProtectedRoute>,
      },
      {
        path: 'websites',
        element: <ProtectedRoute allowedRoles={['super_admin', 'admin']}><WebsitesPage /></ProtectedRoute>,
      },
      {
        path: 'websites/:id',
        element: <ProtectedRoute allowedRoles={['super_admin', 'admin']}><WebsiteDetailsPage /></ProtectedRoute>,
      },
      {
        path: 'pages',
        element: <ProtectedRoute allowedRoles={['super_admin', 'admin', 'editor']}><PagesPage /></ProtectedRoute>,
      },
      {
        path: 'articles',
        element: <ProtectedRoute allowedRoles={['super_admin', 'admin', 'editor']}><ArticlesPage /></ProtectedRoute>,
      },
      {
        path: 'media',
        element: <ProtectedRoute allowedRoles={['super_admin', 'admin', 'editor']}><MediaPage /></ProtectedRoute>,
      },
      {
        path: 'menus',
        element: <ProtectedRoute allowedRoles={['super_admin', 'admin', 'editor']}><MenusPage /></ProtectedRoute>,
      },
      {
        path: 'translations',
        element: <ProtectedRoute allowedRoles={['super_admin', 'admin', 'editor']}><TranslationsPage /></ProtectedRoute>,
      },
      {
        path: 'theme',
        element: <ProtectedRoute allowedRoles={['super_admin', 'admin', 'editor']}><ThemePage /></ProtectedRoute>,
      },
      {
        path: 'seo',
        element: <ProtectedRoute allowedRoles={['super_admin', 'admin', 'editor']}><SEOPage /></ProtectedRoute>,
      },
      {
        path: 'settings',
        element: <ProtectedRoute allowedRoles={['super_admin', 'admin', 'editor']}><SiteSettingsPage /></ProtectedRoute>,
      },
      {
        path: 'global-settings',
        element: <ProtectedRoute allowedRoles={['super_admin']}><GlobalSettingsPage /></ProtectedRoute>,
      },
      {
        path: 'activity-logs',
        element: <ProtectedRoute allowedRoles={['super_admin']}><ActivityLogsPage /></ProtectedRoute>,
      },
      {
        path: 'preview',
        element: <ProtectedRoute allowedRoles={['super_admin', 'admin', 'editor']}><PreviewPage /></ProtectedRoute>,
      },
      {
        path: 'publish',
        element: <ProtectedRoute allowedRoles={['super_admin', 'admin', 'editor']}><PublishPage /></ProtectedRoute>,
      },
    ],
  },
  // Fallback for CMS - redirect to login
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

// Public Router (for client subdomains)
const publicRouter = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: 'about',
        Component: AboutPage,
      },
      {
        path: 'services',
        Component: ServicesPage,
      },
      {
        path: 'projects',
        Component: ProjectsPage,
      },
      {
        path: 'blog',
        Component: BlogPage,
      },
      {
        path: 'blog/:id',
        Component: ArticlePage,
      },
      {
        path: 'contact',
        Component: ContactPage,
      },
      // Dynamic page routing for published pages
      {
        path: ':slug',
        Component: PublicPage,
      },
    ],
  },
  // Fallback for public - redirect to home
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export const SubdomainRouter: React.FC = () => {
  const router = useMemo(() => {
    const subdomain = SubdomainService.getSubdomain();

    // Client subdomain (not 'admin' and not null) → show public website
    if (subdomain && subdomain !== 'admin') {
      console.log(`🌐 Public website detected: ${subdomain}`);
      return publicRouter;
    }

    // Main platform or admin subdomain → show CMS dashboard
    console.log('🏢 CMS platform detected');
    return cmsRouter;
  }, []);

  return <RouterProvider router={router} />;
};