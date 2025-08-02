import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppSettings, DashboardLayout } from '@/types';

const SETTINGS_KEY = 'zehelper_settings';

const defaultLayout: DashboardLayout = {
  version: 3,
  columns: [
    ['currentTime', 'averageDay', 'weeklyHours', 'summary', 'homeOffice'],
    ['timeInput', 'notes', 'breakInfo', 'info'],
    ['workingTime', 'targetTimes', 'vacation', 'outsideRegularHours'],
    ['tips', 'freeDays', 'heatmap', 'averageWorkdayHours', 'statistics'],
  ],
};

const defaultSettings: AppSettings = {
  personalVacationDays: 25,
  cardVisibility: {},
  gradientId: 3,
  showWelcomeScreen: true, // Zeige Welcome Screen für neue Benutzer
  columnWidthSlider: 50, // Standard für 400px Kartenbreite (300 + 50*2 = 400)
  cardLayoutMode: 'dynamic', // Standard: dynamische Kartenbreite
  zoomLevel: 1.0, // Standard Zoom-Level auf 1.0 (100%)
  weeklyTargetHours: 38.5, // Standard Wochenstunden
  dashboardLayout: defaultLayout,
  targetTimesVisibility: {},
};

interface AppSettingsContextType {
  settings: AppSettings;
  setPersonalVacationDays: (days: number) => void;
  setCardVisibility: (cardId: string, isVisible: boolean) => void;
  setAllCardsVisibility: (newVisibility: { [key: string]: boolean }) => void;
  setGradientId: (id: number) => void;
  setShowWelcomeScreen: (show: boolean) => void;
  setColumnWidthSlider: (value: number) => void;
  setCardLayoutMode: (mode: 'dynamic' | 'fixed' | 'uniform') => void;
  setZoomLevel: (level: number) => void;
  setWeeklyTargetHours: (hours: number) => void;
  setDashboardLayout: (layout: DashboardLayout) => void;
  setTargetTimesVisibility: (visibility: { [key: string]: boolean }) => void;
}

export const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      const parsedSettings = storedSettings ? JSON.parse(storedSettings) : {};
      
      // Migration logic for old localStorage keys
      const migrateOldSettings = (currentSettings: Partial<AppSettings>): AppSettings => {
        const migrated = { ...defaultSettings, ...currentSettings };
        
        // Migrate useFixedCardWidth to cardLayoutMode
        if ('useFixedCardWidth' in currentSettings && !migrated.cardLayoutMode) {
          const legacySettings = currentSettings as Partial<AppSettings> & { useFixedCardWidth?: boolean };
          migrated.cardLayoutMode = legacySettings.useFixedCardWidth ? 'fixed' : 'dynamic';
          console.log('Migrated useFixedCardWidth to cardLayoutMode:', migrated.cardLayoutMode);
        }
        
        // Force zoomLevel to 1.0 for all users (fix tooltip issues)
        if (migrated.zoomLevel !== 1.0) {
          migrated.zoomLevel = 1.0;
          console.log('Migrated zoomLevel to 1.0 for tooltip compatibility');
        }
        
        // Migrate weeklyTargetHours from zehelper_weekly_hours
        const oldWeeklyHours = localStorage.getItem('zehelper_weekly_hours');
        if (oldWeeklyHours && !migrated.weeklyTargetHours) {
          try {
            migrated.weeklyTargetHours = parseFloat(oldWeeklyHours);
            localStorage.removeItem('zehelper_weekly_hours');
            console.log('Migrated weeklyTargetHours from zehelper_weekly_hours');
          } catch (e) {
            console.warn('Failed to migrate weeklyTargetHours:', e);
          }
        }
        
        // Migrate dashboardLayout from dashboardLayout
        const oldLayout = localStorage.getItem('dashboardLayout');
        if (oldLayout && !migrated.dashboardLayout) {
          try {
            migrated.dashboardLayout = JSON.parse(oldLayout);
            localStorage.removeItem('dashboardLayout');
            console.log('Migrated dashboardLayout from dashboardLayout');
          } catch (e) {
            console.warn('Failed to migrate dashboardLayout:', e);
          }
        }
        
        // Migrate targetTimesVisibility from targetTimesVisibility
        const oldTargetTimesVisibility = localStorage.getItem('targetTimesVisibility');
        if (oldTargetTimesVisibility && !migrated.targetTimesVisibility) {
          try {
            migrated.targetTimesVisibility = JSON.parse(oldTargetTimesVisibility);
            localStorage.removeItem('targetTimesVisibility');
            console.log('Migrated targetTimesVisibility from targetTimesVisibility');
          } catch (e) {
            console.warn('Failed to migrate targetTimesVisibility:', e);
          }
        }
        
        return migrated;
      };

      const finalSettings = migrateOldSettings(parsedSettings);
      setSettings(finalSettings);
      
      // Save the migrated settings
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(finalSettings));
      
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

  const setCardLayoutMode = useCallback((mode: 'dynamic' | 'fixed' | 'uniform') => {
    updateSettings({ cardLayoutMode: mode });
  }, [updateSettings]);

  const setZoomLevel = useCallback((level: number) => {
    updateSettings({ zoomLevel: level });
  }, [updateSettings]);

  const setWeeklyTargetHours = useCallback((hours: number) => {
    updateSettings({ weeklyTargetHours: hours });
  }, [updateSettings]);

  const setDashboardLayout = useCallback((layout: DashboardLayout) => {
    updateSettings({ dashboardLayout: layout });
  }, [updateSettings]);

  const setTargetTimesVisibility = useCallback((visibility: { [key: string]: boolean }) => {
    updateSettings({ targetTimesVisibility: visibility });
  }, [updateSettings]);

  const value = {
    settings,
    setPersonalVacationDays,
    setCardVisibility,
    setAllCardsVisibility,
    setGradientId,
    setShowWelcomeScreen,
    setColumnWidthSlider,
    setCardLayoutMode,
    setZoomLevel,
    setWeeklyTargetHours,
    setDashboardLayout,
    setTargetTimesVisibility,
  };

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
};
