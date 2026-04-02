import React from 'react';
import { Link } from 'react-router';

export const BlogPage: React.FC = () => {
  const articles = [
    {
      id: '1',
      title: 'Getting Started with Modern Web Development',
      excerpt: 'Learn the fundamentals of modern web development including React, TypeScript, and more.',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
      category: 'Technology',
      author: 'John Doe',
      date: '2026-03-20',
      readTime: '5 min read',
    },
    {
      id: '2',
      title: 'Design Trends to Watch in 2026',
      excerpt: 'Discover the latest design trends that are shaping the future of digital experiences.',
      image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800',
      category: 'Design',
      author: 'Jane Smith',
      date: '2026-03-18',
      readTime: '7 min read',
    },
    {
      id: '3',
      title: 'SEO Best Practices for 2026',
      excerpt: 'Master the art of search engine optimization with these proven strategies.',
      image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800',
      category: 'Marketing',
      author: 'Mike Johnson',
      date: '2026-03-15',
      readTime: '6 min read',
    },
    {
      id: '4',
      title: 'Building Scalable Web Applications',
      excerpt: 'Learn how to build web applications that scale with your business growth.',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      category: 'Technology',
      author: 'Sarah Williams',
      date: '2026-03-12',
      readTime: '8 min read',
    },
    {
      id: '5',
      title: 'The Future of AI in Web Development',
      excerpt: 'Explore how artificial intelligence is transforming the way we build websites.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
      category: 'Technology',
      author: 'Tom Brown',
      date: '2026-03-10',
      readTime: '10 min read',
    },
    {
      id: '6',
      title: 'User Experience Design Principles',
      excerpt: 'Essential UX principles that every designer should know and apply.',
      image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800',
      category: 'Design',
      author: 'Emily Davis',
      date: '2026-03-08',
      readTime: '6 min read',
    },
  ];

  const categories = ['All', 'Technology', 'Design', 'Marketing'];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">Blog</h1>
            <p className="text-xl text-gray-600">
              Insights, tips, and stories about web development, design, and digital marketing
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={`/public/blog/${articles[0].id}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center cursor-pointer group">
              <div className="aspect-video overflow-hidden rounded-xl bg-gray-200">
                <img
                  src={articles[0].image}
                  alt={articles[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full mb-4">
                  Featured
                </span>
                <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {articles[0].title}
                </h2>
                <p className="text-gray-600 mb-6">{articles[0].excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{articles[0].author}</span>
                  <span>•</span>
                  <span>{articles[0].date}</span>
                  <span>•</span>
                  <span>{articles[0].readTime}</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.slice(1).map((article) => (
              <Link key={article.id} to={`/public/blog/${article.id}`}>
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="aspect-video overflow-hidden bg-gray-200">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                      {article.category}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900 mt-2 mb-2 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{article.excerpt}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{article.author}</span>
                      <span>•</span>
                      <span>{article.date}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
