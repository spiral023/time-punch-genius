import { useMemo } from 'react';
import { calculateTimeDetails } from '@/lib/timeUtils';

export const useTimeCalculator = (input: string, currentTime: Date, dailyTargetMinutes: number) => {
  return useMemo(() => {
    return calculateTimeDetails(input, currentTime, dailyTargetMinutes);
  }, [input, currentTime, dailyTargetMinutes]);
};
