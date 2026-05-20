export type BuilderBlockType =
  | 'section'
  | 'container'
  | 'heading'
  | 'paragraph'
  | 'button'
  | 'image'
  | 'columns';

export interface BuilderBlock {
  id: string;
  type: BuilderBlockType;
  props: Record<string, any>;
  styles: Record<string, any>;
  children?: BuilderBlock[];
}

export interface BuilderContent {
  version: 1;
  blocks: BuilderBlock[];
}