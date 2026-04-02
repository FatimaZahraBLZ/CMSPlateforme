import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Alert } from '../../components/ui/Alert';
import { useCMS } from '../../contexts/CMSContext';

export const SEOPage: React.FC = () => {
  const { selectedWebsite } = useCMS();
  const [seo, setSeo] = useState({
    metaTitle: 'Professional CMS Platform - Build Amazing Websites',
    metaDescription: 'Create and manage stunning websites with our powerful CMS platform. Easy to use, fully customizable, and built for performance.',
    metaKeywords: 'CMS, website builder, content management, web development',
    googleAnalytics: 'UA-XXXXXXXXX-X',
    facebookPixel: '',
  });

  if (!selectedWebsite) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Please select a website first</p>
      </div>
    );
  }

  const titleLength = seo.metaTitle.length;
  const descriptionLength = seo.metaDescription.length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SEO Settings</h1>
          <p className="text-gray-600 mt-2">Optimize your website for search engines</p>
        </div>
        <Button variant="primary">Save Settings</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meta Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Input
                    label="Meta Title"
                    placeholder="Your website title"
                    value={seo.metaTitle}
                    onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                  />
                  <div className="mt-1.5 flex justify-between text-xs">
                    <span className={titleLength > 60 ? 'text-red-600' : 'text-gray-500'}>
                      {titleLength} characters
                    </span>
                    <span className="text-gray-500">Recommended: 50-60 characters</span>
                  </div>
                </div>

                <div>
                  <Textarea
                    label="Meta Description"
                    placeholder="Brief description of your website"
                    value={seo.metaDescription}
                    onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                    className="min-h-[100px]"
                  />
                  <div className="mt-1.5 flex justify-between text-xs">
                    <span className={descriptionLength > 160 ? 'text-red-600' : 'text-gray-500'}>
                      {descriptionLength} characters
                    </span>
                    <span className="text-gray-500">Recommended: 150-160 characters</span>
                  </div>
                </div>

                <Input
                  label="Meta Keywords"
                  placeholder="keyword1, keyword2, keyword3"
                  value={seo.metaKeywords}
                  onChange={(e) => setSeo({ ...seo, metaKeywords: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert type="info">
                  Upload a social media image (1200x630px) in the Media Library and paste the URL here.
                </Alert>
                <Input
                  label="Social Media Image URL"
                  placeholder="https://example.com/social-image.jpg"
                />
                <div className="pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Preview:</p>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="w-full h-32 bg-gray-200 rounded mb-3 flex items-center justify-center text-gray-500">
                      Social Media Image Preview
                    </div>
                    <p className="font-medium text-sm">{seo.metaTitle}</p>
                    <p className="text-xs text-gray-600 mt-1">{seo.metaDescription.substring(0, 100)}...</p>
                    <p className="text-xs text-gray-400 mt-1">{selectedWebsite.domain}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics & Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="Google Analytics ID"
                  placeholder="UA-XXXXXXXXX-X or G-XXXXXXXXXX"
                  value={seo.googleAnalytics}
                  onChange={(e) => setSeo({ ...seo, googleAnalytics: e.target.value })}
                />
                <Input
                  label="Facebook Pixel ID"
                  placeholder="XXXXXXXXXXXXXXX"
                  value={seo.facebookPixel}
                  onChange={(e) => setSeo({ ...seo, facebookPixel: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>SEO Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 text-green-600 text-3xl font-bold mb-2">
                  85
                </div>
                <p className="text-sm text-gray-600">Good SEO Score</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Meta Title</span>
                  <span className="text-green-600">✓ Good</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Meta Description</span>
                  <span className="text-green-600">✓ Good</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Social Image</span>
                  <span className="text-yellow-600">⚠ Missing</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Analytics</span>
                  <span className="text-green-600">✓ Configured</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Recommendations:</p>
                <ul className="text-xs text-gray-600 space-y-1.5">
                  <li>• Add a social media image</li>
                  <li>• Consider shorter meta title</li>
                  <li>• Add more specific keywords</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
