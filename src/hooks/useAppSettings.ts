import { useContext } from 'react';
import { AppSettingsContext } from '@/contexts/AppSettingsContext';

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  
  const { settings, setGradientId, setCardVisibility, setAllCardsVisibility, setPersonalVacationDays, setShowWelcomeScreen, setColumnWidthSlider, setZoomLevel } = context;

  return {
    settings,
    gradientId: settings.gradientId,
    setGradientId,
    cardVisibility: settings.cardVisibility || {},
    setCardVisibility,
    setAllCardsVisibility,
    personalVacationDays: settings.personalVacationDays,
    setPersonalVacationDays,
    setShowWelcomeScreen,
    columnWidthSlider: settings.columnWidthSlider || 30,
    setColumnWidthSlider,
    zoomLevel: settings.zoomLevel || 0.8,
    setZoomLevel,
  };
};
