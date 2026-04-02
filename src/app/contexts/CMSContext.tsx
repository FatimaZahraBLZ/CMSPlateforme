import React, { createContext, useContext, useState, useEffect } from 'react';
import { WebsiteProject } from '../types';

interface CMSContextType {
  selectedWebsite: WebsiteProject | null;
  setSelectedWebsite: (website: WebsiteProject | null) => void;
  currentLanguage: 'fr' | 'en' | 'ar';
  setCurrentLanguage: (lang: 'fr' | 'en' | 'ar') => void;
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
  const [selectedWebsite, setSelectedWebsiteState] = useState<WebsiteProject | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<'fr' | 'en' | 'ar'>('en');

  useEffect(() => {
    const storedWebsite = localStorage.getItem('selected_website');
    if (storedWebsite) {
      setSelectedWebsiteState(JSON.parse(storedWebsite));
    }
  }, []);

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
    <CMSContext.Provider value={{ selectedWebsite, setSelectedWebsite, currentLanguage, setCurrentLanguage }}>
      {children}
    </CMSContext.Provider>
  );
};
