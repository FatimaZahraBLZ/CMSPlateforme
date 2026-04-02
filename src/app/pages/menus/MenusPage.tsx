import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { useCMS } from '../../contexts/CMSContext';

export const MenusPage: React.FC = () => {
  const { selectedWebsite, currentLanguage } = useCMS();
  const [menuType, setMenuType] = useState<'header' | 'footer'>('header');

  const headerMenuItems = [
    { id: '1', label: 'Home', type: 'page', link: '/', order: 1 },
    { id: '2', label: 'About', type: 'page', link: '/about', order: 2 },
    { id: '3', label: 'Services', type: 'page', link: '/services', order: 3 },
    { id: '4', label: 'Projects', type: 'page', link: '/projects', order: 4 },
    { id: '5', label: 'Blog', type: 'page', link: '/blog', order: 5 },
    { id: '6', label: 'Contact', type: 'page', link: '/contact', order: 6 },
  ];

  const footerMenuItems = [
    { id: '7', label: 'Privacy Policy', type: 'page', link: '/privacy', order: 1 },
    { id: '8', label: 'Terms of Service', type: 'page', link: '/terms', order: 2 },
    { id: '9', label: 'Support', type: 'external', link: 'https://support.example.com', order: 3 },
  ];

  const currentMenuItems = menuType === 'header' ? headerMenuItems : footerMenuItems;

  if (!selectedWebsite) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Please select a website first</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Menu Builder</h1>
        <p className="text-gray-600 mt-2">Manage navigation menus for your website</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentMenuItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-sm font-medium text-gray-600">
                      {item.order}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-600">{item.link}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.type === 'page' ? 'info' : 'default'}>
                      {item.type}
                    </Badge>
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-gray-200 rounded">
                        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button className="p-1 hover:bg-red-100 rounded">
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Menu Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input label="Label" placeholder="Menu item label" />
              <Select
                label="Type"
                options={[
                  { value: 'page', label: 'Page' },
                  { value: 'external', label: 'External Link' },
                  { value: 'custom', label: 'Custom' },
                ]}
              />
              <Select
                label="Page"
                options={[
                  { value: '/', label: 'Home' },
                  { value: '/about', label: 'About' },
                  { value: '/services', label: 'Services' },
                  { value: '/contact', label: 'Contact' },
                ]}
              />
              <Input label="Link" placeholder="/page-url or https://..." />
              <Input label="Order" type="number" placeholder="1" />
              <Button variant="primary" className="w-full">
                Add Menu Item
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
