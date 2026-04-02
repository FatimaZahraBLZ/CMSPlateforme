import React, { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/Button';
import { useCMS } from '../../contexts/CMSContext';

export const PreviewPage: React.FC = () => {
  const { selectedWebsite, currentLanguage, setCurrentLanguage } = useCMS();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  if (!selectedWebsite) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Please select a website first</p>
      </div>
    );
  }

  const deviceSizes = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Preview Mode</h1>
          <p className="text-gray-600 mt-2">Preview your website before publishing</p>
        </div>
        <Link to="/publish">
          <Button variant="success">Ready to Publish</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setDevice('desktop')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                device === 'desktop'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🖥️ Desktop
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                device === 'tablet'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📱 Tablet
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                device === 'mobile'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📱 Mobile
            </button>
          </div>

          <div className="flex gap-2">
            {['en', 'fr', 'ar'].map((lang) => (
              <button
                key={lang}
                onClick={() => setCurrentLanguage(lang as 'en' | 'fr' | 'ar')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  currentLanguage === lang
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-8 flex justify-center overflow-x-auto">
          <div className={`${deviceSizes[device]} bg-white shadow-xl rounded-lg overflow-hidden transition-all duration-300`}>
            <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 bg-gray-700 rounded px-3 py-1 text-xs text-gray-300">
                {selectedWebsite.domain}
              </div>
            </div>

            <div className="bg-white">
              <iframe
                src="/public"
                className="w-full h-[600px] border-0"
                title="Website Preview"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Link to="/public" target="_blank" className="block">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-3xl mb-3">🏠</div>
            <h3 className="font-semibold text-gray-900 mb-1">Homepage</h3>
            <p className="text-sm text-gray-600">Preview the main landing page</p>
          </div>
        </Link>

        <Link to="/public/about" target="_blank" className="block">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-3xl mb-3">📖</div>
            <h3 className="font-semibold text-gray-900 mb-1">About Page</h3>
            <p className="text-sm text-gray-600">View company information</p>
          </div>
        </Link>

        <Link to="/public/blog" target="_blank" className="block">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-semibold text-gray-900 mb-1">Blog</h3>
            <p className="text-sm text-gray-600">Check all articles</p>
          </div>
        </Link>
      </div>
    </div>
  );
};
