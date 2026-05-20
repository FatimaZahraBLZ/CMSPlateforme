import { v4 as uuidv4 } from 'uuid';
import { BuilderBlock, BuilderBlockType } from './types';

export const createBlock = (type: BuilderBlockType): BuilderBlock => {
  const id = uuidv4();

  switch (type) {
    case 'section':
      return {
        id,
        type,
        props: {},
        styles: {
          paddingTop: 80,
          paddingBottom: 80,
          backgroundColor: '#ffffff',
        },
        children: [],
      };

    case 'container':
      return {
        id,
        type,
        props: {},
        styles: {
          maxWidth: 1200,
          paddingLeft: 24,
          paddingRight: 24,
        },
        children: [],
      };

    case 'heading':
      return {
        id,
        type,
        props: {
          text: 'New Heading',
          level: 'h2',
        },
        styles: {
          fontSize: 42,
          fontWeight: 700,
          color: '#111827',
          textAlign: 'left',
          marginBottom: 16,
        },
      };

    case 'paragraph':
      return {
        id,
        type,
        props: {
          text: 'Write your paragraph here.',
        },
        styles: {
          fontSize: 18,
          color: '#4b5563',
          lineHeight: 1.7,
          marginBottom: 20,
        },
      };

    case 'button':
      return {
        id,
        type,
        props: {
          text: 'Click me',
          href: '#',
        },
        styles: {
          backgroundColor: '#2563eb',
          color: '#ffffff',
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 24,
          paddingRight: 24,
          borderRadius: 12,
          display: 'inline-block',
        },
      };

    case 'image':
      return {
        id,
        type,
        props: {
          src: '',
          alt: 'Image',
        },
        styles: {
          width: '100%',
          borderRadius: 16,
        },
      };

    case 'columns':
      return {
        id,
        type,
        props: {
          columns: 2,
        },
        styles: {
          display: 'grid',
          gap: 32,
        },
        children: [
          createBlock('container'),
          createBlock('container'),
        ],
      };

    default:
      return {
        id,
        type,
        props: {},
        styles: {},
      };
  }
};