import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Menu, X, LogOut, ChevronDown, ArrowLeft } from 'lucide-react';
import { WebsiteProject } from '../types';

export const EditorLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { websiteId } = useParams<{ websiteId: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [websites, setWebsites] = useState<WebsiteProject[]>([]);
  const [currentWebsite, setCurrentWebsite] = useState<WebsiteProject | null>(null);
  const [showWebsiteDropdown, setShowWebsiteDropdown] = useState(false);

  useEffect(() => {
    fetchWebsites();
  }, []);

  useEffect(() => {
    if (websiteId && websites.length > 0) {
      const website = websites.find((w) => w.id === websiteId);
      setCurrentWebsite(website || null);
    }
  }, [websiteId, websites]);

  const fetchWebsites = async () => {
    try {
      const data = await api.getWebsites();
      setWebsites(data);
      if (data.length > 0 && !websiteId) {
        // Navigate to first website if no website selected
        navigate(`/workspace/${data[0].id}/pages`);
      }
    } catch (err) {
      console.error('Failed to load websites:', err);
    }
  };

  const handleSwitchWebsite = (website: WebsiteProject) => {
    setShowWebsiteDropdown(false);
    navigate(`/workspace/${website.id}/pages`);
  };

  const navigationItems = [
    {
      label: 'Pages',
      icon: '📄',
      href: `/workspace/${websiteId}/pages`,
    },
    {
      label: 'Menu & Navigation',
      icon: '🔗',
      href: `/workspace/${websiteId}/menus`,
    },
    {
      label: 'Theme & Design',
      icon: '🎨',
      href: `/workspace/${websiteId}/theme`,
    },
    {
      label: 'Media',
      icon: '🖼️',
      href: `/workspace/${websiteId}/media`,
    },
    {
      label: 'SEO & Meta',
      icon: '📈',
      href: `/workspace/${websiteId}/seo`,
    },
    {
      label: 'Translations',
      icon: '🌍',
      href: `/workspace/${websiteId}/translations`,
    },
    {
      label: 'Settings',
      icon: '⚙️',
      href: `/workspace/${websiteId}/settings`,
    },
  ];

  if (!currentWebsite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo/Title */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen && (
            <h1 className="text-lg font-bold text-gray-900">Editor</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Current Website Selector */}
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-200">
            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Current Website</p>
            <div className="relative">
              <button
                onClick={() => setShowWebsiteDropdown(!showWebsiteDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <span className="font-medium text-gray-900 truncate">{currentWebsite.name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showWebsiteDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showWebsiteDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {websites.map((website) => (
                    <button
                      key={website.id}
                      onClick={() => handleSwitchWebsite(website)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 ${
                        website.id === currentWebsite.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {website.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors text-gray-700 font-medium"
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </a>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
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
            <h2 className="text-gray-900 font-semibold">{currentWebsite.name}</h2>
            <p className="text-sm text-gray-600">{currentWebsite.domain}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">{user?.email?.charAt(0).toUpperCase()}</span>
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
