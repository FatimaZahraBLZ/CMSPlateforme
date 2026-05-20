import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { BuilderBlock, BuilderContent } from './types';
import { WebsiteRenderer } from '../renderer/WebsiteRenderer';

interface Props {
  content: BuilderContent;
  selectedBlockId: string | null;
  onSelectBlock: (block: BuilderBlock) => void;
}

export const BuilderCanvas: React.FC<Props> = ({
  content,
  selectedBlockId,
  onSelectBlock,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'builder-canvas',
  });

  return (
    <main className="flex-1 bg-gray-100 overflow-y-auto p-8">
      <div
        ref={setNodeRef}
        className={`min-h-[800px] bg-white shadow-sm mx-auto ${
          isOver ? 'ring-2 ring-blue-500' : ''
        }`}
        style={{ maxWidth: 1200 }}
      >
        {content.blocks.length === 0 ? (
          <div className="h-[600px] flex items-center justify-center text-gray-400">
            Drag blocks here to start designing your page
          </div>
        ) : (
          <WebsiteRenderer
            content={content}
            editable
            selectedBlockId={selectedBlockId}
            onSelectBlock={onSelectBlock}
          />
        )}
      </div>
    </main>
  );
};