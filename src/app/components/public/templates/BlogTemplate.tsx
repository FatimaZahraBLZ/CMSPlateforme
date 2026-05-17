import React from 'react';
import DOMPurify from 'dompurify';

interface Props {
  page: any;
  template: any;
  theme: any;
  website: any;
  menus?: any;
}

export const BlogTemplate: React.FC<Props> = ({
  page,
  template,
  theme,
  website,
}) => {
  const primaryColor = theme?.settings?.primaryColor || '#7c3aed';
  const sections: string[] = template?.sections || [];
  const content = DOMPurify.sanitize(page?.content || '');

  return (
    <main className="min-h-screen bg-stone-50 text-gray-900">
      <section className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: primaryColor }}>
            {website?.name}
          </p>
          <h1 className="text-5xl font-serif font-bold mt-4">
            {page?.title}
          </h1>
          <div
            className="prose prose-lg mx-auto mt-6 text-gray-600"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </section>

      {sections.includes('featured-posts') && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-serif font-bold mb-8">Featured Posts</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map((item) => (
              <article key={item} className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                <div className="h-56 bg-stone-200" />
                <div className="p-6">
                  <p className="text-sm font-medium" style={{ color: primaryColor }}>
                    Category
                  </p>
                  <h3 className="text-2xl font-serif font-bold mt-2">
                    Featured article title
                  </h3>
                  <p className="text-gray-600 mt-3">
                    A short preview of the article will appear here.
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {sections.includes('latest-posts') && (
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <h2 className="text-3xl font-serif font-bold mb-8">Latest Posts</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <article key={item} className="bg-white border rounded-xl p-5">
                <h3 className="font-bold text-lg">Post title</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Blog post summary appears here.
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {!sections.includes('featured-posts') && !sections.includes('latest-posts') && (
        <section className="max-w-4xl mx-auto px-6 py-16">
          <article
            className="prose prose-lg max-w-none bg-white rounded-2xl p-8 border"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </section>
      )}
    </main>
  );
};