import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
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

export const HomePage: React.FC = () => {
  const [homePage, setHomePage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHomePage = async () => {
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

        // Get the home page (slug = 'home')
        const pageResponse = await api.getPublicPage(websiteId, 'home');

        if (pageResponse.status === 'success' && pageResponse.page) {
          setHomePage(pageResponse.page);
        } else {
          // If no home page exists, show default content
          setHomePage(null);
        }
      } catch (err) {
        setError('Failed to load home page');
        console.error('Error loading home page:', err);
        // Show default content on error
        setHomePage(null);
      } finally {
        setLoading(false);
      }
    };

    loadHomePage();
  }, []);

  useEffect(() => {
    // Update document title and meta tags
    if (homePage) {
      document.title = homePage.meta_title || homePage.title || 'CMS Platform';

      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', homePage.meta_description || '');
      }

      const metaImage = document.querySelector('meta[property="og:image"]');
      if (metaImage && homePage.meta_image) {
        metaImage.setAttribute('content', homePage.meta_image);
      }
    }
  }, [homePage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If we have dynamic content, render it
  if (homePage) {
    return (
      <div className="min-h-screen bg-white">
        {/* Page Header */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{homePage.title}</h1>
            {homePage.meta_description && (
              <p className="text-xl text-gray-600">{homePage.meta_description}</p>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: homePage.content }}
          />
        </div>
      </div>
    );
  }

  // Default static content when no home page exists
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl mb-6">
              Welcome to Our Website
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              This website is powered by CMS Platform. Create and manage your content easily.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                Get Started
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10k+', label: 'Active Users' },
              { value: '50k+', label: 'Websites Created' },
              { value: '99.9%', label: 'Uptime' },
              { value: '24/7', label: 'Support' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features to help you build and manage your websites
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '⚡', title: 'Lightning Fast', description: 'Optimized for speed and performance' },
              { icon: '🎨', title: 'Fully Customizable', description: 'Design your way with complete flexibility' },
              { icon: '🔒', title: 'Secure & Reliable', description: 'Enterprise-grade security built-in' },
              { icon: '📱', title: 'Mobile Responsive', description: 'Perfect on every device and screen size' },
              { icon: '🌍', title: 'Multilingual', description: 'Support for multiple languages out of the box' },
              { icon: '📊', title: 'Analytics Built-in', description: 'Track your performance with detailed insights' },
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Thousands
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Johnson', role: 'CEO, TechCorp', quote: 'This CMS has transformed how we manage our content. Absolutely incredible!' },
              { name: 'Michael Chen', role: 'Designer', quote: 'The best CMS I\'ve ever used. Clean, fast, and powerful.' },
              { name: 'Emily Davis', role: 'Marketing Director', quote: 'Our team productivity has increased by 200% since switching to this platform.' },
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl">
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users building amazing websites today
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              Start Free Trial
            </button>
            <Link to="/public/contact">
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors">
                Contact Sales
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
