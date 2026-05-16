import React, { createContext, useContext, useState } from 'react';
import { WebsiteProject, Language } from '../types';

interface CMSContextType {
  websites: WebsiteProject[];
  setWebsites: (websites: WebsiteProject[]) => void;
  selectedWebsite: WebsiteProject | null;
  setSelectedWebsite: (website: WebsiteProject | null, userId?: string) => void;
  currentLanguage: Language;
  setCurrentLanguage: (lang: Language) => void;
  loadSelectedWebsiteForUser: (userId: string, websites: WebsiteProject[]) => void;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) throw new Error('useCMS must be used within a CMSProvider');
  return context;
};

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [websites, setWebsitesState] = useState<WebsiteProject[]>([]);
  const [selectedWebsite, setSelectedWebsiteState] = useState<WebsiteProject | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  const setWebsites = (newWebsites: WebsiteProject[]) => {
    setWebsitesState(newWebsites);
  };

  const setSelectedWebsite = (website: WebsiteProject | null, userId?: string) => {
    setSelectedWebsiteState(website);

    if (!website) return;

    setCurrentLanguage(website.defaultLanguage);

    if (userId) {
      localStorage.setItem(`selected_website_${userId}`, website.id);
    }
  };

  const loadSelectedWebsiteForUser = (userId: string, userWebsites: WebsiteProject[]) => {
    const storedWebsiteId = localStorage.getItem(`selected_website_${userId}`);

    if (!storedWebsiteId) {
      setSelectedWebsiteState(null);
      return;
    }

    const website = userWebsites.find((w) => w.id === storedWebsiteId);

    if (!website) {
      localStorage.removeItem(`selected_website_${userId}`);
      setSelectedWebsiteState(null);
      return;
    }

    setSelectedWebsiteState(website);
    setCurrentLanguage(website.defaultLanguage);
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
        loadSelectedWebsiteForUser,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
};