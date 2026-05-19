import React from 'react';

interface Props {
  section: any;
  theme?: any;
}

export const ProjectsSection: React.FC<Props> = ({ section, theme }) => {
  const settings = theme?.settings || {};

  const primaryColor = settings.primaryColor || '#2563eb';
  const secondaryColor = settings.secondaryColor || '#10B981';
  const accentColor = settings.accentColor || '#F59E0B';
  const textColor = settings.textColor || '#111827';
  const backgroundColor = settings.backgroundColor || '#ffffff';

  const items = section?.settings?.items || [];

  return (
    <section style={{ backgroundColor }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: primaryColor }}>
          Projects
        </p>

        <h2 className="text-3xl font-bold mt-2 mb-3" style={{ color: textColor }}>
          {section?.title}
        </h2>

        {section?.content && (
          <p className="mb-8 max-w-2xl" style={{ color: textColor, opacity: 0.75 }}>
            {section.content}
          </p>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item: any, index: number) => (
            <div
              key={index}
              className="rounded-2xl border overflow-hidden"
              style={{
                backgroundColor,
                borderColor: `${secondaryColor}66`,
              }}
            >
              <div
                className="h-40"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}22, ${accentColor}33)`,
                }}
              />

              <div className="p-5">
                <h3 className="font-semibold" style={{ color: textColor }}>
                  {item.title}
                </h3>

                <p className="text-sm mt-2" style={{ color: textColor, opacity: 0.75 }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};