import React from 'react';

interface Props {
  section: any;
  theme?: any;
}

const getButtonRadius = (buttonStyle?: string) => {
  if (buttonStyle === 'pill') return '9999px';
  if (buttonStyle === 'square') return '0px';
  return '0.75rem';
};

export const CTASection: React.FC<Props> = ({ section, theme }) => {
  const settings = theme?.settings || {};

  const primaryColor = settings.primaryColor || '#2563eb';
  const accentColor = settings.accentColor || '#F59E0B';
  const backgroundColor = settings.backgroundColor || '#ffffff';
  const textColor = settings.textColor || '#111827';

  return (
    <section className="max-w-7xl mx-auto px-6 py-20" style={{ backgroundColor }}>
      <div
        className="p-10 text-center text-white"
        style={{
          borderRadius: settings.buttonStyle === 'square' ? '0px' : '1.5rem',
          background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
        }}
      >
        <h2 className="text-3xl font-bold">{section?.title}</h2>

        {section?.subtitle && <p className="mt-3 opacity-90">{section.subtitle}</p>}

        {section?.button_text && section?.button_link && (
          <a
            href={section.button_link}
            className="inline-block mt-6 px-6 py-3 font-medium"
            style={{
              backgroundColor,
              color: textColor,
              borderRadius: getButtonRadius(settings.buttonStyle),
            }}
          >
            {section.button_text}
          </a>
        )}
      </div>
    </section>
  );
};