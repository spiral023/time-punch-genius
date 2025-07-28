import { useMemo, useState, useEffect } from 'react';
import { calculateTimeDetails } from '@/lib/timeUtils';
import { getHolidays, isHoliday } from '@/lib/holidays';
import { Holiday } from '@/types';

export const useTimeCalculator = (input: string, currentTime: Date, dailyTargetMinutes: number) => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    const fetchHolidays = async () => {
      const year = currentTime.getFullYear();
      const fetchedHolidays = await getHolidays(year, 'AT');
      setHolidays(fetchedHolidays);
    };
    fetchHolidays();
  }, [currentTime]);

  return useMemo(() => {
    const dayIsHoliday = isHoliday(currentTime, holidays);
    return calculateTimeDetails(input, currentTime, dailyTargetMinutes, dayIsHoliday);
  }, [input, currentTime, dailyTargetMinutes, holidays]);
};
