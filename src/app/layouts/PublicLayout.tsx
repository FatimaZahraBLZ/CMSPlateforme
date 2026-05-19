import React, { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router';
import { Logo } from '../components/Logo';
import { SubdomainService } from '../services/SubdomainService';
import { api } from '../services/api';

interface Website {
  id: string;
  name: string;
  subdomain: string;
  domain: string;
  status: string;
  default_language: string;
}

interface MenuItem {
  id: string;
  label: string;
  type: 'page' | 'external' | 'custom';
  link?: string;
  page_slug?: string;
  order_position: number;
  section_name?: string; // For footer grouping: "Company", "Services", "Legal", etc.
}

interface Menu {
  id: string;
  type: string;
  language: string;
  name: string;
  items: MenuItem[];
  has_button?: boolean;
  button_label?: string;
  button_type?: 'page' | 'link' | 'phone';
  button_page_id?: string;
  button_slug?: string;
  button_link?: string;
  button_phone?: string;
  button_color?: string;
}

export const PublicLayout: React.FC = () => {
  const [website, setWebsite] = useState<Website | null>(null);
  const [headerMenu, setHeaderMenu] = useState<Menu | null>(null);
  const [headerMenuItems, setHeaderMenuItems] = useState<MenuItem[]>([]);
  const [footerMenus, setFooterMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>('en');
  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() => {
    const loadWebsite = async () => {
      try {
        const subdomain = SubdomainService.getSubdomain();

        if (!subdomain) {
          setError('No subdomain detected');
          setLoading(false);
          return;
        }

        const response = await api.getPublicWebsite(subdomain);

        if (response.status === 'success' && response.website) {
          setWebsite(response.website);
          setLanguage(response.website.default_language || 'en');
        } else {
          setError('Website not found');
        }
      } catch (err) {
        console.error('Failed to load website:', err);
        setError('Failed to load website');
      } finally {
        setLoading(false);
      }
    };

    loadWebsite();
  }, []);

  useEffect(() => {
  if (!website) return;

  const fetchSiteSettings = async () => {
    try {
      const data = await api.getPublicSiteSettings(website.id);
      setSiteSettings(data);

      if (data?.favicon) {
        let favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;

        if (!favicon) {
          favicon = document.createElement('link');
          favicon.rel = 'icon';
          document.head.appendChild(favicon);
        }

        favicon.href = data.favicon;
      }
    } catch (err) {
      console.error('Failed to fetch site settings:', err);
    }
  };

  fetchSiteSettings();
}, [website]);

  // Fetch menus when website is loaded
  useEffect(() => {
    if (!website) return;

    const fetchMenus = async () => {
      try {
        // Fetch header menu
        const headerResponse = await api.getPublicMenus(website.id, 'header', language);
        if (headerResponse.status === 'success' && headerResponse.menus?.[0]) {
          const headerMenu = headerResponse.menus[0];
          setHeaderMenu(headerMenu);
          const items = headerMenu.items || [];
          setHeaderMenuItems(items.sort((a: MenuItem, b: MenuItem) => a.order_position - b.order_position));
          console.log('Header menu loaded:', headerMenu);
        }

        // Fetch footer menus
        const footerResponse = await api.getPublicMenus(website.id, 'footer', language);
        if (footerResponse.status === 'success') {
          setFooterMenus(footerResponse.menus || []);
          console.log('Footer menus loaded:', footerResponse.menus);
        }
      } catch (err) {
        console.error('Failed to fetch menus:', err);
        // Don't block page load if menus fail
      }
    };

    fetchMenus();
  }, [website, language]);

  // Helper to group footer menu items by section_name
  const groupFooterItems = (items: MenuItem[]) => {
    const grouped: { [key: string]: MenuItem[] } = {};
    
    items.forEach((item) => {
      const section = item.section_name || 'Other';
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(item);
    });
    
    return grouped;
  };

  // Helper to resolve menu item link
  const getMenuItemUrl = (item: MenuItem): string => {
    if (item.type === 'page' && item.page_slug) {
      return `/${item.page_slug}`;
    }
    if (item.type === 'external' || item.type === 'custom') {
      return item.link || '#';
    }
    return '#';
  };

  // Helper to resolve button link
  const getButtonUrl = (): string => {
    if (!headerMenu || !headerMenu.has_button) return '#';

    if (headerMenu.button_type === 'page' && headerMenu.button_slug) {
      return `/${headerMenu.button_slug}`;
    }
    if (headerMenu.button_type === 'link' && headerMenu.button_link) {
      return headerMenu.button_link;
    }
    if (headerMenu.button_type === 'phone' && headerMenu.button_phone) {
      return `tel:${headerMenu.button_phone}`;
    }
    return '#';
  };

  // Helper to get button color classes
  const getButtonColorClasses = (): string => {
    const colorMap: Record<string, string> = {
      'primary': 'bg-blue-600 hover:bg-blue-700',
      'secondary': 'bg-gray-600 hover:bg-gray-700',
      'success': 'bg-green-600 hover:bg-green-700',
      'danger': 'bg-red-600 hover:bg-red-700',
      'warning': 'bg-yellow-600 hover:bg-yellow-700',
    };
    return colorMap[headerMenu?.button_color || 'primary'] || 'bg-blue-600 hover:bg-blue-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading website...</p>
        </div>
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Website Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'The requested website could not be found'}</p>
          <Link to="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Go to Main Platform
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Public Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              {siteSettings?.logo ? (
  <img src={siteSettings.logo} alt={siteSettings.site_name} className="w-10 h-10 object-contain" />
) : (
  <Logo className="w-10 h-10" alt="Logo" />
)}

<span className="text-xl font-bold text-gray-900">
  {siteSettings?.site_name || website.name}
</span>
            </div>

            {/* Dynamic Header Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {headerMenuItems.map((item) => {
  const url = getMenuItemUrl(item);

  return (
    <Link
      key={item.id}
      to={url}
      className="text-gray-700 hover:text-blue-600 transition-colors"
    >
      {item.label}
    </Link>
  );
})}
            </nav>

            {/* Dynamic Button from Menu Configuration */}
            {headerMenu?.has_button && headerMenu.button_label ? (
              <Link
                to={getButtonUrl()}
                className={`text-white px-6 py-2 rounded-lg transition-colors ${getButtonColorClasses()}`}
              >
                {headerMenu.button_label}
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <Outlet context={{ website }} />

      {/* Public Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                {siteSettings?.logo ? (
  <img src={siteSettings.logo} alt={siteSettings.site_name} className="w-10 h-10 object-contain" />
) : (
  <Logo className="w-10 h-10" alt="Logo" />
)}

<span className="text-xl font-bold">
  {siteSettings?.site_name || website.name}
</span>
              </div>

              <p className="text-gray-400 text-sm">
                Building amazing digital experiences for modern businesses.
              </p>
            </div>

            {footerMenus.flatMap((menu) => {
              const groupedItems = groupFooterItems(menu.items || []);

              return Object.entries(groupedItems).map(([section, items]) => (
                <div key={`${menu.id}-${section}`}>
                  <h3 className="font-semibold mb-4">{section}</h3>

                  <ul className="space-y-2 text-sm text-gray-400">
                    {items.map((item) => {
                      const url = getMenuItemUrl(item);

                      return (
                        <li key={item.id}>
                          <Link
                            to={url}
                            className="hover:text-white transition-colors"
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ));
            })}
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} {website?.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};