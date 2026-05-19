import React from 'react';

interface Props {
  section: any;
  theme?: any;
}

export const CTASection: React.FC<Props> = ({ section, theme }) => {
  const primaryColor = theme?.settings?.primaryColor || '#2563eb';

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="rounded-3xl text-white p-10 text-center" style={{ backgroundColor: primaryColor }}>
        <h2 className="text-3xl font-bold">{section?.title}</h2>
        {section?.subtitle && <p className="mt-3 opacity-90">{section.subtitle}</p>}

        {section?.button_text && section?.button_link && (
          <a href={section.button_link} className="inline-block mt-6 bg-white text-gray-900 px-6 py-3 rounded-lg font-medium">
            {section.button_text}
          </a>
        )}
      </div>
    </section>
  );
};