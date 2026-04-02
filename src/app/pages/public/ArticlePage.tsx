import React from 'react';
import { useParams, Link } from 'react-router';

export const ArticlePage: React.FC = () => {
  const { id } = useParams();

  return (
    <div>
      <article className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/public/blog" className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>

          <div className="mt-6">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full mb-4">
              Technology
            </span>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Getting Started with Modern Web Development
            </h1>
            <div className="flex items-center gap-4 text-gray-600 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <span>John Doe</span>
              </div>
              <span>•</span>
              <span>March 20, 2026</span>
              <span>•</span>
              <span>5 min read</span>
            </div>
          </div>

          <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden mb-12">
            <img
              src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200"
              alt="Article"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 mb-6">
              Web development has evolved dramatically over the past few years. In this comprehensive guide, we'll explore the modern tools and techniques that are shaping the future of web development.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">The Modern Stack</h2>
            <p className="text-gray-700 mb-6">
              Today's web development ecosystem is rich with powerful tools and frameworks. React has become the go-to library for building user interfaces, while TypeScript adds type safety to JavaScript, making code more maintainable and less error-prone.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Key Technologies</h3>
            <ul className="space-y-3 text-gray-700 mb-6">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>React:</strong> A powerful library for building interactive user interfaces</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>TypeScript:</strong> Adds static typing to JavaScript for better code quality</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>Tailwind CSS:</strong> A utility-first CSS framework for rapid UI development</span>
              </li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Best Practices</h2>
            <p className="text-gray-700 mb-6">
              Following best practices is crucial for building maintainable and scalable web applications. Here are some key principles to keep in mind:
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-8">
              <p className="text-gray-700 italic">
                "The best code is no code at all. Keep things simple, write clean code, and always think about maintainability."
              </p>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Component Architecture</h3>
            <p className="text-gray-700 mb-6">
              Modern web applications are built using a component-based architecture. This approach makes code more reusable, testable, and maintainable. Each component should have a single responsibility and be as small as possible.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Conclusion</h2>
            <p className="text-gray-700 mb-6">
              Web development continues to evolve, but the fundamentals remain the same: write clean code, follow best practices, and always keep learning. The tools and frameworks may change, but the principles of good software development are timeless.
            </p>
          </div>

          <div className="mt-12 pt-12 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Design Trends to Watch in 2026', category: 'Design' },
                { title: 'Building Scalable Web Applications', category: 'Technology' },
              ].map((article, index) => (
                <Link key={index} to="/public/blog/2">
                  <div className="bg-gray-50 p-6 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <span className="text-xs font-medium text-blue-600 uppercase">{article.category}</span>
                    <h4 className="text-lg font-semibold text-gray-900 mt-2">{article.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};
