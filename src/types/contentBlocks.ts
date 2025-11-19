// Типи блоків контенту для конструктора
export type ContentBlockType = 
  | 'heading' 
  | 'subheading' 
  | 'paragraph' 
  | 'button' 
  | 'audio' 
  | 'video' 
  | 'image';

export interface BaseContentBlock {
  id: string;
  type: ContentBlockType;
}

export interface HeadingBlock extends BaseContentBlock {
  type: 'heading';
  text: string;
}

export interface SubheadingBlock extends BaseContentBlock {
  type: 'subheading';
  text: string;
}

export interface ParagraphBlock extends BaseContentBlock {
  type: 'paragraph';
  text: string;
}

export interface ButtonBlock extends BaseContentBlock {
  type: 'button';
  text: string;
  url: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface AudioBlock extends BaseContentBlock {
  type: 'audio';
  url: string;
  title?: string;
}

export interface VideoBlock extends BaseContentBlock {
  type: 'video';
  url: string;
  title?: string;
}

export interface ImageBlock extends BaseContentBlock {
  type: 'image';
  url: string;
  alt?: string;
  caption?: string;
}

export type ContentBlock = 
  | HeadingBlock 
  | SubheadingBlock 
  | ParagraphBlock 
  | ButtonBlock 
  | AudioBlock 
  | VideoBlock 
  | ImageBlock;

// Контент для кожного тарифу
export interface TierContent {
  basic: ContentBlock[];    // Тариф "Світло"
  deep: ContentBlock[];     // Тариф "Магія"
  premium: ContentBlock[];  // Тариф "Диво"
}
