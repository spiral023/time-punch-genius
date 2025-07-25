import { useMemo } from 'react';
import { calculateTimeDetails } from '@/lib/timeUtils';

export const useTimeCalculator = (input: string, currentTime: Date) => {
  return useMemo(() => {
    return calculateTimeDetails(input, currentTime);
  }, [input, currentTime]);
};
