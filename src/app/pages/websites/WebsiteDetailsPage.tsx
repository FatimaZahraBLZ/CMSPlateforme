import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, Globe, Settings, Lock, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { AccessManagement } from '../../components/AccessManagement';
import { WebsiteProject } from '../../types';


type TabType = 'general' | 'access' | 'settings';

export const WebsiteDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [website, setWebsite] = useState<WebsiteProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('general');

  useEffect(() => {
    if (id) {
      fetchWebsite();
    }
  }, [id]);

  const fetchWebsite = async () => {
    try {
      setLoading(true);
      setError(null);
      const websites = await api.getWebsites();
      const found = websites.find((w: WebsiteProject) => w.id === id);
      if (!found) {
        setError('Website not found');
        return;
      }
      setWebsite(found);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load website';
      setError(errorMsg);
      console.error('Fetch website error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading website details...</div>
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="space-y-6">
        <Button
          onClick={() => navigate('/websites')}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Websites
        </Button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <AlertCircle className="w-12 h-12 text-red-600 mb-3" />
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Website</h2>
          <p className="text-red-700">{error || 'Website not found'}</p>
        </div>
      </div>
    );
  }

  const canManageAccess = user && (user.role === 'super_admin' || user.role === 'admin');

  const tabs = [
    { id: 'general' as TabType, label: 'General', icon: Globe },
    ...(canManageAccess ? [{ id: 'access' as TabType, label: 'Access Management', icon: Lock }] : []),
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/websites')}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{website.name}</h1>
            <p className="text-gray-600 mt-1">{website.domain}</p>
          </div>
        </div>
        <Badge className="bg-blue-100 text-blue-800">
          {website.status}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'general' && (
          <Card>
            <CardHeader>
              <CardTitle>Website Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Website Name</label>
                  <p className="text-lg text-gray-900 mt-1">{website.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Domain</label>
                  <p className="text-lg text-gray-900 mt-1">{website.domain}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Subdomain</label>
                  <p className="text-lg text-gray-900 mt-1">{website.subdomain}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Client</label>
                  <p className="text-lg text-gray-900 mt-1">{website.client || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <Badge className="mt-1 bg-blue-100 text-blue-800">{website.status}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Theme</label>
                  <p className="text-lg text-gray-900 mt-1">{website.theme || 'minimal'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Default Language</label>
                  <p className="text-lg text-gray-900 mt-1">{website.default_language || 'en'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Languages</label>
                  <div className="flex gap-2 mt-1">
                    {website.languages?.map((lang) => (
                      <Badge key={lang} className="bg-gray-100 text-gray-800">
                        {lang.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'access' && canManageAccess && (
          <AccessManagement
            websiteId={website.id}
            currentUserRole={user?.role || 'editor'}
          />
        )}

{activeTab === 'settings' && (
  <Card>
    <CardHeader>
      <CardTitle>Website Settings</CardTitle>
    </CardHeader>

    <CardContent>
      <div className="flex flex-col items-center justify-center py-12 text-center">
<div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-8 h-8 text-blue-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18"
    />
  </svg>
</div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Configure Website Settings
        </h3>

        <p className="text-gray-600 max-w-md mb-6">
          Manage your logo, favicon, contact information, social links,
          and website identity settings.
        </p>

        <button
          onClick={() => navigate('/settings')}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          Open Website Settings
        </button>
      </div>
    </CardContent>
  </Card>
)}
      </div>
    </div>
  );
};
