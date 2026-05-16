import { createBrowserRouter, Navigate } from 'react-router';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth pages
import { LoginPage } from './pages/auth/LoginPage';

// Dashboard pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { UsersPage } from './pages/users/UsersPage';
import { RolesPage } from './pages/roles/RolesPage';
import { WebsitesPage } from './pages/websites/WebsitesPage';
import { PagesPage } from './pages/pages/PagesPage';
import { ArticlesPage } from './pages/articles/ArticlesPage';
import { MediaPage } from './pages/media/MediaPage';
import { MenusPage } from './pages/menus/MenusPage';
import { TranslationsPage } from './pages/translations/TranslationsPage';
import { ThemePage } from './pages/theme/ThemePage';
import { SEOPage } from './pages/seo/SEOPage';
import { SiteSettingsPage } from './pages/settings/SiteSettingsPage';
import { GlobalSettingsPage } from './pages/settings/GlobalSettingsPage';
import { ActivityLogsPage } from './pages/activity/ActivityLogsPage';
import { PreviewPage } from './pages/preview/PreviewPage';
import { PublishPage } from './pages/publish/PublishPage';

// Public pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { ServicesPage } from './pages/public/ServicesPage';
import { ProjectsPage } from './pages/public/ProjectsPage';
import { BlogPage } from './pages/public/BlogPage';
import { ArticlePage } from './pages/public/ArticlePage';
import { ContactPage } from './pages/public/ContactPage';
import { RootRedirect } from './components/RootRedirect';
import { GuestRoute } from './components/GuestRoute';
import { EditorDashboard } from './pages/editor/EditorDashboard';

export const router = createBrowserRouter([
  {
  path: '/',
  element: <RootRedirect />,
},
  {
  path: '/login',
  element: (
    <GuestRoute>
      <AuthLayout />
    </GuestRoute>
  ),
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
        element: <ProtectedRoute allowedRoles={['editor']}><EditorDashboard/></ProtectedRoute>,
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
        element: <ProtectedRoute allowedRoles={['super_admin', 'admin', 'editor', 'editor']}><PreviewPage /></ProtectedRoute>,
      },
      {
        path: 'publish',
        element: <ProtectedRoute allowedRoles={['super_admin', 'admin', 'editor', 'editor']}><PublishPage /></ProtectedRoute>,
      },
    ],
  },
  {
    path: '/public',
    element: <PublicLayout />,
    children: [
      {
        path: 'Home',
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
    ],
  },
]);