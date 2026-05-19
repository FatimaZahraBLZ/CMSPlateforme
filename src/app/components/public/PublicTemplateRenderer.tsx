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

  const settings = theme?.settings || {};

  const backgroundColor = settings.backgroundColor || '#f9fafb';
  const textColor = settings.textColor || '#111827';
  const fontFamily = settings.fontFamily || 'Inter';
  const secondaryColor = settings.secondaryColor || '#10B981';

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
        return <ContentSection key={section.id} section={section} theme={theme} />;
    }
  };

  if (!page) return null;

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
      }}
    >
      {sections.length > 0 ? (
        sections.map(renderSection)
      ) : (
        <ContentSection
          theme={theme}
          section={{
            id: page.id,
            title: page.title,
            content: page.content,
          }}
        />
      )}

      <footer
        className="border-t py-8 text-center text-sm"
        style={{
          backgroundColor,
          color: textColor,
          borderColor: secondaryColor,
        }}
      >
        <p>&copy; {new Date().getFullYear()} {website?.name}. All rights reserved.</p>
      </footer>
    </main>
  );
};