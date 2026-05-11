import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { useCMS } from '../../contexts/CMSContext';

interface MenuItem {
  id: string;
  menu_id: string;
  label: string;
  type: 'page' | 'article' | 'external' | 'custom';
  link: string | null;
  page_id: string | null;
  page_slug: string | null;
  page_title: string | null;
  order_position: number;
  is_active: boolean;
}

interface Menu {
  id: string;
  website_id: string;
  type: 'header' | 'footer' | 'sidebar';
  language: string;
  name: string;
}

interface Page {
  id: string;
  title: string;
  slug: string;
}

export const MenusPage: React.FC = () => {
  const { selectedWebsite, currentLanguage } = useCMS();
  const [menuType, setMenuType] = useState<'header' | 'footer' | 'sidebar'>('header');
  const [menus, setMenus] = useState<Menu[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    label: '',
    type: 'page' as 'page' | 'article' | 'external' | 'custom',
    page_id: '',
    link: '',
    is_active: true,
  });

  // Fetch menus and pages when website or language changes
  useEffect(() => {
    if (!selectedWebsite) return;
    
    // Use defaultLanguage from selected website if currentLanguage is not set
    const language = currentLanguage || selectedWebsite.defaultLanguage || 'en';
    console.log('Initial fetch - language:', language, 'currentLanguage:', currentLanguage, 'defaultLanguage:', selectedWebsite.defaultLanguage);
    fetchMenusAndPages(language);
  }, [selectedWebsite, currentLanguage]);

  const fetchMenusAndPages = async (language: string = 'en') => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('cms_token');
      if (!token) {
        setError('No auth token found. Please log in again.');
        setLoading(false);
        return;
      }

      const menusUrl = `/api/menus?website_id=${selectedWebsite?.id}&language=${language}`;
      console.log('Fetching menus from:', menusUrl);
      
      // Fetch menus
      const menusRes = await fetch(menusUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!menusRes.ok) {
        const text = await menusRes.text();
        console.error('Menu API error:', menusRes.status, text.substring(0, 200));
        throw new Error(`Failed to fetch menus (${menusRes.status}): ${text.substring(0, 100)}`);
      }
      
      const menusData = await menusRes.json();
      console.log('Menus fetched:', menusData.menus);
      setMenus(menusData.menus || []);

      const pagesUrl = `/api/pages?website_id=${selectedWebsite?.id}&language=${language}`;
      console.log('Fetching pages from:', pagesUrl);
      
      // Fetch pages (for dropdown options)
      const pagesRes = await fetch(pagesUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!pagesRes.ok) {
        const text = await pagesRes.text();
        console.error('Pages API error:', pagesRes.status, text.substring(0, 200));
        throw new Error(`Failed to fetch pages (${pagesRes.status})`);
      }
      
      const pagesData = await pagesRes.json();
      setPages(pagesData.pages || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async (menuId: string) => {
    try {
      const token = localStorage.getItem('cms_token');

      const url = `/api/menu-items?menu_id=${menuId}&website_id=${selectedWebsite?.id}`;

      console.log('Fetching menu items from:', url);

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();

      console.log('Menu items raw response:', text.substring(0, 500));

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${text.substring(0, 200)}`);
      }

      const data = JSON.parse(text);

      setMenuItems(data.items || []);
    } catch (err) {
      console.error('Error fetching menu items:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch menu items'
      );
    }
  };

  const getCurrentMenu = (): Menu | undefined => {
    const language = currentLanguage || selectedWebsite?.defaultLanguage || 'en';
    console.log('getCurrentMenu - looking for type:', menuType, 'language:', language);
    console.log('Available menus:', menus);
    const menu = menus.find(m => m.type === menuType && m.language === language);
    console.log('Found menu:', menu);
    return menu;
  };

  useEffect(() => {
    const menu = getCurrentMenu();
    console.log('Menu selection effect - current menu:', menu);
    if (menu) {
      console.log('Fetching items for menu:', menu.id);
      fetchMenuItems(menu.id);
    } else {
      console.log('No menu found, clearing menu items');
      setMenuItems([]);
    }
  }, [menuType, menus, currentLanguage, selectedWebsite]);

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const menu = getCurrentMenu();
    if (!menu) {
      setError('No menu found. Please check your website setup.');
      return;
    }

    if (!formData.label.trim()) {
      setError('Please enter a menu item label');
      return;
    }

    if (formData.type === 'page' && !formData.page_id) {
      setError('Please select a page');
      return;
    }

    if (formData.type === 'external' && !formData.link) {
      setError('Please enter a link');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('cms_token');
      const res = await fetch('/api/menu-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          menu_id: menu.id,
          website_id: selectedWebsite?.id,
          label: formData.label,
          type: formData.type,
          page_id: formData.type === 'page' ? formData.page_id : null,
          link: formData.type === 'external' ? formData.link : null,
          is_active: formData.is_active,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create menu item');
      }

      // Refresh menu items
      await fetchMenuItems(menu.id);
      
      // Reset form
      setFormData({
        label: '',
        type: 'page',
        page_id: '',
        link: '',
        is_active: true,
      });
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add menu item');
      console.error('Error adding menu item:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMenuItem = async (menuItemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('cms_token');
      const res = await fetch(`/api/menu-items/${menuItemId}?website_id=${selectedWebsite?.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete menu item');

      const menu = getCurrentMenu();
      if (menu) {
        await fetchMenuItems(menu.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete menu item');
      console.error('Error deleting menu item:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedWebsite) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Please select a website first</p>
      </div>
    );
  }

  const currentMenu = getCurrentMenu();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Menu Builder</h1>
        <p className="text-gray-600 mt-2">Manage navigation menus for your website</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-600 hover:text-red-800 font-medium"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setMenuType('header')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            menuType === 'header'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Header Menu
        </button>
        <button
          onClick={() => setMenuType('footer')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            menuType === 'footer'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Footer Menu
        </button>
      </div>

      {loading && !menuItems.length ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading menu items...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>{currentMenu?.name || `${menuType.charAt(0).toUpperCase() + menuType.slice(1)} Menu`} Items</CardTitle>
            </CardHeader>
            <CardContent>
              {menuItems.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No menu items yet. Add your first item below.</p>
              ) : (
                <div className="space-y-3">
                  {menuItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-sm font-medium text-gray-600">
                          {item.order_position}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-600">
                            {item.type === 'page' && item.page_slug
                              ? `/${item.page_slug}`
                              : item.link || 'No link'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.type === 'page' ? 'info' : 'default'}>
                          {item.type}
                        </Badge>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDeleteMenuItem(item.id)}
                            disabled={loading}
                            className="p-1 hover:bg-red-100 rounded disabled:opacity-50"
                          >
                            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Menu Item</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMenuItem} className="space-y-4">
                <Input
                  label="Label"
                  placeholder="Menu item label"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  disabled={loading}
                />
                <Select
                  label="Type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as typeof formData.type,
                    })
                  }
                  options={[
                    { value: 'page', label: 'Page' },
                    { value: 'external', label: 'External Link' },
                    { value: 'custom', label: 'Custom' },
                  ]}
                  disabled={loading}
                />
                {formData.type === 'page' && (
                  <Select
                    label="Select Page"
                    value={formData.page_id}
                    onChange={(e) =>
                      setFormData({ ...formData, page_id: e.target.value })
                    }
                    options={[
                      { value: '', label: 'Choose a page...' },
                      ...pages.map((page) => ({
                        value: page.id,
                        label: page.title,
                      })),
                    ]}
                    disabled={loading}
                  />
                )}
                {(formData.type === 'external' || formData.type === 'custom') && (
                  <Input
                    label="Link"
                    placeholder="/page-url or https://..."
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    disabled={loading}
                  />
                )}
                <Button
                  variant="primary"
                  className="w-full"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? 'Adding...' : 'Add Menu Item'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
