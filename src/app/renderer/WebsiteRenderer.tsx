import React from 'react';
import { BuilderBlock, BuilderContent } from '../builder/types';

interface Props {
  content: BuilderContent;
  selectedBlockId?: string | null;
  onSelectBlock?: (block: BuilderBlock) => void;
  editable?: boolean;
}

const toCss = (styles: Record<string, any>) => {
  const css: React.CSSProperties = {};

  Object.entries(styles || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (
      [
        'fontSize',
        'marginBottom',
        'paddingTop',
        'paddingBottom',
        'paddingLeft',
        'paddingRight',
        'borderRadius',
        'maxWidth',
        'gap',
      ].includes(key)
    ) {
      css[key as any] = typeof value === 'number' ? `${value}px` : value;
    } else {
      css[key as any] = value;
    }
  });

  return css;
};

const renderBlock = (
  block: BuilderBlock,
  options: {
    selectedBlockId?: string | null;
    onSelectBlock?: (block: BuilderBlock) => void;
    editable?: boolean;
  }
): React.ReactNode => {
  const isSelected = options.selectedBlockId === block.id;

  const commonProps = {
    onClick: (e: React.MouseEvent) => {
      if (!options.editable) return;
      e.stopPropagation();
      options.onSelectBlock?.(block);
    },
    style: {
      ...toCss(block.styles),
      outline: isSelected ? '2px solid #2563eb' : undefined,
      outlineOffset: isSelected ? '4px' : undefined,
      cursor: options.editable ? 'pointer' : undefined,
    },
  };

  switch (block.type) {
    case 'section':
      return (
        <section key={block.id} {...commonProps}>
          {block.children?.map((child) => renderBlock(child, options))}
        </section>
      );

    case 'container':
      return (
        <div
          key={block.id}
          {...commonProps}
          style={{
            maxWidth: `${block.styles?.maxWidth || 1200}px`,
            margin: '0 auto',
            paddingLeft: `${block.styles?.paddingLeft || 24}px`,
            paddingRight: `${block.styles?.paddingRight || 24}px`,
            ...toCss(block.styles),
            outline: isSelected ? '2px solid #2563eb' : undefined,
          }}
        >
          {block.children?.map((child) => renderBlock(child, options))}
        </div>
      );

    case 'heading': {
      const Tag = block.props?.level || 'h2';

      return React.createElement(
        Tag,
        {
          key: block.id,
          ...commonProps,
        },
        block.props?.text || 'Heading'
      );
    }

    case 'paragraph':
      return (
        <p key={block.id} {...commonProps}>
          {block.props?.text || 'Paragraph'}
        </p>
      );

    case 'button':
      return (
        <a key={block.id} href={block.props?.href || '#'} {...commonProps}>
          {block.props?.text || 'Button'}
        </a>
      );

    case 'image':
      return (
        <img
          key={block.id}
          src={block.props?.src || 'https://placehold.co/800x500?text=Image'}
          alt={block.props?.alt || ''}
          {...commonProps}
        />
      );

    case 'columns':
      return (
        <div
          key={block.id}
          {...commonProps}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${block.props?.columns || 2}, minmax(0, 1fr))`,
            gap: `${block.styles?.gap || 32}px`,
          }}
        >
          {block.children?.map((child) => renderBlock(child, options))}
        </div>
      );

    default:
      return null;
  }
};

export const WebsiteRenderer: React.FC<Props> = ({
  content,
  selectedBlockId,
  onSelectBlock,
  editable = false,
}) => {
  return (
    <>
      {(content?.blocks || []).map((block) =>
        renderBlock(block, {
          selectedBlockId,
          onSelectBlock,
          editable,
        })
      )}
    </>
  );
};