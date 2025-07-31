import { useMemo } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, isToday } from 'date-fns';
import { calculateTimeDetails } from '@/lib/timeUtils';

const formatDateKey = (date: Date): string => `zehelper_data_${format(date, 'yyyy-MM-dd')}`;

const calculateSummary = (
  start: Date,
  end: Date,
  yearData: { [date: string]: string },
  dailyTargetMinutes: number,
  currentInput?: string,
  currentTime?: Date,
  selectedDate?: Date
): number => {
  const days = eachDayOfInterval({ start, end });
  let total = 0;

  days.forEach(day => {
    const dayKey = format(day, 'yyyy-MM-dd');
    const selectedDateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
    
    // Verwende Live-Daten für den aktuell ausgewählten Tag
    let dayInput = yearData[dayKey];
    if (dayKey === selectedDateKey && currentInput !== undefined) {
      dayInput = currentInput;
    }
    
    if (dayInput) {
      // Verwende currentTime für Live-Berechnungen am aktuellen Tag
      const useCurrentTime = dayKey === selectedDateKey && currentTime && isToday(day);
      const dayDetails = calculateTimeDetails(
        dayInput, 
        useCurrentTime ? currentTime : undefined, 
        dailyTargetMinutes
      );
      total += dayDetails.totalMinutes;
    }
  });
  return total;
};

export const useSummary = (
  selectedDate: Date, 
  yearData: { [date: string]: string }, 
  dailyTargetMinutes: number,
  currentInput?: string,
  currentTime?: Date
) => {
  const weeklySummary = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return calculateSummary(start, end, yearData, dailyTargetMinutes, currentInput, currentTime, selectedDate);
  }, [selectedDate, yearData, dailyTargetMinutes, currentInput, currentTime]);

  const monthlySummary = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    return calculateSummary(start, end, yearData, dailyTargetMinutes, currentInput, currentTime, selectedDate);
  }, [selectedDate, yearData, dailyTargetMinutes, currentInput, currentTime]);

  const yearlySummary = useMemo(() => {
    const start = startOfYear(selectedDate);
    const end = endOfYear(selectedDate);
    return calculateSummary(start, end, yearData, dailyTargetMinutes, currentInput, currentTime, selectedDate);
  }, [selectedDate, yearData, dailyTargetMinutes, currentInput, currentTime]);

  const totalSummary = useMemo(() => {
    let total = 0;
    const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('zehelper_data_')) {
        const dayKey = key.replace('zehelper_data_', '');
        let dayInput = localStorage.getItem(key);
        
        // Verwende Live-Daten für den aktuell ausgewählten Tag
        if (dayKey === selectedDateKey && currentInput !== undefined) {
          dayInput = currentInput;
        }
        
        if (dayInput) {
          // Verwende currentTime für Live-Berechnungen am heutigen Tag
          const useCurrentTime = dayKey === selectedDateKey && currentTime && isToday(selectedDate);
          const dayDetails = calculateTimeDetails(
            dayInput, 
            useCurrentTime ? currentTime : undefined, 
            dailyTargetMinutes
          );
          total += dayDetails.totalMinutes;
        }
      }
    }
    return total;
  }, [yearData, dailyTargetMinutes, currentInput, currentTime, selectedDate]);

  return {
    weeklySummary,
    monthlySummary,
    yearlySummary,
    totalSummary,
  };
};
