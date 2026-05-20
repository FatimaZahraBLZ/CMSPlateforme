import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useCMS } from '../../contexts/CMSContext';
import { api } from '../../services/api';

interface ThemeSettingsState {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;

  fontFamily: string;
  buttonStyle: string;
  layoutStyle: string;
  headerStyle: string;

  header: {
  backgroundColor: string;
  textColor: string;
  sticky: boolean;
  showLogo: boolean;
  showSiteName: boolean;
  showButton: boolean;
  layout: string;
  };

  footer: {
    backgroundColor: string;
    textColor: string;
    showLogo: boolean;
    showSiteName: boolean;
    showSocialLinks: boolean;
    showContactInfo: boolean;
    columns: number;
  };
}

const defaultSettings: ThemeSettingsState = {
  primaryColor: '#1d4ed8',
  secondaryColor: '#10B981',
  accentColor: '#F59E0B',
  textColor: '#1F2937',
  backgroundColor: '#FFFFFF',

  fontFamily: 'Inter',
  buttonStyle: 'rounded',
  layoutStyle: 'professional',
  headerStyle: 'corporate',

  header: {
  backgroundColor: '#ffffff',
  textColor: '#111827',
  sticky: true,
  showLogo: true,
  showSiteName: true,
  showButton: true,
  layout: 'centered',
  },

  footer: {
    backgroundColor: '#111827',
    textColor: '#ffffff',
    showLogo: true,
    showSiteName: true,
    showSocialLinks: true,
    showContactInfo: true,
    columns: 4,
  },
};

export const ThemePage: React.FC = () => {
  const { selectedWebsite } = useCMS();

  const [themeId, setThemeId] = useState<string | null>(null);
  const [themeName, setThemeName] = useState('');
  const [themeDescription, setThemeDescription] = useState('');
  const [theme, setTheme] = useState<ThemeSettingsState>(defaultSettings);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTheme = async () => {
    if (!selectedWebsite) return;

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const data = await api.getDefaultTheme(selectedWebsite.id);

      setThemeId(data.id);
      setThemeName(data.name || '');
      setThemeDescription(data.description || '');

      setTheme({
        ...defaultSettings,
        ...(data.settings || {}),
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load theme';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTheme();
  }, [selectedWebsite?.id]);

  const updateField = (key: keyof ThemeSettingsState, value: string) => {
    setTheme((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateHeaderField = (key: string, value: any) => {
  setTheme((prev) => ({
    ...prev,
    header: {
      ...prev.header,
      [key]: value,
    },
  }));
};

const updateFooterField = (key: string, value: any) => {
  setTheme((prev) => ({
    ...prev,
    footer: {
      ...prev.footer,
      [key]: value,
    },
  }));
};

  const handleSave = async () => {
    if (!selectedWebsite || !themeId) return;

    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      await api.updateTheme(
        themeId,
        selectedWebsite.id,
        theme,
        themeName,
        themeDescription
      );

      setMessage('Theme saved successfully.');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save theme';
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (!selectedWebsite) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Please select a website first</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Loading theme...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Theme & Appearance</h1>
          <p className="text-gray-600 mt-2">
            Customize the look and feel of {selectedWebsite.name}
          </p>
        </div>

        <Button variant="primary" onClick={handleSave} disabled={saving || !themeId}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="Theme Name"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                />

                <Input
                  label="Description"
                  value={themeDescription}
                  onChange={(e) => setThemeDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {[
                  ['primaryColor', 'Primary Color'],
                  ['secondaryColor', 'Secondary Color'],
                  ['accentColor', 'Accent Color'],
                  ['textColor', 'Text Color'],
                  ['backgroundColor', 'Background Color'],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label}
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={theme[key as keyof ThemeSettingsState]}
                        onChange={(e) =>
                          updateField(key as keyof ThemeSettingsState, e.target.value)
                        }
                        className="w-16 h-12 rounded-lg cursor-pointer"
                      />
                      <Input
                        value={theme[key as keyof ThemeSettingsState]}
                        onChange={(e) =>
                          updateField(key as keyof ThemeSettingsState, e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                label="Font Family"
                value={theme.fontFamily}
                onChange={(e) => updateField('fontFamily', e.target.value)}
                options={[
                  { value: 'Inter', label: 'Inter' },
                  { value: 'Roboto', label: 'Roboto' },
                  { value: 'Poppins', label: 'Poppins' },
                  { value: 'Open Sans', label: 'Open Sans' },
                  { value: 'Georgia', label: 'Georgia' },
                ]}
              />
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
                  onChange={(e) => updateField('buttonStyle', e.target.value)}
                  options={[
                    { value: 'rounded', label: 'Rounded' },
                    { value: 'square', label: 'Square' },
                    { value: 'pill', label: 'Pill' },
                  ]}
                />

                <Select
                  label="Layout Style"
                  value={theme.layoutStyle}
                  onChange={(e) => updateField('layoutStyle', e.target.value)}
                  options={[
                    { value: 'clean', label: 'Clean' },
                    { value: 'professional', label: 'Professional' },
                    { value: 'editorial', label: 'Editorial' },
                    { value: 'boxed', label: 'Boxed' },
                    { value: 'full-width', label: 'Full Width' },
                  ]}
                />

                <Select
                  label="Header Style"
                  value={theme.headerStyle}
                  onChange={(e) => updateField('headerStyle', e.target.value)}
                  options={[
                    { value: 'simple', label: 'Simple' },
                    { value: 'corporate', label: 'Corporate' },
                    { value: 'magazine', label: 'Magazine' },
                  ]}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
  <CardHeader>
    <CardTitle>Header Appearance</CardTitle>
  </CardHeader>

  <CardContent>
    <div className="space-y-6">

      <div className="grid grid-cols-2 gap-6">

        <div>
          <label className="block text-sm font-medium mb-2">
            Header Background
          </label>

          <input
            type="color"
            value={theme.header.backgroundColor}
            onChange={(e) =>
              updateHeaderField('backgroundColor', e.target.value)
            }
            className="w-full h-12 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Header Text Color
          </label>

          <input
            type="color"
            value={theme.header.textColor}
            onChange={(e) =>
              updateHeaderField('textColor', e.target.value)
            }
            className="w-full h-12 rounded-lg cursor-pointer"
          />
        </div>

      </div>

      <Select
        label="Header Layout"
        value={theme.header.layout}
        onChange={(e) =>
          updateHeaderField('layout', e.target.value)
        }
        options={[
          { value: 'centered', label: 'Centered' },
          { value: 'split', label: 'Split' },
          { value: 'minimal', label: 'Minimal' },
        ]}
      />

      <div className="space-y-3">

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={theme.header.sticky}
            onChange={(e) =>
              updateHeaderField('sticky', e.target.checked)
            }
          />
          <span>Sticky Header</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={theme.header.showLogo}
            onChange={(e) =>
              updateHeaderField('showLogo', e.target.checked)
            }
          />
          <span>Show Logo</span>
        </label>

        <label className="flex items-center gap-3">
  <input
    type="checkbox"
    checked={theme.header.showSiteName}
    onChange={(e) =>
      updateHeaderField('showSiteName', e.target.checked)
    }
  />
  <span>Show Website Name</span>
</label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={theme.header.showButton}
            onChange={(e) =>
              updateHeaderField('showButton', e.target.checked)
            }
          />
          <span>Show CTA Button</span>
        </label>

      </div>
    </div>
  </CardContent>
</Card>
<Card>
  <CardHeader>
    <CardTitle>Footer Appearance</CardTitle>
  </CardHeader>

  <CardContent>
    <div className="space-y-6">

      <div className="grid grid-cols-2 gap-6">

        <div>
          <label className="block text-sm font-medium mb-2">
            Footer Background
          </label>

          <input
            type="color"
            value={theme.footer.backgroundColor}
            onChange={(e) =>
              updateFooterField('backgroundColor', e.target.value)
            }
            className="w-full h-12 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Footer Text Color
          </label>

          <input
            type="color"
            value={theme.footer.textColor}
            onChange={(e) =>
              updateFooterField('textColor', e.target.value)
            }
            className="w-full h-12 rounded-lg cursor-pointer"
          />
        </div>

      </div>

      <Select
        label="Footer Columns"
        value={String(theme.footer.columns)}
        onChange={(e) =>
          updateFooterField('columns', Number(e.target.value))
        }
        options={[
          { value: '2', label: '2 Columns' },
          { value: '3', label: '3 Columns' },
          { value: '4', label: '4 Columns' },
        ]}
      />

      <div className="space-y-3">

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={theme.footer.showLogo}
            onChange={(e) =>
              updateFooterField('showLogo', e.target.checked)
            }
          />
          <span>Show Logo</span>
        </label>

        <label className="flex items-center gap-3">
  <input
    type="checkbox"
    checked={theme.footer.showSiteName}
    onChange={(e) =>
      updateFooterField('showSiteName', e.target.checked)
    }
  />
  <span>Show Website Name</span>
</label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={theme.footer.showSocialLinks}
            onChange={(e) =>
              updateFooterField('showSocialLinks', e.target.checked)
            }
          />
          <span>Show Social Links</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={theme.footer.showContactInfo}
            onChange={(e) =>
              updateFooterField('showContactInfo', e.target.checked)
            }
          />
          <span>Show Contact Info</span>
        </label>

      </div>
    </div>
  </CardContent>
</Card>
        </div>

        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className="p-5 rounded-lg border"
                  style={{
                    backgroundColor: theme.backgroundColor,
                    fontFamily: theme.fontFamily,
                  }}
                >
                  <p className="text-xs font-semibold uppercase mb-2" style={{ color: theme.primaryColor }}>
                    {selectedWebsite.name}
                  </p>

                  <h3 className="mb-2 font-bold text-xl" style={{ color: theme.textColor }}>
                    Sample Heading
                  </h3>

                  <p className="text-sm mb-4" style={{ color: theme.textColor, opacity: 0.75 }}>
                    This preview uses the values saved in your website theme.
                  </p>

                  <button
                    className={`px-4 py-2 text-white ${
                      theme.buttonStyle === 'rounded'
                        ? 'rounded-lg'
                        : theme.buttonStyle === 'pill'
                          ? 'rounded-full'
                          : 'rounded-none'
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

                <Button variant="secondary" onClick={loadTheme} className="w-full">
                  Reload Theme
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};