import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useCMS } from '../../contexts/CMSContext';

export const MediaPage: React.FC = () => {
  const { selectedWebsite } = useCMS();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  const mediaItems = [
    { id: '1', name: 'hero-image.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400', size: '2.4 MB', date: '2026-03-25' },
    { id: '2', name: 'team-photo.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400', size: '3.1 MB', date: '2026-03-24' },
    { id: '3', name: 'product-1.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=400', size: '1.8 MB', date: '2026-03-23' },
    { id: '4', name: 'office-space.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', size: '2.9 MB', date: '2026-03-22' },
    { id: '5', name: 'presentation.pdf', type: 'document', url: '', size: '5.2 MB', date: '2026-03-21' },
    { id: '6', name: 'intro-video.mp4', type: 'video', url: '', size: '45.3 MB', date: '2026-03-20' },
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-2">Manage your images, videos, and documents</p>
        </div>
        <Button variant="primary" onClick={() => setShowUploadModal(true)}>
          + Upload Media
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mediaItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => setSelectedMedia(item.id)}
          >
            <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
              {item.type === 'image' ? (
                <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <div className="text-5xl">
                  {item.type === 'video' ? '🎥' : '📄'}
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">{item.size}</span>
                <span className="text-xs text-gray-500">{item.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Media">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer">
            <div className="text-5xl mb-4">📁</div>
            <p className="text-gray-900 font-medium mb-2">Drop files here or click to browse</p>
            <p className="text-sm text-gray-500">Supports: JPG, PNG, GIF, PDF, MP4 (Max 50MB)</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowUploadModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setShowUploadModal(false)} className="flex-1">
              Upload
            </Button>
          </div>
        </div>
      </Modal>

      {selectedMedia && (
        <Modal isOpen={!!selectedMedia} onClose={() => setSelectedMedia(null)} title="Media Details">
          <div className="space-y-4">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={mediaItems.find(m => m.id === selectedMedia)?.url}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm"><span className="font-medium">Name:</span> {mediaItems.find(m => m.id === selectedMedia)?.name}</p>
              <p className="text-sm"><span className="font-medium">Size:</span> {mediaItems.find(m => m.id === selectedMedia)?.size}</p>
              <p className="text-sm"><span className="font-medium">Type:</span> {mediaItems.find(m => m.id === selectedMedia)?.type}</p>
              <p className="text-sm"><span className="font-medium">Date:</span> {mediaItems.find(m => m.id === selectedMedia)?.date}</p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="danger" onClick={() => setSelectedMedia(null)}>
                Delete
              </Button>
              <Button variant="primary" onClick={() => setSelectedMedia(null)}>
                Copy URL
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
