import React, { useState } from 'react';
import { Outlet } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, LogOut, Settings } from 'lucide-react';

export const SuperAdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: '📊',
      href: '/dashboard',
    },
    {
      label: 'Users',
      icon: '👥',
      href: '/users',
    },
    {
      label: 'Websites',
      icon: '🌐',
      href: '/websites',
    },
    {
      label: 'Roles & Permissions',
      icon: '🔐',
      href: '/roles',
    },
    {
      label: 'Pages',
      icon: '📄',
      href: '/pages',
    },
    {
      label: 'Activity Log',
      icon: '📋',
      href: '/activity',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-gray-900">CMS Admin</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-gray-700 font-medium"
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </a>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          {sidebarOpen && (
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-gray-700 font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
          <div>
            <h2 className="text-gray-600">Super Admin Control Panel</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 font-bold">{user?.email?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
