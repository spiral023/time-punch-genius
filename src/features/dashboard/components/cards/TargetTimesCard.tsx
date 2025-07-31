import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { addMinutesToTime, formatMinutesToTime } from '@/lib/timeUtils';
import { TargetTimeProgress } from '@/features/dashboard/components/TargetTimeProgress';
import { useTimeCalculatorContext } from '@/features/time-calculator/contexts/TimeCalculatorContext';

const TARGET_6_HOURS_MINUTES = 360;
const TARGET_7_7_HOURS_MINUTES = 462;
const TARGET_10_HOURS_MINUTES = 600;
const TARGET_12_HOURS_MINUTES = 720;

export const TargetTimesCard: React.FC = () => {
  const {
    totalMinutes,
    timeEntries,
    specialDayType,
    currentTime,
  } = useTimeCalculatorContext();

  const calculateTargetTime = (targetMinutes: number): string | null => {
    if (timeEntries.length === 0 || specialDayType) return null;

    const remainingMinutes = targetMinutes - totalMinutes;
    if (remainingMinutes <= 0) return 'Ziel bereits erreicht';

    const lastEntry = timeEntries[timeEntries.length - 1];

    // Check if the original line represents an open entry
    const isOpenEntry = lastEntry.originalLine.trim().match(/-\s*$/);

    if (isOpenEntry) {
      // If it's an open entry, calculate target from the real current time
      const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
      return formatMinutesToTime(nowMinutes + remainingMinutes);
    }

    return addMinutesToTime(lastEntry.end, remainingMinutes);
  };

  const progress6h = Math.min((totalMinutes / TARGET_6_HOURS_MINUTES) * 100, 100);
  const progress77 = Math.min((totalMinutes / TARGET_7_7_HOURS_MINUTES) * 100, 100);
  const progress10h = Math.min((totalMinutes / TARGET_10_HOURS_MINUTES) * 100, 100);
  const progress12h = Math.min((totalMinutes / TARGET_12_HOURS_MINUTES) * 100, 100);

  if (specialDayType) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Zielzeiten
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <TargetTimeProgress
          label="6 Stunden"
          targetTime={calculateTargetTime(TARGET_6_HOURS_MINUTES)}
          progressValue={progress6h}
          targetMinutes={TARGET_6_HOURS_MINUTES}
          progressClassName="bg-gradient-to-r from-green-200 to-green-300 dark:from-green-800 dark:to-green-700"
        />
        <TargetTimeProgress
          label="7,7 Stunden"
          targetTime={calculateTargetTime(TARGET_7_7_HOURS_MINUTES)}
          progressValue={progress77}
          targetMinutes={TARGET_7_7_HOURS_MINUTES}
          progressClassName="bg-gradient-to-r from-yellow-200 to-yellow-300 dark:from-yellow-800 dark:to-yellow-700"
        />
        <TargetTimeProgress
          label="10 Stunden"
          targetTime={calculateTargetTime(TARGET_10_HOURS_MINUTES)}
          progressValue={progress10h}
          targetMinutes={TARGET_10_HOURS_MINUTES}
          progressClassName="bg-gradient-to-r from-red-200 to-red-300 dark:from-red-800 dark:to-red-700"
        />
        <TargetTimeProgress
          label="12 Stunden"
          targetTime={calculateTargetTime(TARGET_12_HOURS_MINUTES)}
          progressValue={progress12h}
          targetMinutes={TARGET_12_HOURS_MINUTES}
          progressClassName="bg-gradient-to-r from-red-400 to-red-500 dark:from-red-900 dark:to-red-800"
        />
      </CardContent>
    </Card>
  );
};
