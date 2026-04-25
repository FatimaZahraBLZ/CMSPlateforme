import React, { createContext, useContext, useState, useEffect } from 'react';
import { WebsiteProject, Language } from '../types';

interface CMSContextType {
  websites: WebsiteProject[];
  setWebsites: (websites: WebsiteProject[]) => void;
  selectedWebsite: WebsiteProject | null;
  setSelectedWebsite: (website: WebsiteProject | null) => void;
  currentLanguage: Language;
  setCurrentLanguage: (lang: Language) => void;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [websites, setWebsitesState] = useState<WebsiteProject[]>([]);
  const [selectedWebsite, setSelectedWebsiteState] = useState<WebsiteProject | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  useEffect(() => {
    const storedWebsite = localStorage.getItem('selected_website');
    if (storedWebsite) {
      setSelectedWebsiteState(JSON.parse(storedWebsite));
    }

    const storedWebsites = localStorage.getItem('cms_websites');
    if (storedWebsites) {
      setWebsitesState(JSON.parse(storedWebsites));
    }
  }, []);

  const setWebsites = (newWebsites: WebsiteProject[]) => {
    setWebsitesState(newWebsites);
    localStorage.setItem('cms_websites', JSON.stringify(newWebsites));
  };

  const setSelectedWebsite = (website: WebsiteProject | null) => {
    setSelectedWebsiteState(website);
    if (website) {
      localStorage.setItem('selected_website', JSON.stringify(website));
      setCurrentLanguage(website.defaultLanguage);
    } else {
      localStorage.removeItem('selected_website');
    }
  };

  return (
    <CMSContext.Provider
      value={{
        websites,
        setWebsites,
        selectedWebsite,
        setSelectedWebsite,
        currentLanguage,
        setCurrentLanguage,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
};
