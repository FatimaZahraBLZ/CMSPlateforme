import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Alert } from '../../components/ui/Alert';
import { useCMS } from '../../contexts/CMSContext';
import { Settings, Globe, Mail, Phone, MapPin, Share2, Upload } from 'lucide-react';

export const SiteSettingsPage: React.FC = () => {
  const { selectedWebsite } = useCMS();
  const [showSuccess, setShowSuccess] = useState(false);
  const [settings, setSettings] = useState({
    siteName: selectedWebsite?.name || '',
    tagline: 'Your trusted partner',
    email: 'contact@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business St, Suite 100, San Francisco, CA 94102',
    facebook: 'https://facebook.com/yourpage',
    twitter: 'https://twitter.com/yourhandle',
    instagram: 'https://instagram.com/yourhandle',
    linkedin: 'https://linkedin.com/company/yourcompany',
    youtube: 'https://youtube.com/@yourchannel',
  });

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
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

      {/* General Information */}
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

            <Input
              label="Tagline"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              placeholder="Your trusted partner"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Logo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload Logo</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Favicon
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload Favicon</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            <CardTitle>Contact Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Email Address</span>
                </div>
              </label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="contact@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>Phone Number</span>
                </div>
              </label>
              <Input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Address</span>
                </div>
              </label>
              <Textarea
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="123 Business St, Suite 100, San Francisco, CA 94102"
                className="min-h-[80px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-600" />
            <CardTitle>Social Media Links</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="Facebook"
              value={settings.facebook}
              onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
              placeholder="https://facebook.com/yourpage"
            />

            <Input
              label="Twitter"
              value={settings.twitter}
              onChange={(e) => setSettings({ ...settings, twitter: e.target.value })}
              placeholder="https://twitter.com/yourhandle"
            />

            <Input
              label="Instagram"
              value={settings.instagram}
              onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
              placeholder="https://instagram.com/yourhandle"
            />

            <Input
              label="LinkedIn"
              value={settings.linkedin}
              onChange={(e) => setSettings({ ...settings, linkedin: e.target.value })}
              placeholder="https://linkedin.com/company/yourcompany"
            />

            <Input
              label="YouTube"
              value={settings.youtube}
              onChange={(e) => setSettings({ ...settings, youtube: e.target.value })}
              placeholder="https://youtube.com/@yourchannel"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button variant="ghost">Reset</Button>
        <Button variant="primary" onClick={handleSave}>
          Save Settings
        </Button>
      </div>
    </div>
  );
};
