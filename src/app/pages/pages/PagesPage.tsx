import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { useCMS } from '../../contexts/CMSContext';

export const PagesPage: React.FC = () => {
  const { selectedWebsite, currentLanguage } = useCMS();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    status: 'draft',
  });

  const pages = [
    { id: '1', title: 'Home', slug: 'home', language: 'en', status: 'published', updatedAt: '2026-03-25' },
    { id: '2', title: 'About Us', slug: 'about', language: 'en', status: 'published', updatedAt: '2026-03-24' },
    { id: '3', title: 'Services', slug: 'services', language: 'en', status: 'draft', updatedAt: '2026-03-23' },
    { id: '4', title: 'Contact', slug: 'contact', language: 'en', status: 'published', updatedAt: '2026-03-22' },
    { id: '5', title: 'Accueil', slug: 'accueil', language: 'fr', status: 'published', updatedAt: '2026-03-21' },
  ];

  const filteredPages = pages.filter(page => page.language === currentLanguage);

  if (!selectedWebsite) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Please select a website first</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pages</h1>
          <p className="text-gray-600 mt-2">Manage your website pages</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          + Create Page
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPages.map((page) => (
              <TableRow key={page.id}>
                <TableCell>
                  <span className="font-medium">{page.title}</span>
                </TableCell>
                <TableCell>
                  <span className="text-gray-600">/{page.slug}</span>
                </TableCell>
                <TableCell>
                  <span className="uppercase text-xs font-medium text-gray-600">{page.language}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={page.status === 'published' ? 'success' : 'warning'}>
                    {page.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-gray-600">{page.updatedAt}</span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">Edit</Button>
                    <Button size="sm" variant="ghost">Preview</Button>
                    <Button size="sm" variant="danger">Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Page" size="lg">
        <div className="space-y-4">
          <Input
            label="Page Title"
            placeholder="Enter page title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Input
            label="Slug"
            placeholder="page-url-slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />
          <Textarea
            label="Content"
            placeholder="Enter page content..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="min-h-[200px]"
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
            ]}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="success" onClick={() => setShowModal(false)} className="flex-1">
              Save Draft
            </Button>
            <Button variant="primary" onClick={() => setShowModal(false)} className="flex-1">
              Publish
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
