import React from 'react';
import DOMPurify from 'dompurify';

interface Props {
  section: any;
  theme?: any;
}

const getButtonRadius = (buttonStyle?: string) => {
  if (buttonStyle === 'pill') return '9999px';
  if (buttonStyle === 'square') return '0px';
  return '0.75rem';
};

export const HeroSection: React.FC<Props> = ({ section, theme }) => {
  const settings = theme?.settings || {};

  const primaryColor = settings.primaryColor || '#2563eb';
  const secondaryColor = settings.secondaryColor || '#10B981';
  const accentColor = settings.accentColor || '#F59E0B';
  const textColor = settings.textColor || '#111827';
  const backgroundColor = settings.backgroundColor || '#ffffff';
  const fontFamily = settings.fontFamily || 'Inter';

  const content = DOMPurify.sanitize(section?.content || '');

  return (
    <section
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          {section?.subtitle && (
            <p
              className="text-sm font-semibold uppercase tracking-wide"
              style={{ color: secondaryColor }}
            >
              {section.subtitle}
            </p>
          )}

          <h1
            className="text-5xl font-bold mt-4 leading-tight"
            style={{ color: textColor }}
          >
            {section?.title}
          </h1>

          {content && (
            <div
              className="prose prose-lg mt-6"
              style={{ color: textColor }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}

          {section?.button_text && section?.button_link && (
            <a
              href={section.button_link}
              className="inline-block mt-8 px-6 py-3 text-white font-medium"
              style={{
                backgroundColor: primaryColor,
                borderRadius: getButtonRadius(settings.buttonStyle),
              }}
            >
              {section.button_text}
            </a>
          )}
        </div>

        <div
          className="h-80 flex items-center justify-center overflow-hidden"
          style={{
            borderRadius: settings.buttonStyle === 'square' ? '0px' : '1.5rem',
            background: `linear-gradient(135deg, ${primaryColor}22, ${accentColor}33)`,
          }}
        >
          {section?.image ? (
            <img src={section.image} alt={section.title} className="w-full h-full object-cover" />
          ) : (
           <div>
           <svg
               xmlns="http://www.w3.org/2000/svg"
               className="w-12 h-12"
               fill="none"
               viewBox="0 0 24 24"
               stroke="currentColor"
               style={{ color: primaryColor }}
               strokeWidth={2}
            >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
             />
            </svg>
        </div>
          )}
        </div>
      </div>
    </section>
  );
};