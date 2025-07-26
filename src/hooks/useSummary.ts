import { useMemo } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval } from 'date-fns';
import { calculateTimeDetails } from '@/lib/timeUtils';

const formatDateKey = (date: Date): string => `zehelper_data_${format(date, 'yyyy-MM-dd')}`;

const calculateSummary = (
  start: Date,
  end: Date,
  yearData: { [date: string]: string }
): number => {
  const days = eachDayOfInterval({ start, end });
  let total = 0;

  days.forEach(day => {
    const dayKey = format(day, 'yyyy-MM-dd');
    const dayInput = yearData[dayKey];
    if (dayInput) {
      const dayDetails = calculateTimeDetails(dayInput);
      total += dayDetails.totalMinutes;
    }
  });
  return total;
};

export const useSummary = (selectedDate: Date, yearData: { [date: string]: string }) => {
  const weeklySummary = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return calculateSummary(start, end, yearData);
  }, [selectedDate, yearData]);

  const monthlySummary = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    return calculateSummary(start, end, yearData);
  }, [selectedDate, yearData]);

  const yearlySummary = useMemo(() => {
    const start = startOfYear(selectedDate);
    const end = endOfYear(selectedDate);
    return calculateSummary(start, end, yearData);
  }, [selectedDate, yearData]);

  return {
    weeklySummary,
    monthlySummary,
    yearlySummary,
  };
};
