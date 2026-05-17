import React from 'react';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { BusinessTemplate } from './templates/BusinessTemplate';
import { BlogTemplate } from './templates/BlogTemplate';

interface PublicTemplateRendererProps {
  pageData: any;
}

export const PublicTemplateRenderer: React.FC<PublicTemplateRendererProps> = ({
  pageData,
}) => {
  const page = pageData?.page;
  const template = pageData?.template;
  const theme = pageData?.theme;
  const website = pageData?.website;
  const menus = pageData?.menus;

  const templateSlug = page?.template || template?.slug || '';
  const themeType = theme?.template_type || website?.theme || template?.theme_type || '';

  if (templateSlug.startsWith('business') || themeType === 'business') {
    return (
      <BusinessTemplate
        page={page}
        template={template}
        theme={theme}
        website={website}
        menus={menus}
      />
    );
  }

  if (templateSlug.startsWith('blog') || themeType === 'blog') {
    return (
      <BlogTemplate
        page={page}
        template={template}
        theme={theme}
        website={website}
        menus={menus}
      />
    );
  }

  return (
    <MinimalTemplate
      page={page}
      template={template}
      theme={theme}
      website={website}
      menus={menus}
    />
  );
};