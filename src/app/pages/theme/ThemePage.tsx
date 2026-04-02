import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useCMS } from '../../contexts/CMSContext';

export const ThemePage: React.FC = () => {
  const { selectedWebsite } = useCMS();
  const [theme, setTheme] = useState({
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    textColor: '#1F2937',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter',
    buttonStyle: 'rounded',
    layoutStyle: 'boxed',
  });

  if (!selectedWebsite) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Please select a website first</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Theme & Appearance</h1>
          <p className="text-gray-600 mt-2">Customize your website's look and feel</p>
        </div>
        <Button variant="primary">Save Changes</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={theme.primaryColor}
                      onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                      className="w-16 h-12 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={theme.primaryColor}
                      onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={theme.secondaryColor}
                      onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                      className="w-16 h-12 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={theme.secondaryColor}
                      onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={theme.accentColor}
                      onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                      className="w-16 h-12 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={theme.accentColor}
                      onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={theme.textColor}
                      onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                      className="w-16 h-12 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={theme.textColor}
                      onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select
                  label="Font Family"
                  value={theme.fontFamily}
                  onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
                  options={[
                    { value: 'Inter', label: 'Inter' },
                    { value: 'Roboto', label: 'Roboto' },
                    { value: 'Poppins', label: 'Poppins' },
                    { value: 'Open Sans', label: 'Open Sans' },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Layout Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select
                  label="Button Style"
                  value={theme.buttonStyle}
                  onChange={(e) => setTheme({ ...theme, buttonStyle: e.target.value })}
                  options={[
                    { value: 'rounded', label: 'Rounded' },
                    { value: 'square', label: 'Square' },
                    { value: 'pill', label: 'Pill' },
                  ]}
                />
                <Select
                  label="Layout Style"
                  value={theme.layoutStyle}
                  onChange={(e) => setTheme({ ...theme, layoutStyle: e.target.value })}
                  options={[
                    { value: 'boxed', label: 'Boxed' },
                    { value: 'full-width', label: 'Full Width' },
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: theme.backgroundColor }}>
                  <h3 className="mb-2" style={{ color: theme.textColor }}>Sample Heading</h3>
                  <p className="text-sm mb-4" style={{ color: theme.textColor, opacity: 0.7 }}>
                    This is how your text will look with the selected colors.
                  </p>
                  <button
                    className={`px-4 py-2 text-white ${
                      theme.buttonStyle === 'rounded' ? 'rounded-lg' :
                      theme.buttonStyle === 'pill' ? 'rounded-full' : 'rounded-none'
                    }`}
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    Primary Button
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-12 rounded" style={{ backgroundColor: theme.primaryColor }} />
                  <div className="h-12 rounded" style={{ backgroundColor: theme.secondaryColor }} />
                  <div className="h-12 rounded" style={{ backgroundColor: theme.accentColor }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
