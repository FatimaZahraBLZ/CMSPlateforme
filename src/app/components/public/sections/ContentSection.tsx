import React from 'react';
import DOMPurify from 'dompurify';

interface Props {
  section: any;
  theme?: any;
}

export const ContentSection: React.FC<Props> = ({ section, theme }) => {
  const settings = theme?.settings || {};

  const content = DOMPurify.sanitize(section?.content || '');
  const backgroundColor = settings.backgroundColor || '#ffffff';
  const textColor = settings.textColor || '#111827';
  const secondaryColor = settings.secondaryColor || '#e5e7eb';

  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <div
        className="rounded-2xl border shadow-sm p-8"
        style={{
          backgroundColor,
          borderColor: secondaryColor,
          color: textColor,
        }}
      >
        {section?.title && (
          <h2 className="text-3xl font-bold mb-6" style={{ color: textColor }}>
            {section.title}
          </h2>
        )}

        <article
          className="prose prose-lg max-w-none"
          style={{ color: textColor }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </section>
  );
};