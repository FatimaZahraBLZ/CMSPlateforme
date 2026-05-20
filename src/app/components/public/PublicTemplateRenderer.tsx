import React from 'react';
import { HeroSection } from './sections/HeroSection';
import { ServicesSection } from './sections/ServicesSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { CTASection } from './sections/CTASection';
import { ContentSection } from './sections/ContentSection';
import { WebsiteRenderer } from '../../renderer/WebsiteRenderer';

interface PublicTemplateRendererProps {
  pageData: any;
}

const isBuilderContent = (content: any) => {
  try {
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;
    return parsed?.version === 1 && Array.isArray(parsed.blocks);
  } catch {
    return false;
  }
};

const parseBuilderContent = (content: any) => {
  try {
    return typeof content === 'string' ? JSON.parse(content) : content;
  } catch {
    return null;
  }
};

export const PublicTemplateRenderer: React.FC<PublicTemplateRendererProps> = ({
  pageData,
}) => {
  const page = pageData?.page;
  const theme = pageData?.theme;
  const sections = pageData?.sections || [];

  const settings = theme?.settings || {};

  const backgroundColor = settings.backgroundColor || '#f9fafb';
  const textColor = settings.textColor || '#111827';
  const fontFamily = settings.fontFamily || 'Inter';

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

  const builderContent = isBuilderContent(page.content)
    ? parseBuilderContent(page.content)
    : null;

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
      }}
    >
      {builderContent ? (
        <WebsiteRenderer content={builderContent} />
      ) : sections.length > 0 ? (
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
    </main>
  );
};