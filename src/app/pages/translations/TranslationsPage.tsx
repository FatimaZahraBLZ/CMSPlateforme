import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useCMS } from '../../contexts/CMSContext';

export const TranslationsPage: React.FC = () => {
  const { selectedWebsite } = useCMS();
  const [searchQuery, setSearchQuery] = useState('');

  const translations = [
    { id: '1', key: 'home.hero.title', en: 'Welcome to Our Platform', fr: 'Bienvenue sur notre plateforme', ar: 'مرحبا بكم في منصتنا', status: 'complete' },
    { id: '2', key: 'home.hero.subtitle', en: 'Build amazing websites', fr: 'Créez des sites Web incroyables', ar: '', status: 'missing' },
    { id: '3', key: 'nav.about', en: 'About', fr: 'À propos', ar: 'حول', status: 'complete' },
    { id: '4', key: 'nav.services', en: 'Services', fr: 'Services', ar: 'خدمات', status: 'complete' },
    { id: '5', key: 'nav.contact', en: 'Contact', fr: 'Contact', ar: 'اتصل', status: 'complete' },
    { id: '6', key: 'footer.copyright', en: '© 2026 All rights reserved', fr: '© 2026 Tous droits réservés', ar: '', status: 'missing' },
  ];

  const filteredTranslations = translations.filter(t =>
    t.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.en.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900">Translations</h1>
          <p className="text-gray-600 mt-2">Manage multilingual content</p>
        </div>
        <Button variant="primary">+ Add Translation</Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search translations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Badge variant="success">Complete: 4</Badge>
          <Badge variant="warning">Missing: 2</Badge>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">Key</TableHead>
              <TableHead>English (EN)</TableHead>
              <TableHead>French (FR)</TableHead>
              <TableHead>Arabic (AR)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTranslations.map((translation) => (
              <TableRow key={translation.id}>
                <TableCell>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{translation.key}</code>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{translation.en}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{translation.fr || <span className="text-gray-400 italic">Not translated</span>}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm" dir="rtl">{translation.ar || <span className="text-gray-400 italic">Not translated</span>}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={translation.status === 'complete' ? 'success' : 'warning'}>
                    {translation.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">Edit</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
