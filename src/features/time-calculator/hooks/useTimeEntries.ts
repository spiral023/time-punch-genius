import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { TimeEntry } from '@/types';

const getTimeEntriesForDate = async (date: Date): Promise<TimeEntry[]> => {
  const dateString = format(date, 'yyyy-MM-dd');
  const allEntries = JSON.parse(localStorage.getItem('timeEntries') || '{}');
  return allEntries[dateString] || [];
};

const saveTimeEntriesForDate = async ({ date, entries }: { date: Date; entries: TimeEntry[] }) => {
  const dateString = format(date, 'yyyy-MM-dd');
  const allEntries = JSON.parse(localStorage.getItem('timeEntries') || '{}');
  allEntries[dateString] = entries;
  localStorage.setItem('timeEntries', JSON.stringify(allEntries));
  return entries;
};

export const useTimeEntries = (date: Date) => {
  const queryClient = useQueryClient();
  const dateString = format(date, 'yyyy-MM-dd');

  const query = useQuery({
    queryKey: ['timeEntries', dateString],
    queryFn: () => getTimeEntriesForDate(date),
  });

  const mutation = useMutation({
    mutationFn: saveTimeEntriesForDate,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['timeEntries', format(variables.date, 'yyyy-MM-dd')], data);
    },
  });

  return {
    ...query,
    updateEntries: mutation.mutate,
  };
};
