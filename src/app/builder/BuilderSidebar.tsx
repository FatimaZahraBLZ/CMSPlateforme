import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { BuilderBlockType } from './types';

const blocks: { type: BuilderBlockType; label: string }[] = [
  { type: 'section', label: 'Section' },
  { type: 'container', label: 'Container' },
  { type: 'heading', label: 'Heading' },
  { type: 'paragraph', label: 'Paragraph' },
  { type: 'button', label: 'Button' },
  { type: 'image', label: 'Image' },
  { type: 'columns', label: 'Columns' },
];

const DraggableBlock = ({ type, label }: { type: BuilderBlockType; label: string }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `new-${type}`,
    data: { type },
  });

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
      }}
      className="w-full text-left px-4 py-3 rounded-lg border bg-white hover:bg-gray-50"
    >
      {label}
    </button>
  );
};

export const BuilderSidebar = () => {
  return (
    <aside className="w-64 border-r bg-gray-50 p-4 space-y-3 overflow-y-auto">
      <h2 className="font-bold text-gray-900 mb-4">Blocks</h2>

      {blocks.map((block) => (
        <DraggableBlock key={block.type} type={block.type} label={block.label} />
      ))}
    </aside>
  );
};