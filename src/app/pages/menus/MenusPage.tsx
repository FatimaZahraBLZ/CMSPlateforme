import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { useCMS } from '../../contexts/CMSContext';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Business, Construction, Gavel, Description } from '@mui/icons-material';

interface MenuItem {
  id: string;
  menu_id: string;
  label: string;
  section_name?: string | null;
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
  has_button?: boolean;
  button_label?: string;
  button_type?: 'page' | 'link' | 'phone';
  button_page_id?: string;
  button_link?: string;
  button_phone?: string;
  button_color?: string;
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
  const [editingMenuName, setEditingMenuName] = useState(false);
  const [menuNameInput, setMenuNameInput] = useState('');
  const [editingButton, setEditingButton] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    label: '',
    section_name: '',
    type: 'page' as 'page' | 'article' | 'external' | 'custom',
    page_id: '',
    link: '',
    is_active: true,
  });

  // Button configuration state
  const [buttonData, setButtonData] = useState({
    has_button: false,
    button_label: '',
    button_type: 'link' as 'page' | 'link' | 'phone',
    button_page_id: '',
    button_link: '',
    button_phone: '',
    button_color: 'primary',
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

  const resetFormData = () => {
    setFormData({
      label: '',
      section_name: '',
      type: 'page',
      page_id: '',
      link: '',
      is_active: true,
    });
  };

  // Group footer menu items by section_name
  const groupFooterItems = () => {
    const grouped: { [key: string]: MenuItem[] } = {};
    
    menuItems.forEach((item) => {
      const section = item.section_name || 'Other';
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(item);
    });
    
    return grouped;
  };

  // Get pastel color and icon for section
  const getSectionStyle = (section: string) => {
    const section_lower = section.toLowerCase();
    if (section_lower === 'other') {
      return { bg: 'bg-yellow-50', icon: 'description', color: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700' };
    }
    if (section_lower === 'company') {
      return { bg: 'bg-blue-50', icon: 'business', color: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' };
    }
    if (section_lower === 'services') {
      return { bg: 'bg-green-50', icon: 'construction', color: 'text-green-600', badge: 'bg-green-100 text-green-700' };
    }
    if (section_lower === 'legal') {
      return { bg: 'bg-purple-50', icon: 'gavel', color: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' };
    }
    return { bg: 'bg-gray-50', icon: 'description', color: 'text-gray-600', badge: 'bg-gray-100 text-gray-700' };
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
      setMenuNameInput(menu.name);
      setEditingMenuName(false);
      
      // Load button data
      setButtonData({
        has_button: menu.has_button || false,
        button_label: menu.button_label || '',
        button_type: menu.button_type || 'link',
        button_page_id: menu.button_page_id || '',
        button_link: menu.button_link || '',
        button_phone: menu.button_phone || '',
        button_color: menu.button_color || 'primary',
      });
      setEditingButton(false);
    } else {
      console.log('No menu found, clearing menu items');
      setMenuItems([]);
      setMenuNameInput('');
      setButtonData({
        has_button: false,
        button_label: '',
        button_type: 'link',
        button_page_id: '',
        button_link: '',
        button_phone: '',
        button_color: 'primary',
      });
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

    if ((formData.type === 'external' || formData.type === 'custom') && !formData.link) {
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
          link: formData.type === 'external' || formData.type === 'custom' ? formData.link : null,
          section_name: formData.section_name || null,
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
      resetFormData();
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

  const handleReorderMenuItems = async (reorderedItems: MenuItem[]) => {
    const menu = getCurrentMenu();
    if (!menu) return;

    try {
      const token = localStorage.getItem('cms_token');
      
      // Create array of item IDs in new order
      const itemIds = reorderedItems.map(item => item.id);

      const res = await fetch('/api/menus/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          menu_id: menu.id,
          website_id: selectedWebsite?.id,
          item_ids: itemIds,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to reorder items');
      }

      // Update local state with new order
      setMenuItems(reorderedItems);
      console.log('Menu items reordered successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder menu items');
      console.error('Error reordering menu items:', err);
      // Refresh items to revert to previous order
      const menu = getCurrentMenu();
      if (menu) {
        fetchMenuItems(menu.id);
      }
    }
  };

  const handleUpdateMenuName = async () => {
    const menu = getCurrentMenu();
    if (!menu) return;

    if (!menuNameInput.trim()) {
      setError('Menu name cannot be empty');
      return;
    }

    if (menuNameInput === menu.name) {
      setEditingMenuName(false);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('cms_token');
      const res = await fetch(`/api/menus/${menu.id}?website_id=${selectedWebsite?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: menuNameInput.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update menu name');
      }

      // Update menus state
      const updatedMenus = menus.map(m =>
        m.id === menu.id ? { ...m, name: menuNameInput.trim() } : m
      );
      setMenus(updatedMenus);
      setEditingMenuName(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update menu name');
      console.error('Error updating menu name:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateButton = async () => {
    const menu = getCurrentMenu();
    if (!menu) return;

    // Validate button data if enabled
    if (buttonData.has_button) {
      if (!buttonData.button_label.trim()) {
        setError('Button label is required');
        return;
      }

      if (buttonData.button_type === 'page' && !buttonData.button_page_id) {
        setError('Please select a page for the button');
        return;
      }

      if (buttonData.button_type === 'link' && !buttonData.button_link.trim()) {
        setError('Please enter a link for the button');
        return;
      }

      if (buttonData.button_type === 'phone' && !buttonData.button_phone.trim()) {
        setError('Please enter a phone number for the button');
        return;
      }
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('cms_token');
      const res = await fetch(`/api/menus/${menu.id}?website_id=${selectedWebsite?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(buttonData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update button');
      }

      // Update menus state
      const updatedMenus = menus.map(m =>
        m.id === menu.id ? { ...m, ...buttonData } : m
      );
      setMenus(updatedMenus);
      setEditingButton(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update button');
      console.error('Error updating button:', err);
    } finally {
      setLoading(false);
    }
  };

  // Draggable MenuItem Component
  const DraggableMenuItem: React.FC<{ item: MenuItem; index: number }> = ({ item, index }) => {
    const ref = useRef<HTMLDivElement>(null);
    
    const [, drag] = useDrag({
      type: 'MenuItem',
      item: { id: item.id, index },
    });

    const [, drop] = useDrop({
      accept: 'MenuItem',
      hover: (draggedItem: { id: string; index: number }) => {
        if (!ref.current) return;

        const dragIndex = draggedItem.index;
        const hoverIndex = index;

        if (dragIndex === hoverIndex) return;

        // Create new array with reordered items
        const newItems = [...menuItems];
        [newItems[dragIndex], newItems[hoverIndex]] = [newItems[hoverIndex], newItems[dragIndex]];

        // Update order_position for all items
        const updatedItems = newItems.map((item, i) => ({
          ...item,
          order_position: i + 1,
        }));

        setMenuItems(updatedItems);
        draggedItem.index = hoverIndex;
      },
      drop: () => {
        // Persist the order to backend
        const updatedItems = menuItems.map((item, i) => ({
          ...item,
          order_position: i + 1,
        }));
        handleReorderMenuItems(updatedItems);
      },
    });

    drag(drop(ref));

    return (
      <div
        ref={ref}
        className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-gray-300 transition-all cursor-move group"
        style={{ opacity: 1 }}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Drag Handle */}
          <div className="flex-shrink-0 flex items-center opacity-50 group-hover:opacity-100 transition-opacity">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </div>

          {/* Order Badge */}
          <div className="w-5 h-5 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-blue-700">{item.order_position}</span>
          </div>

          {/* Item Info */}
          <div className="min-w-10 flex-1">
            <p className="font-semibold text-gray-900 truncate">{item.label}</p>
            <p className="text-sm text-gray-500 truncate">
              {item.type === 'page' && item.page_slug
                ? `/${item.page_slug}`
                : item.link || 'No link'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
          <button
            onClick={() => handleDeleteMenuItem(item.id)}
            disabled={loading}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 group/delete"
            title="Delete menu item"
          >
            <svg className="w-5 h-5 text-red-400 group-hover/delete:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    );
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DndProvider backend={HTML5Backend}>
            <Card className="flex flex-col h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {editingMenuName ? (
                      <div className="flex items-center gap-2 max-w-md">
                        <Input
                          value={menuNameInput || ''}
                          onChange={(e) => setMenuNameInput(e.target.value)}
                          className="flex-1"
                          disabled={loading}
                          autoFocus
                        />
                        <button
                          onClick={handleUpdateMenuName}
                          disabled={loading}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingMenuName(false);
                            setMenuNameInput(currentMenu?.name || '');
                          }}
                          disabled={loading}
                          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-3xl font-bold text-gray-900">
                            {currentMenu?.name || `${menuType.charAt(0).toUpperCase() + menuType.slice(1)}`} Items
                          </h2>
                          <button
                            onClick={() => setEditingMenuName(true)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit menu name"
                          >
                            <svg className="w-5 h-5 text-gray-500 hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Drag items to reorder them</p>
                      </div>
                    )}
                  </div>
                  

                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {menuItems.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No menu items yet. Add your first item below.</p>
                  </div>
                ) : menuType === 'footer' ? (
                  // Display grouped footer items in modern cards
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(groupFooterItems()).map(([section, items]) => {
                      const style = getSectionStyle(section);
                      return (
                        <div key={section} className={`${style.bg} rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow`}>
                          {/* Section Header */}
                          <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full ${style.bg} border ${style.badge.split(' ')[1]} flex items-center justify-center`}>
                                {style.icon === 'business' && <Business className={`${style.color} text-sm`} />}
                                {style.icon === 'construction' && <Construction className={`${style.color} text-sm`} />}
                                {style.icon === 'gavel' && <Gavel className={`${style.color} text-sm`} />}
                                {style.icon === 'description' && <Description className={`${style.color} text-sm`} />}
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 uppercase tracking-wide text-xs">{section}</h3>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.badge}`}>
                              {items.length}
                            </span>
                          </div>

                          {/* Menu Items */}
                          <div className="px-4 py-2 space-y-1">
                            {items.map((item, index) => (
                              <DraggableMenuItem key={item.id} item={item} index={menuItems.indexOf(item)} />
                            ))}
                          </div>

                          {/* Add Item Button */}
                          <div className="px-4 py-2 border-t border-dashed border-gray-300">
                            <button
                              onClick={() => {
                                resetFormData();
                                setFormData((prev) => ({ ...prev, section_name: section }));
                              }}
                              className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-white transition-all flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Add item to {section}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Display header/sidebar items in single column with modern styling
                  <div className="space-y-6">
                    <div className="rounded-xl bg-blue-50 border border-gray-200 shadow-sm overflow-hidden">
                      {/* Header Section */}
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="font-bold text-gray-900 uppercase tracking-wide text-sm">{menuType} Items</h3>
                      </div>

                      {/* Menu Items */}
                      <div className="px-6 py-4 space-y-2">
                        {menuItems.map((item, index) => (
                          <DraggableMenuItem key={item.id} item={item} index={index} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Helper Tip */}
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  <p className="text-sm text-blue-900">
                    <strong>Tip:</strong> Drag the dots to reorder items within each section. For footer menus, set a section name to organize items into columns.
                  </p>
                </div>
              </CardContent>
            </Card>
          </DndProvider>

          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle>Add Menu Item</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <form onSubmit={handleAddMenuItem} className="space-y-4 h-full flex flex-col">
                <Input
                  label="Label"
                  placeholder="Menu item label"
                  value={formData.label || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  disabled={loading}
                />
                <Select
                  label="Type"
                  value={formData.type || 'page'}
                  onChange={(e) => {
                    const newType = e.target.value as typeof formData.type;
                    setFormData({
                      ...formData,
                      type: newType,
                      // Clear fields that won't be used based on type
                      page_id: newType === 'page' ? formData.page_id : '',
                      link: (newType === 'external' || newType === 'custom') ? formData.link : '',
                    });
                  }}
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
                    value={formData.page_id || ''}
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
                    value={formData.link || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    disabled={loading}
                  />
                )}
                {menuType === 'footer' && (
                  <Input
                    label="Section Name (Optional)"
                    placeholder="e.g., Company, Services, Legal"
                    value={formData.section_name || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, section_name: e.target.value })
                    }
                    disabled={loading}
                  />
                )}
                <Button
                  variant="primary"
                  className="w-full mt-auto"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? 'Adding...' : 'Add Menu Item'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {menuType === 'header' ? (
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle>Menu Button</CardTitle>
                <p className="text-sm text-gray-500 mt-2">Add an optional button to this menu</p>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {editingButton ? (
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={buttonData.has_button}
                          onChange={(e) =>
                            setButtonData({ ...buttonData, has_button: e.target.checked })
                          }
                          disabled={loading}
                          className="rounded"
                        />
                        <span className="text-sm font-medium">Enable Button</span>
                      </label>
                    </div>

                    {buttonData.has_button && (
                      <>
                        <Input
                          label="Button Label"
                          placeholder="e.g., Get Started, Book Now, Contact Us"
                          value={buttonData.button_label || ''}
                          onChange={(e) =>
                            setButtonData({ ...buttonData, button_label: e.target.value })
                          }
                          disabled={loading}
                        />

                        <Select
                          label="Link Type"
                          value={buttonData.button_type || 'link'}
                          onChange={(e) =>
                            setButtonData({
                              ...buttonData,
                              button_type: e.target.value as 'page' | 'link' | 'phone',
                            })
                          }
                          options={[
                            { value: 'page', label: 'Link to Page' },
                            { value: 'link', label: 'External Link' },
                            { value: 'phone', label: 'Phone Number' },
                          ]}
                          disabled={loading}
                        />

                        {buttonData.button_type === 'page' && (
                          <Select
                            label="Select Page"
                            value={buttonData.button_page_id || ''}
                            onChange={(e) =>
                              setButtonData({ ...buttonData, button_page_id: e.target.value })
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

                        {buttonData.button_type === 'link' && (
                          <Input
                            label="Link URL"
                            placeholder="https://example.com or /path"
                            value={buttonData.button_link || ''}
                            onChange={(e) =>
                              setButtonData({ ...buttonData, button_link: e.target.value })
                            }
                            disabled={loading}
                          />
                        )}

                        {buttonData.button_type === 'phone' && (
                          <Input
                            label="Phone Number"
                            placeholder="+1 (555) 123-4567"
                            value={buttonData.button_phone || ''}
                            onChange={(e) =>
                              setButtonData({ ...buttonData, button_phone: e.target.value })
                            }
                            disabled={loading}
                          />
                        )}

                        <Select
                          label="Button Style"
                          value={buttonData.button_color || 'primary'}
                          onChange={(e) =>
                            setButtonData({ ...buttonData, button_color: e.target.value })
                          }
                          options={[
                            { value: 'primary', label: 'Primary (Blue)' },
                            { value: 'secondary', label: 'Secondary (Gray)' },
                            { value: 'success', label: 'Success (Green)' },
                            { value: 'danger', label: 'Danger (Red)' },
                            { value: 'warning', label: 'Warning (Orange)' },
                          ]}
                          disabled={loading}
                        />
                      </>
                    )}

                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={handleUpdateButton}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex-1"
                      >
                        {loading ? 'Saving...' : 'Save Button'}
                      </button>
                      <button
                        onClick={() => setEditingButton(false)}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {buttonData.has_button ? (
                      <>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="font-medium text-blue-900">{buttonData.button_label}</p>
                          <p className="text-sm text-blue-700 mt-1">
                            {buttonData.button_type === 'page'
                              ? `Linked to page: ${pages.find(p => p.id === buttonData.button_page_id)?.title || 'Unknown'}`
                              : buttonData.button_type === 'link'
                              ? `URL: ${buttonData.button_link}`
                              : `Phone: ${buttonData.button_phone}`}
                          </p>
                          <p className="text-sm text-blue-700">Style: {buttonData.button_color}</p>
                        </div>
                        <button
                          onClick={() => setEditingButton(true)}
                          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          Edit Button
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-600 text-center py-4">No button configured</p>
                        <button
                          onClick={() => setEditingButton(true)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Add Button
                        </button>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle>Footer Organization</CardTitle>
                <p className="text-sm text-gray-500 mt-2">Organize footer items into sections</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">How to organize your footer:</h3>
                    <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                      <li>Add items to the footer menu</li>
                      <li>For each item, set a <strong>Section Name</strong> (e.g., "Company", "Services", "Legal")</li>
                      <li>Items with the same section name will be grouped together in a column</li>
                      <li>Items without a section name will appear in an "Other" section</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                    <p className="font-medium mb-2 text-gray-700">Example footer structure:</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="font-medium text-gray-900">Company</p>
                        <p className="text-xs text-gray-600 mt-1">About</p>
                        <p className="text-xs text-gray-600">Careers</p>
                        <p className="text-xs text-gray-600">Blog</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Services</p>
                        <p className="text-xs text-gray-600 mt-1">Web Design</p>
                        <p className="text-xs text-gray-600">Development</p>
                        <p className="text-xs text-gray-600">SEO</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Legal</p>
                        <p className="text-xs text-gray-600 mt-1">Privacy Policy</p>
                        <p className="text-xs text-gray-600">Terms</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};