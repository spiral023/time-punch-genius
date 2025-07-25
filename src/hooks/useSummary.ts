import { useMemo } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval } from 'date-fns';
import { calculateTimeDetails } from '@/lib/timeUtils';

const formatDateKey = (date: Date): string => `zehelper_data_${format(date, 'yyyy-MM-dd')}`;

const calculateSummary = (
  start: Date,
  end: Date,
  selectedDate: Date,
  input: string,
  currentTime?: Date
): number => {
  const days = eachDayOfInterval({ start, end });
  let total = 0;

  days.forEach(day => {
    const dayKey = format(day, 'yyyy-MM-dd');
    const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');

    if (dayKey === selectedDateKey) {
      if (input) {
        const dayDetails = calculateTimeDetails(input, currentTime);
        total += dayDetails.totalMinutes;
      }
    } else {
      const storageKey = formatDateKey(day);
      const savedInput = localStorage.getItem(storageKey);
      if (savedInput) {
        const dayDetails = calculateTimeDetails(savedInput);
        total += dayDetails.totalMinutes;
      }
    }
  });
  return total;
};

export const useSummary = (selectedDate: Date, input: string, currentTime: Date) => {
  const weeklySummary = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return calculateSummary(start, end, selectedDate, input, currentTime);
  }, [selectedDate, input, currentTime]);

  const monthlySummary = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    return calculateSummary(start, end, selectedDate, input, currentTime);
  }, [selectedDate, input, currentTime]);

  const yearlySummary = useMemo(() => {
    const start = startOfYear(selectedDate);
    const end = endOfYear(selectedDate);
    return calculateSummary(start, end, selectedDate, input, currentTime);
  }, [selectedDate, input, currentTime]);

  return {
    weeklySummary,
    monthlySummary,
    yearlySummary,
  };
};
