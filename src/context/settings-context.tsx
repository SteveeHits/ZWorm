'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

type Theme = 'zinc' | 'slate' | 'stone' | 'gray' | 'neutral' | 'red' | 'rose' | 'orange' | 'green' | 'blue' | 'yellow' | 'violet';

interface Settings {
  theme: Theme;
  voiceMode: boolean;
  fullscreen: boolean;
}

interface SettingsContextType {
  settings: Settings;
  setTheme: (theme: Theme) => void;
  toggleVoiceMode: () => void;
  toggleFullscreen: () => void;
  setSettings: (settings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultSettings: Settings = {
  theme: 'violet',
  voiceMode: false,
  fullscreen: false,
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettingsState] = useState<Settings>(() => {
    if (typeof window === 'undefined') {
      return defaultSettings;
    }
    try {
      const storedSettings = localStorage.getItem('app-settings');
      return storedSettings ? JSON.parse(storedSettings) : defaultSettings;
    } catch (error) {
      console.error('Failed to parse settings from localStorage', error);
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem('app-settings', JSON.stringify(settings));
  }, [settings]);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setSettingsState(s => ({...s, fullscreen: !!document.fullscreenElement }));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const setSettings = (newSettings: Partial<Settings>) => {
    setSettingsState(prev => ({ ...prev, ...newSettings }));
  };

  const setTheme = (theme: Theme) => {
    setSettings({ theme });
  };

  const toggleVoiceMode = () => {
    setSettings({ voiceMode: !settings.voiceMode });
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
    <SettingsContext.Provider value={{ settings, setTheme, toggleVoiceMode, toggleFullscreen, setSettings }}>
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
