export type Role = 'super_admin' | 'admin' | 'editor' | 'visitor';

export type Status = 'active' | 'inactive' | 'draft' | 'published';

export type Language = 'fr' | 'en' | 'ar';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  avatar?: string;
  createdAt: Date;
}

export interface WebsiteProject {
  id: string;
  name: string;
  client: string;
  domain: string;
  subdomain: string;
  status: Status;
  defaultLanguage: Language;
  languages: Language[];
  theme: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Page {
  id: string;
  websiteId: string;
  title: string;
  slug: string;
  content: string;
  image?: string;
  language: Language;
  status: Status;
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface Category {
  id: string;
  websiteId: string;
  name: string;
  slug: string;
  language: Language;
  createdAt: Date;
}

export interface Article {
  id: string;
  websiteId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image?: string;
  categoryId: string;
  authorId: string;
  language: Language;
  status: Status;
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: string;
  publishDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaItem {
  id: string;
  websiteId: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  mimeType: string;
  createdAt: Date;
}

export type MenuType = 'header' | 'footer';

export type MenuItemType = 'page' | 'external' | 'custom';

export interface MenuItem {
  id: string;
  label: string;
  type: MenuItemType;
  link: string;
  pageId?: string;
  order: number;
  parentId?: string;
}

export interface Menu {
  id: string;
  websiteId: string;
  type: MenuType;
  language: Language;
  items: MenuItem[];
  updatedAt: Date;
}

export interface Translation {
  id: string;
  websiteId: string;
  key: string;
  language: Language;
  value: string;
  translated: boolean;
  updatedAt: Date;
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  fontFamily: string;
  fontSize: string;
  buttonStyle: 'rounded' | 'square' | 'pill';
  layoutStyle: 'boxed' | 'full-width';
}

export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  socialImage?: string;
  favicon?: string;
  googleAnalytics?: string;
  facebookPixel?: string;
}

export interface WebsiteSettings {
  id: string;
  websiteId: string;
  siteName: string;
  logo?: string;
  favicon?: string;
  email: string;
  phone: string;
  address: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  theme: ThemeSettings;
  seo: SEOSettings;
  updatedAt: Date;
}

export interface HomepageSection {
  id: string;
  type: 'hero' | 'about' | 'services' | 'stats' | 'testimonials' | 'projects' | 'articles' | 'cta';
  enabled: boolean;
  title?: string;
  subtitle?: string;
  content?: string;
  image?: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
  data?: any;
}

export interface PublishChecklist {
  content: boolean;
  pages: boolean;
  menu: boolean;
  translations: boolean;
  seo: boolean;
  media: boolean;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  timestamp: Date;
}

export interface Stats {
  websites: number;
  pages: number;
  articles: number;
  media: number;
  users: number;
}
