import React from 'react';

interface Props {
  section: any;
  theme?: any;
}

export const ServicesSection: React.FC<Props> = ({ section, theme }) => {
  const settings = theme?.settings || {};

  const primaryColor = settings.primaryColor || '#2563eb';
  const secondaryColor = settings.secondaryColor || '#10B981';
  const textColor = settings.textColor || '#111827';
  const backgroundColor = settings.backgroundColor || '#ffffff';
  const accentColor = settings.accentColor || '#F59E0B';

  const items = section?.settings?.items || [];

  return (
    <section
      className="max-w-7xl mx-auto px-6 py-16"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: secondaryColor }}>
          {section?.subtitle || 'Services'}
        </p>

        <h2 className="text-3xl font-bold mt-2" style={{ color: textColor }}>
          {section?.title}
        </h2>

        {section?.content && (
          <p className="mt-3 max-w-2xl" style={{ color: textColor, opacity: 0.75 }}>
            {section.content}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {items.map((item: any, index: number) => (
          <div
            key={index}
            className="rounded-2xl shadow-sm border p-6"
            style={{
              backgroundColor,
              borderColor: `${secondaryColor}55`,
              color: textColor,
            }}
          >
            <div
              className="w-12 h-12 rounded-xl mb-4"
              style={{ backgroundColor: `${primaryColor}22` }}
            />

            <h3 className="font-semibold text-xl" style={{ color: textColor }}>
              {item.title}
            </h3>

            <p className="mt-2" style={{ color: textColor, opacity: 0.75 }}>
              {item.description}
            </p>

            <div className="mt-4 h-1 w-12 rounded-full" style={{ backgroundColor: accentColor }} />
          </div>
        ))}
      </div>
    </section>
  );
};