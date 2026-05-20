import React from 'react';
import { BuilderBlock } from './types';

interface Props {
  block: BuilderBlock | null;
  onChange: (block: BuilderBlock) => void;
  onDelete: () => void;
}

export const BuilderSettingsPanel: React.FC<Props> = ({
  block,
  onChange,
  onDelete,
}) => {
  if (!block) {
    return (
      <aside className="w-80 border-l bg-white p-4">
        <p className="text-gray-500 text-sm">Select a block to edit it.</p>
      </aside>
    );
  }

  const updateProp = (key: string, value: any) => {
    onChange({
      ...block,
      props: {
        ...block.props,
        [key]: value,
      },
    });
  };

  const updateStyle = (key: string, value: any) => {
    onChange({
      ...block,
      styles: {
        ...block.styles,
        [key]: value,
      },
    });
  };

  return (
    <aside className="w-80 border-l bg-white p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold capitalize">{block.type} Settings</h2>

        <button
          onClick={onDelete}
          className="text-sm text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>

      <div className="space-y-4">
        {(block.type === 'heading' || block.type === 'paragraph') && (
          <div>
            <label className="block text-sm font-medium mb-1">Text</label>
            <textarea
              value={block.props.text || ''}
              onChange={(e) => updateProp('text', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={4}
            />
          </div>
        )}

        {block.type === 'heading' && (
          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <select
              value={block.props.level || 'h2'}
              onChange={(e) => updateProp('level', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="h1">H1</option>
              <option value="h2">H2</option>
              <option value="h3">H3</option>
            </select>
          </div>
        )}

        {block.type === 'button' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Button Text</label>
              <input
                value={block.props.text || ''}
                onChange={(e) => updateProp('text', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Link</label>
              <input
                value={block.props.href || ''}
                onChange={(e) => updateProp('href', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </>
        )}

        {block.type === 'image' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                value={block.props.src || ''}
                onChange={(e) => updateProp('src', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Alt Text</label>
              <input
                value={block.props.alt || ''}
                onChange={(e) => updateProp('alt', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </>
        )}

        {block.type === 'columns' && (
          <div>
            <label className="block text-sm font-medium mb-1">Columns</label>
            <select
              value={block.props.columns || 2}
              onChange={(e) => updateProp('columns', Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value={2}>2 Columns</option>
              <option value={3}>3 Columns</option>
              <option value={4}>4 Columns</option>
            </select>
          </div>
        )}

        <hr />

        <div>
          <label className="block text-sm font-medium mb-1">Text Color</label>
          <input
            type="color"
            value={block.styles.color || '#111827'}
            onChange={(e) => updateStyle('color', e.target.value)}
            className="w-full h-10"
          />
        </div>

        {(block.type === 'section' || block.type === 'button') && (
          <div>
            <label className="block text-sm font-medium mb-1">Background Color</label>
            <input
              type="color"
              value={block.styles.backgroundColor || '#ffffff'}
              onChange={(e) => updateStyle('backgroundColor', e.target.value)}
              className="w-full h-10"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Font Size</label>
          <input
            type="number"
            value={block.styles.fontSize || ''}
            onChange={(e) => updateStyle('fontSize', Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Margin Bottom</label>
          <input
            type="number"
            value={block.styles.marginBottom || 0}
            onChange={(e) => updateStyle('marginBottom', Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {(block.type === 'section' || block.type === 'button') && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Padding Top</label>
              <input
                type="number"
                value={block.styles.paddingTop || 0}
                onChange={(e) => updateStyle('paddingTop', Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Padding Bottom</label>
              <input
                type="number"
                value={block.styles.paddingBottom || 0}
                onChange={(e) => updateStyle('paddingBottom', Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Border Radius</label>
          <input
            type="number"
            value={block.styles.borderRadius || 0}
            onChange={(e) => updateStyle('borderRadius', Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
    </aside>
  );
};