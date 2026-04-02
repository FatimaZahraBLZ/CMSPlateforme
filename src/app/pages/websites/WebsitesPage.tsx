import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useCMS } from '../../contexts/CMSContext';
import { WebsiteProject } from '../../types';

export const WebsitesPage: React.FC = () => {
  const { selectedWebsite, setSelectedWebsite } = useCMS();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    domain: '',
    defaultLanguage: 'en',
  });

  const websites: WebsiteProject[] = [
    {
      id: '1',
      name: 'Corporate Website',
      client: 'Acme Corp',
      domain: 'acmecorp.com',
      status: 'published',
      defaultLanguage: 'en',
      languages: ['en', 'fr'],
      theme: 'modern',
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date('2026-03-20'),
    },
    {
      id: '2',
      name: 'E-commerce Store',
      client: 'TechMart',
      domain: 'techmart.com',
      status: 'draft',
      defaultLanguage: 'en',
      languages: ['en', 'fr', 'ar'],
      theme: 'clean',
      createdAt: new Date('2026-02-10'),
      updatedAt: new Date('2026-03-25'),
    },
    {
      id: '3',
      name: 'Portfolio Site',
      client: 'Creative Studio',
      domain: 'creativestudio.io',
      status: 'published',
      defaultLanguage: 'fr',
      languages: ['fr', 'en'],
      theme: 'minimalist',
      createdAt: new Date('2026-01-20'),
      updatedAt: new Date('2026-03-15'),
    },
  ];

  const handleSelectWebsite = (website: WebsiteProject) => {
    setSelectedWebsite(website);
  };

  const handleCreateWebsite = () => {
    console.log('Creating website:', formData);
    setShowModal(false);
    setFormData({ name: '', client: '', domain: '', defaultLanguage: 'en' });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Websites</h1>
          <p className="text-gray-600 mt-2">Manage all your client websites</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          + Create Website
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {websites.map((website) => (
          <Card
            key={website.id}
            className={`cursor-pointer transition-all ${
              selectedWebsite?.id === website.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleSelectWebsite(website)}
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

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <span>🌐</span>
                  <span>{website.domain}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>🌍</span>
                  <span>{website.languages.map(l => l.toUpperCase()).join(', ')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>🎨</span>
                  <span className="capitalize">{website.theme}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <span>Updated: {new Date(website.updatedAt).toLocaleDateString()}</span>
                {selectedWebsite?.id === website.id && (
                  <Badge variant="info">Selected</Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Website">
        <div className="space-y-4">
          <Input
            label="Website Name"
            placeholder="Enter website name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Client Name"
            placeholder="Enter client name"
            value={formData.client}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
          />
          <Input
            label="Domain"
            placeholder="example.com"
            value={formData.domain}
            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
          />
          <Select
            label="Default Language"
            value={formData.defaultLanguage}
            onChange={(e) => setFormData({ ...formData, defaultLanguage: e.target.value })}
            options={[
              { value: 'en', label: 'English' },
              { value: 'fr', label: 'French' },
              { value: 'ar', label: 'Arabic' },
            ]}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateWebsite} className="flex-1">
              Create Website
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
