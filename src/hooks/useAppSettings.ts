import { useState, useEffect, useCallback } from 'react';
import { AppSettings } from '@/types';

const SETTINGS_KEY = 'zehelper_settings';

const defaultSettings: AppSettings = {
  personalVacationDays: 25,
  cardVisibility: {},
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        // Merge stored settings with defaults to ensure all keys are present
        setSettings({ ...defaultSettings, ...parsedSettings });
      } else {
        // If no settings are stored, initialize with defaults
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage', error);
      // In case of error, use default settings
      setSettings(defaultSettings);
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Failed to save settings to localStorage', error);
    }
  }, [settings]);

  const setPersonalVacationDays = useCallback((days: number) => {
    updateSettings({ personalVacationDays: days });
  }, [updateSettings]);

  const setCardVisibility = useCallback((cardId: string, isVisible: boolean) => {
    updateSettings({
      cardVisibility: {
        ...settings.cardVisibility,
        [cardId]: isVisible,
      },
    });
  }, [settings.cardVisibility, updateSettings]);

  const setAllCardsVisibility = useCallback((newVisibility: { [key: string]: boolean }) => {
    updateSettings({ cardVisibility: newVisibility });
  }, [updateSettings]);

  return {
    settings,
    setPersonalVacationDays,
    personalVacationDays: settings.personalVacationDays,
    cardVisibility: settings.cardVisibility || {},
    setCardVisibility,
    setAllCardsVisibility,
  };
};
