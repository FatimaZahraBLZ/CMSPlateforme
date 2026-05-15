import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { WebsiteProject } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ArrowRight } from 'lucide-react';

export const EditorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [websites, setWebsites] = useState<WebsiteProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getWebsites();
      setWebsites(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load websites';
      setError(errorMsg);
      console.error('Fetch websites error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWorkspace = (website: WebsiteProject) => {
    navigate(`/workspace/${website.id}/pages`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading your websites...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">Welcome back, {user?.email?.split('@')[0]}</h1>
        <p className="text-lg text-gray-600">Select a website to start editing</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-900 font-semibold mb-2">Error Loading Websites</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {websites.length === 0 && !error && (
        <Card>
          <CardContent className="pt-12">
            <div className="text-center space-y-4">
              <div className="text-6xl">📭</div>
              <h3 className="text-xl font-semibold text-gray-900">No Websites Assigned</h3>
              <p className="text-gray-600">You don't have access to any websites yet. Contact your administrator to get access.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Websites Grid */}
      {websites.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Your Websites</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {websites.map((website) => (
              <Card
                key={website.id}
                className="hover:shadow-lg transition-shadow hover:border-green-300 cursor-pointer"
                onClick={() => handleOpenWorkspace(website)}
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{website.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{website.domain}</p>
                    </div>
                    <Badge
                      className={`ml-2 ${
                        website.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {website.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Quick Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Subdomain:</span>
                      <span className="font-medium text-gray-900">{website.subdomain}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Language:</span>
                      <span className="font-medium text-gray-900">{website.default_language?.toUpperCase() || 'EN'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Theme:</span>
                      <span className="font-medium text-gray-900 capitalize">{website.theme || 'default'}</span>
                    </div>
                  </div>

                  {/* Languages */}
                  {website.languages && website.languages.length > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-2">Languages</p>
                      <div className="flex flex-wrap gap-1">
                        {website.languages.map((lang) => (
                          <Badge key={lang} className="bg-gray-100 text-gray-800 text-xs">
                            {lang.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    variant="primary"
                    className="w-full mt-4 flex items-center justify-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenWorkspace(website);
                    }}
                  >
                    Open Workspace
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      {websites.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">About Your Editor Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 space-y-2 text-sm">
            <p>
              You have access to <strong>{websites.length}</strong> website{websites.length !== 1 ? 's' : ''}.
            </p>
            <p>
              Select a website above to open your workspace where you can manage pages, menus, themes, translations, and more.
            </p>
            <p>
              You can switch between websites anytime from the workspace sidebar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
