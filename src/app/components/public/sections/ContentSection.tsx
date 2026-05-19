import React from 'react';
import DOMPurify from 'dompurify';

interface Props {
  section: any;
}

export const ContentSection: React.FC<Props> = ({ section }) => {
  const content = DOMPurify.sanitize(section?.content || '');

  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <div className="bg-white rounded-2xl border shadow-sm p-8">
        {section?.title && <h2 className="text-3xl font-bold text-gray-900 mb-6">{section.title}</h2>}
        <article className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </section>
  );
};