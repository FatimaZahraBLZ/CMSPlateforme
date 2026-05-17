import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useCMS } from '../contexts/CMSContext';
import { Badge } from '../components/ui/Badge';
import { Logo } from '../components/Logo';
import { usePlatformSettings } from '../hooks/usePlatformSettings';
import {
  Aperture,
  LayoutDashboard,
  Globe,
  FileText,
  BookOpen,
  Image,
  Menu as MenuIcon,
  Languages,
  Palette,
  Search,
  Users,
  Shield,
  Settings,
  ScrollText,
  Eye,
  Rocket,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const { selectedWebsite, currentLanguage, setCurrentLanguage } = useCMS();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const websiteId = selectedWebsite?.id;
  const platformSettings = usePlatformSettings();
  

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

    const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['super_admin', 'admin'] },
    { path: '/editor', icon: Aperture, label: 'My websites', roles: ['editor'] },
    { path: '/users', icon: Users, label: 'Users', roles: ['super_admin', 'admin'] },
    { path: '/roles', icon: Shield, label: 'Roles & Permissions', roles: ['super_admin'] },
    { path: '/websites', icon: Globe, label: 'Websites', roles: ['super_admin', 'admin'] },
    { path: '/pages', icon: FileText, label: 'Pages', roles: ['super_admin', 'admin', 'editor'] },
    { path: '/articles', icon: BookOpen, label: 'Articles', roles: ['super_admin', 'admin', 'editor'] },
    { path: '/media', icon: Image, label: 'Media Library', roles: ['super_admin', 'admin', 'editor'] },
    { path: '/menus', icon: MenuIcon, label: 'Menus', roles: ['super_admin', 'admin', 'editor'] },
    { path: '/translations', icon: Languages, label: 'Translations', roles: ['super_admin', 'admin', 'editor'] },
    { path: '/theme', icon: Palette, label: 'Theme', roles: ['super_admin', 'admin', 'editor'] },
    { path: '/seo', icon: Search, label: 'SEO', roles: ['super_admin', 'admin', 'editor'] },
    { path: '/settings', icon: Settings, label: 'Site Settings', roles: ['super_admin', 'admin', 'editor'] },
    { path: '/global-settings', icon: Settings, label: 'Global Settings', roles: ['super_admin'] },
    { path: '/activity-logs', icon: ScrollText, label: 'Activity Logs', roles: ['super_admin'] },
  ];


  const filteredMenuItems = menuItems.filter(item =>
    user && item.roles.includes(user.role)
  );

  const roleColors = {
    super_admin: 'bg-purple-100 text-purple-800',
    admin: 'bg-blue-100 text-blue-800',
    editor: 'bg-green-100 text-green-800',
    visitor: 'bg-gray-100 text-gray-800',
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 text-sm">Restoring session...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center overflow-hidden">
  {platformSettings.platform_logo ? (
    <img
      src={platformSettings.platform_logo}
      alt={platformSettings.platform_name || 'Platform logo'}
      className="w-10 h-10 object-contain"
    />
  ) : (
    <Logo className="w-10 h-10" alt="CMS logo" />
  )}
</div>

<div>
  <h2 className="font-bold text-gray-900">
    {platformSettings.platform_name || 'CMS Platform'}
  </h2>
  <p className="text-xs text-gray-500">Platform</p>
</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-gray-200 space-y-1">
            <Link
              to="/preview"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Eye className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>Preview</span>}
            </Link>
            <Link
              to="/publish"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
            >
              <Rocket className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>Publish Center</span>}
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              {selectedWebsite ? (
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{selectedWebsite.name}</h1>
                  <p className="text-sm text-gray-500">{selectedWebsite.domain}</p>
                </div>
              ) : (
                <h1 className="text-xl font-semibold text-gray-900">Select a website to manage</h1>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Language Switcher */}
              {selectedWebsite && (
                <div className="flex gap-2">
                  {['en', 'fr', 'ar'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setCurrentLanguage(lang as 'en' | 'fr' | 'ar')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        currentLanguage === lang
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}

              {/* User Info */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <Badge variant="info" className={`${user ? roleColors[user.role] : ''} text-xs`}>
                    {user?.role.replace('_', ' ')}
                  </Badge>
                </div>
                <img
                  src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full border-2 border-gray-200"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
