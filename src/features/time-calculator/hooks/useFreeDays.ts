import { useState, useEffect, useMemo } from 'react';
import { getHolidays } from '@/lib/holidays';
import { Holiday } from '@/types';
import { useAppSettings } from '@/hooks/useAppSettings';

export const useFreeDays = (year: number) => {
  const { personalVacationDays } = useAppSettings();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [yearData, setYearData] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchHolidays = async () => {
      const fetchedHolidays = await getHolidays(year, 'AT');
      setHolidays(fetchedHolidays);
    };
    fetchHolidays();
  }, [year]);

  useEffect(() => {
    const data: { [key: string]: string } = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`zehelper_data_${year}`)) {
        data[key] = localStorage.getItem(key) || '';
      }
    }
    setYearData(data);
  }, [year]);

  const usedVacationDays = useMemo(() => {
    return Object.values(yearData).filter(
      (input) => input.trim().toLowerCase() === 'urlaub'
    ).length;
  }, [yearData]);

  const pastPublicHolidays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return holidays.filter((h) => new Date(h.date) < today).length;
  }, [holidays]);

  return {
    personalVacationDays,
    usedVacationDays,
    publicHolidays: holidays.length,
    pastPublicHolidays,
  };
};
