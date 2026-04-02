import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Alert } from '../../components/ui/Alert';
import { Settings, Globe, Shield, Upload, Database } from 'lucide-react';

export const GlobalSettingsPage: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [settings, setSettings] = useState({
    platformName: 'CMS Platform',
    platformUrl: 'https://cms-platform.com',
    defaultLanguage: 'en',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    maxUploadSize: '50',
    allowedFileTypes: 'jpg, png, gif, pdf, mp4',
    sessionTimeout: '30',
    enableRegistration: false,
    requireEmailVerification: true,
    enableTwoFactor: false,
  });

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Global Settings</h1>
        <p className="text-gray-600 mt-2">Configure platform-wide settings and defaults</p>
      </div>

      {showSuccess && (
        <Alert type="success">
          Global settings have been updated successfully!
        </Alert>
      )}

      {/* Platform Branding */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <CardTitle>Platform Branding</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="Platform Name"
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              placeholder="CMS Platform"
            />

            <Input
              label="Platform URL"
              value={settings.platformUrl}
              onChange={(e) => setSettings({ ...settings, platformUrl: e.target.value })}
              placeholder="https://cms-platform.com"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Logo
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">SVG, PNG, JPG (max. 2MB)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Localization */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            <CardTitle>Localization</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Default Language"
              value={settings.defaultLanguage}
              onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
              options={[
                { value: 'en', label: 'English' },
                { value: 'fr', label: 'French' },
                { value: 'ar', label: 'Arabic' },
              ]}
            />

            <Select
              label="Timezone"
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              options={[
                { value: 'UTC', label: 'UTC' },
                { value: 'America/New_York', label: 'Eastern Time' },
                { value: 'America/Los_Angeles', label: 'Pacific Time' },
                { value: 'Europe/London', label: 'London' },
                { value: 'Europe/Paris', label: 'Paris' },
              ]}
            />

            <Select
              label="Date Format"
              value={settings.dateFormat}
              onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
              options={[
                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Media Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <CardTitle>Media & Upload Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="Max Upload Size (MB)"
              type="number"
              value={settings.maxUploadSize}
              onChange={(e) => setSettings({ ...settings, maxUploadSize: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allowed File Types
              </label>
              <Textarea
                value={settings.allowedFileTypes}
                onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value })}
                placeholder="jpg, png, gif, pdf, mp4"
                className="min-h-[80px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Comma-separated list of allowed file extensions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Policies */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <CardTitle>Security Policies</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="Session Timeout (minutes)"
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
            />

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableRegistration}
                  onChange={(e) => setSettings({ ...settings, enableRegistration: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Enable User Registration</p>
                  <p className="text-xs text-gray-500">Allow new users to register accounts</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireEmailVerification}
                  onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Require Email Verification</p>
                  <p className="text-xs text-gray-500">Users must verify their email before accessing the platform</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableTwoFactor}
                  onChange={(e) => setSettings({ ...settings, enableTwoFactor: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Enable Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500">Require 2FA for all user accounts</p>
                </div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button variant="ghost">Reset to Defaults</Button>
        <Button variant="primary" onClick={handleSave}>
          Save Global Settings
        </Button>
      </div>
    </div>
  );
};
