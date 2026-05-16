import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/Button';
import { useCMS } from '../../contexts/CMSContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { WebsiteProject } from '../../types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../components/ui/Card';
import { Globe, ArrowRight } from 'lucide-react';

export const EditorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
  selectedWebsite,
  setSelectedWebsite,
  setWebsites,
  loadSelectedWebsiteForUser,
} = useCMS();

  const [websites, setLocalWebsites] = useState<WebsiteProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWebsites();
  }, []);

  const loadWebsites = async () => {
    try {
      const data = await api.getWebsites();

      setLocalWebsites(data);
      setWebsites(data);

      if (user?.id) {
        loadSelectedWebsiteForUser(user.id, data);
      }
    } catch (error) {
      console.error('Failed to load editor websites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWebsite = (website: WebsiteProject) => {
    setSelectedWebsite(website);
  };

  const handleOpenWorkspace = (website: WebsiteProject) => {
    setSelectedWebsite(website);
    navigate(`/pages`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading your websites...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">My Websites</h1>
        <p className="text-gray-600 mt-2">
          Select one of your assigned websites to manage.
        </p>
      </div>

      {websites.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Globe className="w-14 h-14 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">
              No websites assigned
            </h2>
            <p className="text-gray-500 mt-2">
              Contact an admin to get access.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {websites.map((website) => {
        const isSelected = selectedWebsite?.id === website.id;

  return (
    <Card
      key={website.id}
      onClick={() => handleSelectWebsite(website)}
      className={`border cursor-pointer transition-all ${
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-200 shadow-lg bg-indigo-50'
          : 'hover:border-indigo-400 hover:shadow-lg'
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">{website.name}</CardTitle>
            <p className="text-sm text-gray-500">{website.domain}</p>
          </div>

          {isSelected && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-600 text-white">
              Selected
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Role</span>
            <span className="font-medium capitalize">
              {website.userRole || 'editor'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className="capitalize">{website.status}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Updated</span>
            <span>{new Date(website.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        <Button
          className="w-full flex items-center justify-center gap-2"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenWorkspace(website);
          }}
        >
          {isSelected ? 'Continue Managing' : 'Manage Website'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
})}
      </div>
    </div>
  );
};