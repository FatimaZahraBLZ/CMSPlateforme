import React, { useEffect, useState } from 'react';
import { SubdomainService } from '../../services/SubdomainService';
import { api } from '../../services/api';
import { PublicTemplateRenderer } from '../../components/public/PublicTemplateRenderer';

interface PublicSlugPageProps {
  slug: string;
}

export const PublicSlugPage: React.FC<PublicSlugPageProps> = ({ slug }) => {
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        setError(null);

        const subdomain = SubdomainService.getSubdomain();

        if (!subdomain) {
          setError('No subdomain detected');
          return;
        }

        const websiteResponse = await api.getPublicWebsite(subdomain);

        if (!websiteResponse.website) {
          setError('Website not found');
          return;
        }

        const response = await api.getPublicPage(websiteResponse.website.id, slug);

        if (response.status === 'success' && response.page) {
          setPageData(response);

          document.title =
            response.metadata?.title ||
            response.page.meta_title ||
            response.page.title ||
            response.website?.name ||
            'Website';
        } else {
          setError(response.message || 'Page not found');
        }
      } catch (err) {
        console.error(`Error loading ${slug} page:`, err);
        setError(`${slug} page not found`);
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !pageData?.page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-4">Page not found</p>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return <PublicTemplateRenderer pageData={pageData} />;
};