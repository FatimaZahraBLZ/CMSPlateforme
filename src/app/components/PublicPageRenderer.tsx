import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

interface PageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  template: string;
  image?: string;
  meta_title?: string;
  meta_description?: string;
  meta_image?: string;
  excerpt?: string;
}

interface LayoutConfig {
  header: boolean;
  footer: boolean;
  sidebar: boolean;
  breadcrumbs: boolean;
  metadata: boolean;
  featured_image: boolean;
  sections: string[];
}

interface MenuItem {
  id: string;
  label: string;
  type: 'page' | 'external' | 'custom';
  link?: string;
  page_slug?: string;
  order_position: number;
}

interface Navigation {
  header: MenuItem[];
  footer: MenuItem[];
}

interface PageWithLayout {
  page: PageData;
  layout: LayoutConfig;
  navigation: Navigation;
  metadata: {
    title: string;
    description: string;
    image?: string;
  };
}

interface PublicPageRendererProps {
  websiteId: string;
  slug: string;
  language?: string;
}

/**
 * PublicPageRenderer
 * 
 * Complete theme-based page rendering component
 * 
 * Features:
 * - Dynamic layout based on template/theme
 * - Published pages only (is_deleted=FALSE, status=published)
 * - Menu navigation (header + footer)
 * - SEO metadata
 * - Responsive layout
 * - Image optimization
 * 
 * Usage:
 * <PublicPageRenderer websiteId="123" slug="about-us" language="en" />
 */
export const PublicPageRenderer: React.FC<PublicPageRendererProps> = ({
  websiteId,
  slug,
  language = 'en',
}) => {
  const [pageData, setPageData] = useState<PageWithLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch page with layout when route params change
  useEffect(() => {
    fetchPageWithLayout();
  }, [websiteId, slug, language]);

  // Update metadata when page data loads
  useEffect(() => {
    if (!pageData) return;

    if (pageData.metadata?.title) {
      document.title = pageData.metadata.title;
    }

    updateMetaTags();
  }, [pageData]);

  const fetchPageWithLayout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/public/page-with-layout?website_id=${websiteId}&slug=${slug}&language=${language}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError('Page not found');
        } else {
          setError('Failed to load page');
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.status === 'success') {
        setPageData(data);
      } else {
        setError(data.message || 'Failed to load page');
      }
    } catch (err) {
      console.error('Failed to fetch page:', err);
      setError('Failed to load page. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateMetaTags = () => {
    if (!pageData?.metadata) return;

    // Update title
    const titleTag = document.querySelector('title');
    if (titleTag && pageData.metadata.title) {
      titleTag.textContent = pageData.metadata.title;
    }

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    if (pageData.metadata.description) {
      metaDescription.setAttribute('content', pageData.metadata.description);
    }

    // Update og:image
    if (pageData.metadata.image) {
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute('content', pageData.metadata.image);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">{error}</p>
          <a href="/" className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
            Go Home
          </a>
        </div>
      </div>
    );
  }

  if (!pageData) {
    return null;
  }

  const { page, layout, navigation } = pageData;
  const sanitizedContent = DOMPurify.sanitize(page.content);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Navigation */}
      {layout.header && (
        <HeaderNav menu={navigation.header} />
      )}

      {/* Main Content */}
      <main className="flex-1">
        {layout.featured_image && page.image && (
          <img
            src={page.image}
            alt={page.title}
            className="w-full h-96 object-cover"
          />
        )}

        <div className={`${layout.sidebar ? 'grid grid-cols-3 gap-8' : 'w-full'} max-w-7xl mx-auto px-4 py-12`}>
          {/* Breadcrumbs */}
          {layout.breadcrumbs && (
            <Breadcrumbs slug={page.slug} title={page.title} />
          )}

          {/* Page Content */}
          <article className={layout.sidebar ? 'col-span-2' : 'w-full'}>
            <h1 className="text-4xl font-bold mb-6 text-gray-900">{page.title}</h1>

            {page.excerpt && (
              <p className="text-xl text-gray-600 mb-8">{page.excerpt}</p>
            )}

            <div
              className="prose prose-lg max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </article>

          {/* Sidebar */}
          {layout.sidebar && (
            <aside className="col-span-1">
              <SidebarWidget title="Quick Links" menu={navigation.header} />
            </aside>
          )}
        </div>
      </main>

      {/* Footer Navigation */}
      {layout.footer && (
        <FooterNav menu={navigation.footer} />
      )}
    </div>
  );
};

/**
 * Header Navigation Component
 */
const HeaderNav: React.FC<{ menu: MenuItem[] }> = ({ menu }) => {
  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 py-4">
        <ul className="flex gap-8">
          {menu.map((item) => (
            <li key={item.id}>
              <a
                href={item.type === 'page' ? `/${item.page_slug}` : item.link || '#'}
                className="text-gray-700 hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

/**
 * Footer Navigation Component
 */
const FooterNav: React.FC<{ menu: MenuItem[] }> = ({ menu }) => {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-4 gap-8 mb-8">
          <nav>
            <h3 className="font-bold mb-4">Navigation</h3>
            <ul className="space-y-2">
              {menu.slice(0, 4).map((item) => (
                <li key={item.id}>
                  <a
                    href={item.type === 'page' ? `/${item.page_slug}` : item.link || '#'}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

/**
 * Breadcrumbs Component
 */
const Breadcrumbs: React.FC<{ slug: string; title: string }> = ({ slug, title }) => {
  return (
    <nav className="mb-6 text-sm text-gray-600">
      <ol className="flex items-center gap-2">
        <li>
          <a href="/" className="hover:text-primary">Home</a>
        </li>
        <li>/</li>
        <li className="text-gray-900 font-medium">{title}</li>
      </ol>
    </nav>
  );
};

/**
 * Sidebar Widget Component
 */
const SidebarWidget: React.FC<{ title: string; menu: MenuItem[] }> = ({ title, menu }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="font-bold text-lg mb-4">{title}</h3>
      <ul className="space-y-2">
        {menu.slice(0, 5).map((item) => (
          <li key={item.id}>
            <a
              href={item.type === 'page' ? `/${item.page_slug}` : item.link || '#'}
              className="text-gray-700 hover:text-primary transition-colors text-sm"
            >
              → {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PublicPageRenderer;
