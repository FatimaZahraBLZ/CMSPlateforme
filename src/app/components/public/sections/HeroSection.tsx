import React from 'react';
import DOMPurify from 'dompurify';

interface Props {
  section: any;
  theme?: any;
}

export const HeroSection: React.FC<Props> = ({ section, theme }) => {
  const primaryColor = theme?.settings?.primaryColor || '#2563eb';
  const content = DOMPurify.sanitize(section?.content || '');

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          {section?.subtitle && (
            <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: primaryColor }}>
              {section.subtitle}
            </p>
          )}

          <h1 className="text-5xl font-bold mt-4 leading-tight text-gray-900">
            {section?.title}
          </h1>

          {content && (
            <div
              className="prose prose-lg mt-6 text-gray-600"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}

          {section?.button_text && section?.button_link && (
            <a
              href={section.button_link}
              className="inline-block mt-8 px-6 py-3 rounded-lg text-white font-medium"
              style={{ backgroundColor: primaryColor }}
            >
              {section.button_text}
            </a>
          )}
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 h-80 flex items-center justify-center overflow-hidden">
          {section?.image ? (
            <img src={section.image} alt={section.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-6xl">✨</span>
          )}
        </div>
      </div>
    </section>
  );
};