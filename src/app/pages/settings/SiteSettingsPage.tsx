import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Alert } from '../../components/ui/Alert';
import { useCMS } from '../../contexts/CMSContext';
import { api } from '../../services/api';
import { Settings, Globe, Mail, Phone, MapPin, Share2, Upload } from 'lucide-react';

export const SiteSettingsPage: React.FC = () => {
  const { selectedWebsite } = useCMS();

  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const faviconInputRef = useRef<HTMLInputElement | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    siteName: '',
    logo: '',
    favicon: '',
    email: '',
    phone: '',
    address: '',
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: '',
  });

  const loadSettings = async () => {
    if (!selectedWebsite) return;

    try {
      setLoading(true);

      const data = await api.getSiteSettings(selectedWebsite.id);
      const social = data?.social_links || {};

      setSettings({
        siteName: data?.site_name || selectedWebsite.name || '',
        logo: data?.logo || '',
        favicon: data?.favicon || '',
        email: data?.email || '',
        phone: data?.phone || '',
        address: data?.address || '',
        facebook: social.facebook || '',
        twitter: social.twitter || '',
        instagram: social.instagram || '',
        linkedin: social.linkedin || '',
        youtube: social.youtube || '',
      });
    } catch (error) {
      console.error('Failed to load site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [selectedWebsite?.id]);

  const fileToBase64 = (file: File, key: 'logo' | 'favicon') => {
    const reader = new FileReader();

    reader.onload = () => {
      setSettings((prev) => ({
        ...prev,
        [key]: reader.result as string,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!selectedWebsite) return;

    try {
      setSaving(true);

      await api.updateSiteSettings({
        website_id: selectedWebsite.id,
        site_name: settings.siteName,
        logo: settings.logo,
        favicon: settings.favicon,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        facebook: settings.facebook,
        twitter: settings.twitter,
        instagram: settings.instagram,
        linkedin: settings.linkedin,
        youtube: settings.youtube,
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save site settings:', error);
      alert(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (!selectedWebsite) {
    return (
      <div className="text-center py-20">
        <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Website Selected</h2>
        <p className="text-gray-600">Please select a website to configure its settings</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-600">Loading site settings...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-gray-600 mt-2">Configure settings for {selectedWebsite.name}</p>
      </div>

      {showSuccess && (
        <Alert type="success">
          Site settings have been updated successfully!
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <CardTitle>General Information</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <Input
              label="Site Name"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              placeholder="My Website"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) fileToBase64(file, 'logo');
                  }}
                />

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Logo
                </label>

                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer"
                >
                  {settings.logo ? (
                    <img src={settings.logo} alt="Logo preview" className="h-16 mx-auto object-contain" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upload Logo</p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) fileToBase64(file, 'favicon');
                  }}
                />

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Favicon
                </label>

                <div
                  onClick={() => faviconInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer"
                >
                  {settings.favicon ? (
                    <img src={settings.favicon} alt="Favicon preview" className="h-16 mx-auto object-contain" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upload Favicon</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            <CardTitle>Contact Information</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              placeholder="contact@example.com"
            />

            <Input
              label="Phone Number"
              type="tel"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              placeholder="+212 600 000 000"
            />

            <Textarea
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              placeholder="Address"
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-600" />
            <CardTitle>Social Media Links</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {(['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'] as const).map((key) => (
              <Input
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                value={settings[key]}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                placeholder={`https://${key}.com/yourpage`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="ghost" onClick={loadSettings}>Reset</Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};