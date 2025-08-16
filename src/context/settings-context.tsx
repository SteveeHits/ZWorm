
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface Settings {
  fullscreen: boolean;
  theme: string;
  backgroundAnimationsEnabled: boolean;
}

interface SettingsContextType {
  settings: Settings;
  setSettings: (settings: Partial<Settings> | ((s: Settings) => Settings)) => void;
  toggleFullscreen: () => void;
  isMounted: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultSettings: Settings = {
  fullscreen: false,
  theme: 'default',
  backgroundAnimationsEnabled: true,
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [settings, setSettingsState] = useState<Settings>(defaultSettings);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedSettings = localStorage.getItem('app-settings');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettingsState(prev => ({ ...prev, ...parsedSettings }));
      }
    } catch (error) {
      console.error('Failed to parse settings from localStorage', error);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
        localStorage.setItem('app-settings', JSON.stringify(settings));
    }
  }, [settings, isMounted]);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setSettingsState(s => ({...s, fullscreen: !!document.fullscreenElement }));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const setSettings = (newSettings: Partial<Settings>| ((s: Settings) => Settings)) => {
     if (typeof newSettings === 'function') {
      setSettingsState(newSettings);
    } else {
      setSettingsState(prev => ({ ...prev, ...newSettings }));
    }
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
  }, []);


  return (
    <SettingsContext.Provider value={{ settings, setSettings, toggleFullscreen, isMounted }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
