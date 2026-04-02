import { WebsiteProject, Page, Article, Category, MediaItem, User, Activity, Stats } from '../types';

export const mockWebsites: WebsiteProject[] = [
  {
    id: '1',
    name: 'Corporate Website',
    client: 'Acme Corp',
    domain: 'acmecorp.com',
    status: 'published',
    defaultLanguage: 'en',
    languages: ['en', 'fr'],
    theme: 'modern',
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-03-20'),
  },
  {
    id: '2',
    name: 'E-commerce Store',
    client: 'TechMart',
    domain: 'techmart.com',
    status: 'draft',
    defaultLanguage: 'en',
    languages: ['en', 'fr', 'ar'],
    theme: 'clean',
    createdAt: new Date('2026-02-10'),
    updatedAt: new Date('2026-03-25'),
  },
  {
    id: '3',
    name: 'Portfolio Site',
    client: 'Creative Studio',
    domain: 'creativestudio.io',
    status: 'published',
    defaultLanguage: 'fr',
    languages: ['fr', 'en'],
    theme: 'minimalist',
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-03-15'),
  },
];

export const mockPages: Page[] = [
  {
    id: '1',
    websiteId: '1',
    title: 'Home',
    slug: 'home',
    content: 'Welcome to our website',
    language: 'en',
    status: 'published',
    metaTitle: 'Home - Acme Corp',
    metaDescription: 'Welcome to Acme Corp',
    createdAt: new Date('2026-01-16'),
    updatedAt: new Date('2026-03-25'),
    publishedAt: new Date('2026-03-25'),
  },
  {
    id: '2',
    websiteId: '1',
    title: 'About Us',
    slug: 'about',
    content: 'Learn more about our company',
    language: 'en',
    status: 'published',
    metaTitle: 'About Us - Acme Corp',
    metaDescription: 'Learn about Acme Corp',
    createdAt: new Date('2026-01-17'),
    updatedAt: new Date('2026-03-24'),
    publishedAt: new Date('2026-03-24'),
  },
];

export const mockCategories: Category[] = [
  {
    id: '1',
    websiteId: '1',
    name: 'Technology',
    slug: 'technology',
    language: 'en',
    createdAt: new Date('2026-01-16'),
  },
  {
    id: '2',
    websiteId: '1',
    name: 'Design',
    slug: 'design',
    language: 'en',
    createdAt: new Date('2026-01-16'),
  },
  {
    id: '3',
    websiteId: '1',
    name: 'Marketing',
    slug: 'marketing',
    language: 'en',
    createdAt: new Date('2026-01-16'),
  },
];

export const mockArticles: Article[] = [
  {
    id: '1',
    websiteId: '1',
    title: 'Getting Started with React',
    slug: 'getting-started-with-react',
    excerpt: 'Learn the fundamentals of React development',
    content: 'React is a powerful library...',
    categoryId: '1',
    authorId: '1',
    language: 'en',
    status: 'published',
    metaTitle: 'Getting Started with React',
    metaDescription: 'Learn React development',
    publishDate: new Date('2026-03-20'),
    createdAt: new Date('2026-03-18'),
    updatedAt: new Date('2026-03-20'),
  },
];

export const mockMediaItems: MediaItem[] = [
  {
    id: '1',
    websiteId: '1',
    name: 'hero-image.jpg',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
    type: 'image',
    size: 2400000,
    mimeType: 'image/jpeg',
    createdAt: new Date('2026-03-25'),
  },
  {
    id: '2',
    websiteId: '1',
    name: 'team-photo.jpg',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
    type: 'image',
    size: 3100000,
    mimeType: 'image/jpeg',
    createdAt: new Date('2026-03-24'),
  },
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@cms.com',
    role: 'super_admin',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    createdAt: new Date('2026-01-10'),
  },
  {
    id: '2',
    name: 'Editor User',
    email: 'editor@cms.com',
    role: 'editor',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Editor',
    createdAt: new Date('2026-02-15'),
  },
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    userId: '1',
    userName: 'John Doe',
    action: 'Published',
    target: 'Homepage',
    timestamp: new Date(Date.now() - 5 * 60000),
  },
  {
    id: '2',
    userId: '2',
    userName: 'Jane Smith',
    action: 'Created',
    target: 'New Article',
    timestamp: new Date(Date.now() - 15 * 60000),
  },
];

export const mockStats: Stats = {
  websites: 12,
  pages: 48,
  articles: 156,
  media: 324,
  users: 8,
};
