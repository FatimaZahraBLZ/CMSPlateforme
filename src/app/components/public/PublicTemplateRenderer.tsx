import React from 'react';
import { HeroSection } from './sections/HeroSection';
import { ServicesSection } from './sections/ServicesSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { CTASection } from './sections/CTASection';
import { ContentSection } from './sections/ContentSection';

interface PublicTemplateRendererProps {
  pageData: any;
}

export const PublicTemplateRenderer: React.FC<PublicTemplateRendererProps> = ({
  pageData,
}) => {
  const page = pageData?.page;
  const theme = pageData?.theme;
  const website = pageData?.website;
  const sections = pageData?.sections || [];

  const renderSection = (section: any) => {
    switch (section.section_type) {
      case 'hero':
        return <HeroSection key={section.id} section={section} theme={theme} />;

      case 'services':
        return <ServicesSection key={section.id} section={section} theme={theme} />;

      case 'projects':
        return <ProjectsSection key={section.id} section={section} theme={theme} />;

      case 'cta':
        return <CTASection key={section.id} section={section} theme={theme} />;

      case 'content':
      case 'about':
      case 'values':
      case 'contact':
      case 'posts':
      case 'categories':
      default:
        return <ContentSection key={section.id} section={section} />;
    }
  };

  if (!page) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {sections.length > 0 ? (
        sections.map(renderSection)
      ) : (
        <ContentSection
          section={{
            id: page.id,
            title: page.title,
            content: page.content,
          }}
        />
      )}

      <footer className="border-t border-gray-200 bg-white py-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} {website?.name}. All rights reserved.</p>
      </footer>
    </main>
  );
};