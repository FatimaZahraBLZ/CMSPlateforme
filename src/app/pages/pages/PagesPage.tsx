import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { useCMS } from '../../contexts/CMSContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Page } from '../../types';

// ============================================
// HELPER FUNCTIONS
// ============================================
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const PagesPage: React.FC = () => {
  const { selectedWebsite, currentLanguage } = useCMS();
  const { user } = useAuth();

  // State management
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    content: string;
    status: 'draft' | 'published';
  }>({
    title: '',
    slug: '',
    content: '',
    status: 'draft',
  });

  // Track if slug was manually edited
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  // Debounce slug check
  useEffect(() => {
    if (!formData.slug || !selectedWebsite) {
      setSlugError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingSlug(true);
      try {
        const exists = await api.checkPageSlug(
          selectedWebsite.id,
          formData.slug,
          currentLanguage || 'en',
          editingPageId || undefined
        );
        if (exists) {
          setSlugError(`Slug "${formData.slug}" is already in use. Please choose a different one.`);
        } else {
          setSlugError(null);
        }
      } catch (err) {
        console.error('Slug check error:', err);
      } finally {
        setCheckingSlug(false);
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timer);
  }, [formData.slug, selectedWebsite, editingPageId, currentLanguage]);

  // ============================================
  // 1. FETCH REAL API DATA (CRITICAL)
  // ============================================
  const fetchPages = async () => {
    if (!selectedWebsite) return;

    try {
      setLoading(true);
      setError(null);
      const data = await api.getPages(selectedWebsite.id, currentLanguage);
      setPages(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load pages';
      setError(errorMsg);
      console.error('Fetch pages error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [selectedWebsite, currentLanguage]);

  // ============================================
  // 2. NOTIFICATION HELPER
  // ============================================
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // ============================================
  // 3. CREATE / UPDATE PAGE
  // ============================================
  const handleSavePage = async (publishNow: boolean = false) => {
    if (!formData.title || !formData.slug) {
      showNotification('error', 'Please fill in all required fields (title, slug)');
      return;
    }

    if (slugError) {
      showNotification('error', 'Please resolve the slug conflict before saving');
      return;
    }

    try {
      const pageData = {
        title: formData.title.trim(),
        slug: formData.slug.trim().replace(/^\/+/, ''), // Remove leading slashes
        content: formData.content,
        website_id: selectedWebsite.id,
        language: currentLanguage || 'en',
        status: publishNow ? 'published' : formData.status,
      };

      console.log('Sending page data:', pageData);

      if (editingPageId) {
        // UPDATE existing page
        await api.updatePage(editingPageId, pageData);
        showNotification('success', `Page "${formData.title}" updated successfully`);
      } else {
        // CREATE new page
        await api.createPage(pageData);
        showNotification('success', `Page "${formData.title}" created successfully`);
      }

      // Refresh pages list
      await fetchPages();
      resetForm();
      setShowModal(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save page';
      showNotification('error', errorMsg);
      console.error('Save page error:', err);
    }
  };

  // ============================================
  // 4. DELETE PAGE (ADMIN ONLY)
  // ============================================
  const handleDeletePage = async (pageId: string, title: string) => {
    if (!user || user.role === 'editor') {
      showNotification('error', 'Only admins can delete pages');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await api.deletePage(pageId);
      showNotification('success', `Page "${title}" deleted successfully`);
      setPages(prev => prev.filter(p => p.id !== pageId));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete page';
      showNotification('error', errorMsg);
      console.error('Delete page error:', err);
    }
  };

  // ============================================
  // 5. EDIT PAGE (LOAD INTO FORM)
  // ============================================
  const handleEditPage = (page: Page) => {
    setEditingPageId(page.id);
    const pageStatus = page.status === 'published' ? 'published' : 'draft';
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      status: pageStatus,
    });
    setSlugManuallyEdited(true); // Mark as manually edited when loading existing page
    setShowModal(true);
  };

  // ============================================
  // 6. RESET FORM
  // ============================================
  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      status: 'draft',
    });
    setEditingPageId(null);
    setSlugManuallyEdited(false);
    setSlugError(null);
  };

  // ============================================
  // 7. HANDLE STATUS CHANGE (PUBLISH/UNPUBLISH)
  // ============================================
  const handlePublish = async (page: Page) => {
    if (!selectedWebsite) return;

    try {
      const newStatus = page.status === 'published' ? 'draft' : 'published';
      await api.updatePage(page.id, {
        title: page.title,
        slug: page.slug,
        content: page.content,
        website_id: selectedWebsite.id,
        language: page.language,
        status: newStatus,
      });
      showNotification('success', `Page "${page.title}" ${newStatus === 'published' ? 'published' : 'unpublished'}`);
      await fetchPages();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update page status';
      showNotification('error', errorMsg);
      console.error('Publish error:', err);
    }
  };

  // ============================================
  // 8. FILTER PAGES BY STATUS
  // ============================================
  const filteredPages = pages.filter(page => {
    if (statusFilter === 'all') return true;
    return page.status === statusFilter;
  });

  // ============================================
  // GUARD: Website selection required
  // ============================================
  if (!selectedWebsite) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Please select a website first</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* NOTIFICATION BANNER */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg ${
          notification.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <p className="font-medium">{notification.message}</p>
        </div>
      )}

      {/* ERROR BANNER */}
      {error && (
        <div className="p-4 rounded-lg border bg-red-50 border-red-200 text-red-800">
          <p className="font-medium">Error: {error}</p>
          <Button size="sm" variant="ghost" onClick={fetchPages} className="mt-2">
            Try Again
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pages</h1>
          <p className="text-gray-600 mt-2">Manage your website pages</p>
        </div>
        <Button variant="primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + Create Page
        </Button>
      </div>

      {/* STATUS FILTER */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={statusFilter === 'all' ? 'primary' : 'ghost'}
          onClick={() => setStatusFilter('all')}
        >
          All ({pages.length})
        </Button>
        <Button
          size="sm"
          variant={statusFilter === 'draft' ? 'primary' : 'ghost'}
          onClick={() => setStatusFilter('draft')}
        >
          Draft ({pages.filter(p => p.status === 'draft').length})
        </Button>
        <Button
          size="sm"
          variant={statusFilter === 'published' ? 'primary' : 'ghost'}
          onClick={() => setStatusFilter('published')}
        >
          Published ({pages.filter(p => p.status === 'published').length})
        </Button>
      </div>

      {/* LOADING SPINNER */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pages...</p>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filteredPages.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-600 mb-4">No pages yet</p>
          <Button
            variant="primary"
            onClick={() => { resetForm(); setShowModal(true); }}
          >
            Create your first page
          </Button>
        </div>
      )}

      {/* PAGES TABLE */}
      {!loading && filteredPages.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
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
                    <span className="text-gray-600 text-sm">/{page.slug}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={page.status === 'published' ? 'success' : 'warning'}>
                      {page.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600 text-sm">
                      {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {/* EDIT BUTTON */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditPage(page)}
                      >
                        Edit
                      </Button>

                      {/* PUBLISH/UNPUBLISH BUTTON */}
                      <Button
                        size="sm"
                        variant={page.status === 'published' ? 'secondary' : 'success'}
                        onClick={() => handlePublish(page)}
                      >
                        {page.status === 'published' ? 'Unpublish' : 'Publish'}
                      </Button>

                      {/* DELETE BUTTON (ADMIN ONLY) */}
                      {user && user.role !== 'editor' && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeletePage(page.id, page.title)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* CREATE / UPDATE MODAL */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingPageId ? 'Edit Page' : 'Create New Page'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Page Title *"
            placeholder="Enter page title"
            value={formData.title}
            onChange={(e) => {
              const newTitle = e.target.value;
              setFormData({ ...formData, title: newTitle });
              
              // Auto-generate slug from title (only if not manually edited and creating new page)
              if (!editingPageId && !slugManuallyEdited) {
                const newSlug = slugify(newTitle);
                setFormData(prev => ({ ...prev, slug: newSlug }));
              }
            }}
          />
          <Input
            label="Slug *"
            placeholder="page-url-slug"
            value={formData.slug}
            onChange={(e) => {
              setFormData({ ...formData, slug: e.target.value });
              setSlugManuallyEdited(true);
            }}
            disabled={checkingSlug}
            className={slugError ? 'border-red-500' : ''}
          />
          {checkingSlug && <p className="text-sm text-blue-600">Checking availability...</p>}
          {slugError && <p className="text-sm text-red-600">⚠️ {slugError}</p>}
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
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
            ]}
          />
          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => { setShowModal(false); resetForm(); }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={() => handleSavePage(false)}
              disabled={!!slugError || checkingSlug}
              className="flex-1"
            >
              {editingPageId ? 'Update Draft' : 'Save Draft'}
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSavePage(true)}
              disabled={!!slugError || checkingSlug}
              className="flex-1"
            >
              {editingPageId ? 'Update & Publish' : 'Publish'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
