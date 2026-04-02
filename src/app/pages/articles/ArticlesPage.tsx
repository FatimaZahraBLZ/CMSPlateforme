import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { useCMS } from '../../contexts/CMSContext';

export const ArticlesPage: React.FC = () => {
  const { selectedWebsite, currentLanguage } = useCMS();
  const [showModal, setShowModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  const articles = [
    { id: '1', title: 'Getting Started with React', category: 'Technology', author: 'John Doe', language: 'en', status: 'published', date: '2026-03-20' },
    { id: '2', title: 'Design Trends 2026', category: 'Design', author: 'Jane Smith', language: 'en', status: 'published', date: '2026-03-18' },
    { id: '3', title: 'SEO Best Practices', category: 'Marketing', author: 'Mike Johnson', language: 'en', status: 'draft', date: '2026-03-15' },
    { id: '4', title: 'Introduction à React', category: 'Technology', author: 'Pierre Martin', language: 'fr', status: 'published', date: '2026-03-12' },
  ];

  const categories = ['all', 'Technology', 'Design', 'Marketing'];
  const filteredArticles = articles.filter(
    article => article.language === currentLanguage && (filterCategory === 'all' || article.category === filterCategory)
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-600 mt-2">Manage your blog articles</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          + Create Article
        </Button>
      </div>

      <div className="flex gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArticles.map((article) => (
              <TableRow key={article.id}>
                <TableCell>
                  <span className="font-medium">{article.title}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="default">{article.category}</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-gray-600">{article.author}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={article.status === 'published' ? 'success' : 'warning'}>
                    {article.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-gray-600">{article.date}</span>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Article" size="lg">
        <div className="space-y-4">
          <Input label="Article Title" placeholder="Enter article title" />
          <Input label="Slug" placeholder="article-url-slug" />
          <Textarea label="Excerpt" placeholder="Brief description..." />
          <Textarea label="Content" placeholder="Article content..." className="min-h-[250px]" />
          <Select
            label="Category"
            options={[
              { value: 'technology', label: 'Technology' },
              { value: 'design', label: 'Design' },
              { value: 'marketing', label: 'Marketing' },
            ]}
          />
          <Select
            label="Status"
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
