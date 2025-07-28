import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

const getHolidays = async (year: number) => {
  const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/AT`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const useHolidays = (year: number) => {
  return useQuery({
    queryKey: ['holidays', year],
    queryFn: () => getHolidays(year),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 30, // 30 days
  });
};
