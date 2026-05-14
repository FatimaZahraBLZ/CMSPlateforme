import React, { useState, useEffect } from 'react';
import { SubdomainService } from '../../services/SubdomainService';
import { api } from '../../services/api';

interface PageData {
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

export const AboutPage: React.FC = () => {
  const [page, setPage] = useState<PageData | null>(null);
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

        // Get the website by subdomain
        const websiteResponse = await api.getPublicWebsite(subdomain);
        if (!websiteResponse.website) {
          setError('Website not found');
          setLoading(false);
          return;
        }

        const websiteId = websiteResponse.website.id;

        // Check if about page exists in database
        const pageResponse = await api.getPublicPage(websiteId, 'about');

        if (pageResponse.status === 'success' && pageResponse.page) {
          setPage(pageResponse.page);
          // Update document title
          document.title = pageResponse.page.meta_title || pageResponse.page.title || 'About | CMS Platform';
        } else {
          setError('Page not found');
        }
      } catch (err) {
        setError('About page not found');
        console.error('Error loading page:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, []);

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
    <div className="min-h-screen">
      {/* Render database-driven content */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">{page.title}</h1>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }} 
          />
        </div>
      </section>
    </div>
  );
};
