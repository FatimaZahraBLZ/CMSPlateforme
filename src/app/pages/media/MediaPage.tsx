import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useCMS } from '../../contexts/CMSContext';

const API_BASE_URL = 'http://localhost/CMSPlateforme/backend';

interface MediaItem {
  id: string;
  website_id: string;
  name: string;
  original_name: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  mime_type: string;
  alt_text?: string;
  created_at: string;
}

const getFileUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

const formatSize = (bytes: number) => {
  if (!bytes) return '0 B';
  const mb = bytes / 1024 / 1024;
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
};

export const MediaPage: React.FC = () => {
  const { selectedWebsite } = useCMS();

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const selectedMedia = useMemo(() => {
    return mediaItems.find((item) => item.id === selectedMediaId) || null;
  }, [mediaItems, selectedMediaId]);

  const loadMedia = async () => {
    if (!selectedWebsite?.id) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/media?website_id=${selectedWebsite.id}`
      );

      const result = await response.json();

      if (result.status === 'success') {
        setMediaItems(result.data);
      } else {
        alert(result.message || 'Failed to load media');
      }
    } catch (error) {
      console.error(error);
      alert('Error loading media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [selectedWebsite?.id]);

  const handleUpload = async () => {
    if (!selectedWebsite?.id || !selectedFile) {
      alert('Please choose a file first');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('website_id', selectedWebsite.id);
      formData.append('file', selectedFile);
      formData.append('alt_text', altText);

      const response = await fetch(`${API_BASE_URL}/api/media/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.status === 'success') {
        setShowUploadModal(false);
        setSelectedFile(null);
        setAltText('');
        await loadMedia();
      } else {
        alert(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error(error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMediaId) return;

    const confirmed = window.confirm('Are you sure you want to delete this media?');

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/media/${selectedMediaId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.status === 'success') {
        setSelectedMediaId(null);
        await loadMedia();
      } else {
        alert(result.message || 'Delete failed');
      }
    } catch (error) {
      console.error(error);
      alert('Error deleting media');
    }
  };

  const handleCopyUrl = async () => {
    if (!selectedMedia) return;

    const fullUrl = getFileUrl(selectedMedia.url);
    await navigator.clipboard.writeText(fullUrl);
    alert('Media URL copied');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-2">
            Manage images, videos, and documents for {selectedWebsite.name}
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowUploadModal(true)}>
          + Upload Media
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading media...</div>
      ) : mediaItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <div className="text-5xl mb-4">📁</div>
          <p className="text-gray-900 font-medium">No media uploaded yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Upload your first image, video, or document.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => setSelectedMediaId(item.id)}
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                {item.type === 'image' ? (
                  <img
                    src={getFileUrl(item.url)}
                    alt={item.alt_text || item.original_name || item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="text-5xl">
                    {item.type === 'video' ? '🎥' : '📄'}
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.original_name || item.name}
                </p>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {formatSize(item.size)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.created_at?.slice(0, 10)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Media"
      >
        <div className="space-y-4">
          <label className="block border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,application/pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />

            <div className="text-5xl mb-4">📁</div>

            <p className="text-gray-900 font-medium mb-2">
              {selectedFile ? selectedFile.name : 'Click to browse'}
            </p>

            <p className="text-sm text-gray-500">
              Supports: JPG, PNG, WEBP, GIF, PDF, MP4. Max 50MB.
            </p>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alt text
            </label>
            <input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setShowUploadModal(false);
                setSelectedFile(null);
                setAltText('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="flex-1"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </Modal>

      {selectedMedia && (
        <Modal
          isOpen={!!selectedMedia}
          onClose={() => setSelectedMediaId(null)}
          title="Media Details"
        >
          <div className="space-y-4">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              {selectedMedia.type === 'image' ? (
                <img
                  src={getFileUrl(selectedMedia.url)}
                  alt={selectedMedia.alt_text || selectedMedia.original_name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-6xl">
                  {selectedMedia.type === 'video' ? '🎥' : '📄'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Name:</span>{' '}
                {selectedMedia.original_name || selectedMedia.name}
              </p>

              <p className="text-sm">
                <span className="font-medium">Size:</span>{' '}
                {formatSize(selectedMedia.size)}
              </p>

              <p className="text-sm">
                <span className="font-medium">Type:</span>{' '}
                {selectedMedia.type}
              </p>

              <p className="text-sm">
                <span className="font-medium">MIME:</span>{' '}
                {selectedMedia.mime_type}
              </p>

              <p className="text-sm">
                <span className="font-medium">Date:</span>{' '}
                {selectedMedia.created_at?.slice(0, 10)}
              </p>

              <p className="text-sm break-all">
                <span className="font-medium">URL:</span>{' '}
                {getFileUrl(selectedMedia.url)}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>

              <Button variant="primary" onClick={handleCopyUrl}>
                Copy URL
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};