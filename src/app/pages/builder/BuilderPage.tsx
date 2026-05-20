import React, { useEffect, useMemo, useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useNavigate, useParams } from 'react-router';
import { api } from '../../services/api';
import { BuilderBlock, BuilderContent, BuilderBlockType } from '../../builder/types';
import { createBlock } from '../../builder/blockFactory';
import { BuilderSidebar } from '../../builder/BuilderSidebar';
import { BuilderCanvas } from '../../builder/BuilderCanvas';
import { BuilderSettingsPanel } from '../../builder/BuilderSettingsPanel';
import { useCMS } from '../../contexts/CMSContext';

const emptyContent: BuilderContent = {
  version: 1,
  blocks: [],
};

const parseBuilderContent = (content: string | null | undefined): BuilderContent => {
  if (!content) return emptyContent;

  try {
    const parsed = JSON.parse(content);

    if (parsed?.version === 1 && Array.isArray(parsed.blocks)) {
      return parsed;
    }

    return {
      version: 1,
      blocks: [
        {
          id: crypto.randomUUID(),
          type: 'section',
          props: {},
          styles: {
            paddingTop: 80,
            paddingBottom: 80,
            backgroundColor: '#ffffff',
          },
          children: [
            {
              id: crypto.randomUUID(),
              type: 'container',
              props: {},
              styles: {
                maxWidth: 900,
                paddingLeft: 24,
                paddingRight: 24,
              },
              children: [
                {
                  id: crypto.randomUUID(),
                  type: 'heading',
                  props: {
                    text: 'Page Content',
                    level: 'h1',
                  },
                  styles: {
                    fontSize: 48,
                    fontWeight: 700,
                    color: '#111827',
                    marginBottom: 20,
                  },
                },
                {
                  id: crypto.randomUUID(),
                  type: 'paragraph',
                  props: {
                    text: content.replace(/<[^>]*>/g, ''),
                  },
                  styles: {
                    fontSize: 18,
                    color: '#4b5563',
                    lineHeight: 1.7,
                  },
                },
              ],
            },
          ],
        },
      ],
    };
  } catch {
    return emptyContent;
  }
};

const updateBlockRecursive = (
  blocks: BuilderBlock[],
  updatedBlock: BuilderBlock
): BuilderBlock[] => {
  return blocks.map((block) => {
    if (block.id === updatedBlock.id) {
      return updatedBlock;
    }

    if (block.children) {
      return {
        ...block,
        children: updateBlockRecursive(block.children, updatedBlock),
      };
    }

    return block;
  });
};

const deleteBlockRecursive = (
  blocks: BuilderBlock[],
  blockId: string
): BuilderBlock[] => {
  return blocks
    .filter((block) => block.id !== blockId)
    .map((block) => ({
      ...block,
      children: block.children
        ? deleteBlockRecursive(block.children, blockId)
        : block.children,
    }));
};

export const BuilderPage: React.FC = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();

  const [page, setPage] = useState<any>(null);
  const [content, setContent] = useState<BuilderContent>(emptyContent);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { selectedWebsite } = useCMS();

  const selectedBlock = useMemo(() => {
    const findBlock = (blocks: BuilderBlock[]): BuilderBlock | null => {
      for (const block of blocks) {
        if (block.id === selectedBlockId) return block;

        if (block.children) {
          const found = findBlock(block.children);
          if (found) return found;
        }
      }

      return null;
    };

    return findBlock(content.blocks);
  }, [content, selectedBlockId]);

  useEffect(() => {
const loadPage = async () => {
  if (!pageId) return;

  if (!selectedWebsite?.id) {
    alert('Please select a website first');
    navigate('/pages');
    return;
  }

  try {
    setLoading(true);

    const pages = await api.getPages(selectedWebsite.id);
    const found = pages.find((item: any) => item.id === pageId);

    if (!found) {
      alert('Page not found');
      navigate('/pages');
      return;
    }

    setPage(found);
    setContent(parseBuilderContent(found.content));
  } catch (error) {
    console.error(error);
    alert('Failed to load page');
  } finally {
    setLoading(false);
  }
};

    loadPage();
  }, [pageId, selectedWebsite?.id]);

  const handleDragEnd = (event: DragEndEvent) => {
    const type = event.active.data.current?.type as BuilderBlockType | undefined;

    if (!type) return;

    const newBlock = createBlock(type);

    setContent((current) => ({
      ...current,
      blocks: [...current.blocks, newBlock],
    }));

    setSelectedBlockId(newBlock.id);
  };

  const handleUpdateBlock = (updatedBlock: BuilderBlock) => {
    setContent((current) => ({
      ...current,
      blocks: updateBlockRecursive(current.blocks, updatedBlock),
    }));

    setSelectedBlockId(updatedBlock.id);
  };

  const handleDeleteBlock = () => {
    if (!selectedBlockId) return;

    setContent((current) => ({
      ...current,
      blocks: deleteBlockRecursive(current.blocks, selectedBlockId),
    }));

    setSelectedBlockId(null);
  };

  const handleSave = async () => {
    if (!pageId || !page) return;

    try {
      setSaving(true);

await api.updatePage(pageId, {
  website_id: page.website_id || page.websiteId,
  title: page.title,
  slug: page.slug,
  language: page.language || 'en',
  status: page.status || 'draft',
  content: JSON.stringify(content),
  image: page.image || null,
  meta_title: page.meta_title || null,
  meta_description: page.meta_description || null,
  meta_image: page.meta_image || null,
  template: page.template || 'default',
  excerpt: page.excerpt || null,
});

      alert('Page design saved successfully');
    } catch (error) {
      console.error(error);
      alert('Failed to save page design');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading builder...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="h-14 border-b flex items-center justify-between px-4 bg-white">
        <div>
          <h1 className="font-bold">Page Builder</h1>
          <p className="text-xs text-gray-500">{page?.title}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate('/pages')}
            className="px-4 py-2 rounded-lg border text-sm"
          >
            Back
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm"
          >
            {saving ? 'Saving...' : 'Save Design'}
          </button>
        </div>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex flex-1 min-h-0">
          <BuilderSidebar />

          <BuilderCanvas
            content={content}
            selectedBlockId={selectedBlockId}
            onSelectBlock={(block) => setSelectedBlockId(block.id)}
          />

          <BuilderSettingsPanel
            block={selectedBlock}
            onChange={handleUpdateBlock}
            onDelete={handleDeleteBlock}
          />
        </div>
      </DndContext>
    </div>
  );
};