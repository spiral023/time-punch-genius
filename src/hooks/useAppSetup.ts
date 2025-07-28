// src/hooks/useAppSetup.ts
import { useState, useEffect } from 'react';
import { getHolidays } from '@/lib/holidays';
import { Holiday } from '@/types';

export const useAppSetup = (selectedDate: Date) => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    document.documentElement.classList.add('dark');

    const fetchHolidays = async () => {
      const year = selectedDate.getFullYear();
      const fetchedHolidays = await getHolidays(year, 'AT');
      setHolidays(fetchedHolidays);
    };
    fetchHolidays();
  }, [selectedDate]);

  return { holidays };
};
