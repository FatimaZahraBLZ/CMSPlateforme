import React from 'react';
import DOMPurify from 'dompurify';

interface Props {
  page: any;
  template: any;
  theme: any;
  website: any;
  menus?: any;
}

export const BusinessTemplate: React.FC<Props> = ({
  page,
  template,
  theme,
  website,
}) => {
  const primaryColor = theme?.settings?.primaryColor || '#1d4ed8';
  const sections: string[] = template?.sections || [];
  const content = DOMPurify.sanitize(page?.content || '');

  const isHome = template?.page_type === 'home';

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {isHome && sections.includes('hero') && (
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: primaryColor }}>
                {website?.name}
              </p>
              <h1 className="text-5xl font-bold mt-4 leading-tight">
                {page?.title}
              </h1>
              <div
                className="prose prose-lg mt-6 text-gray-600"
                dangerouslySetInnerHTML={{ __html: content }}
              />
              {template?.settings?.showHeroButton && (
                <a
                  href="/contact"
                  className="inline-block mt-8 px-6 py-3 rounded-lg text-white font-medium"
                  style={{ backgroundColor: primaryColor }}
                >
                  Contact us
                </a>
              )}
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 h-80 flex items-center justify-center">
              <span className="text-6xl">🏢</span>
            </div>
          </div>
        </section>
      )}

      {!isHome && (
        <section className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: primaryColor }}>
              {website?.name}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mt-3">
              {page?.title}
            </h1>
          </div>
        </section>
      )}

      {sections.includes('services-preview') && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-8">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {['Strategy', 'Development', 'Support'].map((item) => (
              <div key={item} className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="w-12 h-12 rounded-xl mb-4" style={{ backgroundColor: `${primaryColor}20` }} />
                <h3 className="font-semibold text-xl">{item}</h3>
                <p className="text-gray-600 mt-2">
                  Professional solutions designed to help your business grow.
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {sections.includes('projects-preview') && (
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <h2 className="text-3xl font-bold mb-8">Featured Projects</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="rounded-2xl border overflow-hidden bg-gray-50">
                  <div className="h-40 bg-gray-200" />
                  <div className="p-5">
                    <h3 className="font-semibold">Project {item}</h3>
                    <p className="text-sm text-gray-600 mt-2">Showcase your work here.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-6 py-16">
        <article
          className="prose prose-lg max-w-none bg-white rounded-2xl p-8 shadow-sm border"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </section>

      {sections.includes('cta') && (
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="rounded-3xl text-white p-10 text-center" style={{ backgroundColor: primaryColor }}>
            <h2 className="text-3xl font-bold">Ready to get started?</h2>
            <p className="mt-3 opacity-90">Contact us today and let’s build something great.</p>
            <a href="/contact" className="inline-block mt-6 bg-white text-gray-900 px-6 py-3 rounded-lg font-medium">
              Get in touch
            </a>
          </div>
        </section>
      )}
    </main>
  );
};