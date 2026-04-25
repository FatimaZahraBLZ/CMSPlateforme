import React from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { WebsiteProject } from '../types';

interface WebsiteSelectorProps {
  websites: WebsiteProject[];
  selectedWebsite: WebsiteProject | null;
  onSelect: (website: WebsiteProject) => void;
  onCreate?: () => void;
}

export const WebsiteSelector: React.FC<WebsiteSelectorProps> = ({
  websites,
  selectedWebsite,
  onSelect,
  onCreate,
}) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Websites</h1>
          <p className="text-gray-600 mt-2">Select the website you want to manage.</p>
        </div>
        {onCreate && (
          <Button variant="primary" onClick={onCreate}>
            + Create Website
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {websites.map((website) => (
          <Card
            key={website.id}
            className={`cursor-pointer transition-all ${
              selectedWebsite?.id === website.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => onSelect(website)}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{website.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{website.client}</p>
                </div>
                <Badge variant={website.status === 'published' ? 'success' : 'warning'}>
                  {website.status}
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>🌐</span>
                  <span>{website.domain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🌍</span>
                  <span>{website.languages.map((lang) => lang.toUpperCase()).join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🎨</span>
                  <span className="capitalize">{website.theme}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <span>Updated: {new Date(website.updatedAt).toLocaleDateString()}</span>
                {selectedWebsite?.id === website.id && <Badge variant="info">Selected</Badge>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
