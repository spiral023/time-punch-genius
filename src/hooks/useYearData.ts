import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';

const formatDateKey = (date: Date): string => `zehelper_data_${format(date, 'yyyy-MM-dd')}`;

export const useYearData = (selectedDate: Date) => {
  const [yearData, setYearData] = useState<{ [date: string]: string }>({});

  useEffect(() => {
    const year = selectedDate.getFullYear();
    const allKeys = Object.keys(localStorage);
    const data: { [date: string]: string } = {};
    for (const key of allKeys) {
      if (key.startsWith('zehelper_data_')) {
        const dateStr = key.replace('zehelper_data_', '');
        if (dateStr.startsWith(year.toString())) {
          data[dateStr] = localStorage.getItem(key) || '';
        }
      }
    }
    setYearData(data);
  }, [selectedDate.getFullYear()]);

  const updateYearData = useCallback((date: Date, input: string) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setYearData(prevData => ({
      ...prevData,
      [dateKey]: input
    }));
  }, []);

  return { yearData, updateYearData };
};
