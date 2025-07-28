import { useContext } from 'react';
import { AppSettingsContext } from '@/contexts/AppSettingsContext';

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  
  const { settings, setGradientId, setCardVisibility, setAllCardsVisibility, setPersonalVacationDays } = context;

  return {
    settings,
    gradientId: settings.gradientId,
    setGradientId,
    cardVisibility: settings.cardVisibility || {},
    setCardVisibility,
    setAllCardsVisibility,
    personalVacationDays: settings.personalVacationDays,
    setPersonalVacationDays,
  };
};
