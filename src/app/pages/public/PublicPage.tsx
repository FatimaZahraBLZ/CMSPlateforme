import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { SubdomainService } from '../../services/SubdomainService';
import { api } from '../../services/api';

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  language: string;
  status: string;
  meta_title?: string;
  meta_description?: string;
  meta_image?: string;
  created_at: string;
  updated_at: string;
}

export const PublicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      try {
        const subdomain = SubdomainService.getSubdomain();
        if (!subdomain) {
          setError('No subdomain detected');
          setLoading(false);
          return;
        }

        // First, get the website by subdomain
        const websiteResponse = await api.getPublicWebsite(subdomain);
        if (!websiteResponse.website) {
          setError('Website not found');
          setLoading(false);
          return;
        }

        const websiteId = websiteResponse.website.id;

        // Then get the page by slug
        const pageResponse = await api.getPublicPage(websiteId, slug || '');

        if (pageResponse.status === 'success' && pageResponse.page) {
          setPage(pageResponse.page);
        } else {
          setError(pageResponse.message || 'Page not found');
        }
      } catch (err) {
        setError('Failed to load page');
        console.error('Error loading page:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadPage();
    }
  }, [slug]);

  useEffect(() => {
    // Update document title and meta tags
    if (page) {
      document.title = page.meta_title || page.title || 'CMS Platform';

      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', page.meta_description || '');
      }

      // Update meta image (Open Graph)
      const metaImage = document.querySelector('meta[property="og:image"]');
      if (metaImage && page.meta_image) {
        metaImage.setAttribute('content', page.meta_image);
      }
    }
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">Page not found</p>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{page.title}</h1>
          {page.meta_description && (
            <p className="text-xl text-gray-600">{page.meta_description}</p>
          )}
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
};