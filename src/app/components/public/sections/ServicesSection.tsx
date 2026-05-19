import React from 'react';

interface Props {
  section: any;
  theme?: any;
}

export const ServicesSection: React.FC<Props> = ({ section, theme }) => {
  const primaryColor = theme?.settings?.primaryColor || '#2563eb';
  const items = section?.settings?.items || [];

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: primaryColor }}>
          {section?.subtitle || 'Services'}
        </p>
        <h2 className="text-3xl font-bold text-gray-900 mt-2">{section?.title}</h2>
        {section?.content && <p className="text-gray-600 mt-3 max-w-2xl">{section.content}</p>}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {items.map((item: any, index: number) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="w-12 h-12 rounded-xl mb-4" style={{ backgroundColor: `${primaryColor}20` }} />
            <h3 className="font-semibold text-xl text-gray-900">{item.title}</h3>
            <p className="text-gray-600 mt-2">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};