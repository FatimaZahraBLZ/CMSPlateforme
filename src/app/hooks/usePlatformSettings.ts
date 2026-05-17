import { useEffect, useState } from 'react';
import { api } from '../services/api';

export interface PlatformSettings {
  platform_name?: string;
  platform_logo?: string;
  platform_url?: string;
}

export const usePlatformSettings = () => {
  const [settings, setSettings] = useState<PlatformSettings>({
    platform_name: 'CMS Platform',
    platform_logo: '',
    platform_url: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.getPublicPlatformSettings();

        setSettings({
          platform_name: data.platform_name || 'CMS Platform',
          platform_logo: data.platform_logo || '',
          platform_url: data.platform_url || '',
        });
      } catch (error) {
        console.error('Failed to load platform settings:', error);
      }
    };

    fetchSettings();
  }, []);

  return settings;
};