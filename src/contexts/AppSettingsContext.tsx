import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppSettings } from '@/types';

const SETTINGS_KEY = 'zehelper_settings';

const defaultSettings: AppSettings = {
  personalVacationDays: 25,
  cardVisibility: {},
  gradientId: 3,
  showWelcomeScreen: true, // Zeige Welcome Screen für neue Benutzer
  columnWidthSlider: 50, // Standard für 400px Kartenbreite (300 + 50*2 = 400)
  zoomLevel: 0.8, // Standard Zoom-Level auf 0.8 (80%)
};

interface AppSettingsContextType {
  settings: AppSettings;
  setPersonalVacationDays: (days: number) => void;
  setCardVisibility: (cardId: string, isVisible: boolean) => void;
  setAllCardsVisibility: (newVisibility: { [key: string]: boolean }) => void;
  setGradientId: (id: number) => void;
  setShowWelcomeScreen: (show: boolean) => void;
  setColumnWidthSlider: (value: number) => void;
  setZoomLevel: (level: number) => void;
}

export const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      } else {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage', error);
      setSettings(defaultSettings);
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prevSettings => {
      const updatedSettings = { ...prevSettings, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
      } catch (error) {
        console.error('Failed to save settings to localStorage', error);
      }
      return updatedSettings;
    });
  }, []);

  const setPersonalVacationDays = useCallback((days: number) => {
    updateSettings({ personalVacationDays: days });
  }, [updateSettings]);

  const setCardVisibility = useCallback((cardId: string, isVisible: boolean) => {
    setSettings(prev => {
        const newVisibility = { ...prev.cardVisibility, [cardId]: isVisible };
        const newSettings = { ...prev, cardVisibility: newVisibility };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
        return newSettings;
    });
  }, []);

  const setAllCardsVisibility = useCallback((newVisibility: { [key: string]: boolean }) => {
    updateSettings({ cardVisibility: newVisibility });
  }, [updateSettings]);

  const setGradientId = useCallback((id: number) => {
    updateSettings({ gradientId: id });
  }, [updateSettings]);

  const setShowWelcomeScreen = useCallback((show: boolean) => {
    updateSettings({ showWelcomeScreen: show });
  }, [updateSettings]);

  const setColumnWidthSlider = useCallback((value: number) => {
    updateSettings({ columnWidthSlider: value });
  }, [updateSettings]);

  const setZoomLevel = useCallback((level: number) => {
    updateSettings({ zoomLevel: level });
  }, [updateSettings]);

  const value = {
    settings,
    setPersonalVacationDays,
    setCardVisibility,
    setAllCardsVisibility,
    setGradientId,
    setShowWelcomeScreen,
    setColumnWidthSlider,
    setZoomLevel,
  };

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
};
