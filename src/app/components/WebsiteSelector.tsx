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
  onEdit?: (website: WebsiteProject) => void;
  onDelete?: (website: WebsiteProject) => void;
}

export const WebsiteSelector: React.FC<WebsiteSelectorProps> = ({
  websites,
  selectedWebsite,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
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
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>{website.domain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>{website.subdomain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20H7m6-4h6M9 3h6M3 20h18" />
                  </svg>
                  <span>{website.languages.map((lang) => lang.toUpperCase()).join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <span className="capitalize">{website.theme}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Updated: {website.updatedAt ? new Date(typeof website.updatedAt === 'string' ? website.updatedAt.replace(' ', 'T') : website.updatedAt instanceof Date ? website.updatedAt.toISOString() : website.updatedAt).toLocaleDateString() : '—'}</span>
                  {selectedWebsite?.id === website.id && <Badge variant="info">Selected</Badge>}
                </div>
                <div className="flex gap-2 pt-3">
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(website);
                      }}
                      className="flex-1 text-xs flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(website);
                      }}
                      className="flex-1 text-xs flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
