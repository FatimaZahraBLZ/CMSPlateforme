import React from 'react';

interface Props {
  section: any;
  theme?: any;
}

export const ProjectsSection: React.FC<Props> = ({ section, theme }) => {
  const primaryColor = theme?.settings?.primaryColor || '#2563eb';
  const items = section?.settings?.items || [];

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: primaryColor }}>
          Projects
        </p>
        <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-3">{section?.title}</h2>
        {section?.content && <p className="text-gray-600 mb-8 max-w-2xl">{section.content}</p>}

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item: any, index: number) => (
            <div key={index} className="rounded-2xl border overflow-hidden bg-gray-50">
              <div className="h-40 bg-gray-200" />
              <div className="p-5">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};