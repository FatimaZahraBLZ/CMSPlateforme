import { createBrowserRouter, Navigate } from 'react-router';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { PublicLayout } from './layouts/PublicLayout';

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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
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
        Component: DashboardPage,
      },
      {
        path: 'users',
        Component: UsersPage,
      },
      {
        path: 'roles',
        Component: RolesPage,
      },
      {
        path: 'websites',
        Component: WebsitesPage,
      },
      {
        path: 'pages',
        Component: PagesPage,
      },
      {
        path: 'articles',
        Component: ArticlesPage,
      },
      {
        path: 'media',
        Component: MediaPage,
      },
      {
        path: 'menus',
        Component: MenusPage,
      },
      {
        path: 'translations',
        Component: TranslationsPage,
      },
      {
        path: 'theme',
        Component: ThemePage,
      },
      {
        path: 'seo',
        Component: SEOPage,
      },
      {
        path: 'settings',
        Component: SiteSettingsPage,
      },
      {
        path: 'global-settings',
        Component: GlobalSettingsPage,
      },
      {
        path: 'activity-logs',
        Component: ActivityLogsPage,
      },
      {
        path: 'preview',
        Component: PreviewPage,
      },
      {
        path: 'publish',
        Component: PublishPage,
      },
    ],
  },
  {
    path: '/public',
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
    ],
  },
]);
