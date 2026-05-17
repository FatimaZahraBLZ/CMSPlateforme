import React from 'react';
import DOMPurify from 'dompurify';

interface Props {
  page: any;
  template: any;
  theme: any;
  website: any;
  menus?: any;
}

export const MinimalTemplate: React.FC<Props> = ({
  page,
  template,
  theme,
  website,
}) => {
  const primaryColor = theme?.settings?.primaryColor || '#2563eb';
  const content = DOMPurify.sanitize(page?.content || '');

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="mb-10">
          <p className="text-sm font-medium uppercase tracking-wide" style={{ color: primaryColor }}>
            {website?.name}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mt-3">
            {page?.title}
          </h1>
        </div>

        <article
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </section>
    </main>
  );
};