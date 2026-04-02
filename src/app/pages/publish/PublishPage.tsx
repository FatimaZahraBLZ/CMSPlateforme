import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { useCMS } from '../../contexts/CMSContext';

export const PublishPage: React.FC = () => {
  const { selectedWebsite } = useCMS();
  const [showSuccess, setShowSuccess] = useState(false);

  const checklist = [
    { id: '1', label: 'Content ready', description: 'All pages have content', status: true },
    { id: '2', label: 'Pages created', description: '5 pages published', status: true },
    { id: '3', label: 'Menu configured', description: 'Header and footer menus set', status: true },
    { id: '4', label: 'Translations complete', description: 'EN, FR translations ready', status: true },
    { id: '5', label: 'SEO optimized', description: 'Meta tags and analytics configured', status: true },
    { id: '6', label: 'Media uploaded', description: '12 images ready', status: true },
  ];

  const allReady = checklist.every(item => item.status);

  const handlePublish = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  if (!selectedWebsite) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Please select a website first</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Publish Website</h1>
        <p className="text-gray-600 mt-2">Review and publish your website</p>
      </div>

      {showSuccess && (
        <Alert type="success">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Website published successfully!</p>
              <p className="text-sm mt-1">Your website is now live at {selectedWebsite.domain}</p>
            </div>
            <a
              href={`https://${selectedWebsite.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline"
            >
              View Site
            </a>
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pre-Publish Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      item.status ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {item.status && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <Badge variant={item.status ? 'success' : 'warning'}>
                      {item.status ? 'Ready' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publishing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Website URL</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={`https://${selectedWebsite.domain}`}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                    <Button size="sm" variant="ghost">Copy</Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <Badge variant={selectedWebsite.status === 'published' ? 'success' : 'warning'}>
                      {selectedWebsite.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(selectedWebsite.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Publish Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allReady ? (
                  <Alert type="success">
                    All checks passed! Your website is ready to publish.
                  </Alert>
                ) : (
                  <Alert type="warning">
                    Please complete all checklist items before publishing.
                  </Alert>
                )}

                <Button
                  variant="success"
                  className="w-full"
                  disabled={!allReady}
                  onClick={handlePublish}
                >
                  🚀 Publish Website
                </Button>

                <Button variant="ghost" className="w-full">
                  💾 Save as Draft
                </Button>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-3">Quick Actions:</p>
                  <div className="space-y-2">
                    <Button size="sm" variant="ghost" className="w-full justify-start">
                      👁️ Preview Website
                    </Button>
                    <Button size="sm" variant="ghost" className="w-full justify-start">
                      📊 View Analytics
                    </Button>
                    <Button size="sm" variant="ghost" className="w-full justify-start">
                      🔄 Rollback Version
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
