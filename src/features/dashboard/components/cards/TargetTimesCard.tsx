import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Settings } from 'lucide-react';
import { addMinutesToTime, formatMinutesToTime } from '@/lib/timeUtils';
import { TargetTimeProgress } from '@/features/dashboard/components/TargetTimeProgress';
import { useTimeCalculatorContext } from '@/features/time-calculator/contexts/TimeCalculatorContext';
import { useAppSettings } from '@/hooks/useAppSettings';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const TARGET_6_HOURS_MINUTES = 360;
const TARGET_7_7_HOURS_MINUTES = 462;
const TARGET_10_HOURS_MINUTES = 600;
const TARGET_12_HOURS_MINUTES = 720;

const targetTimeItems = [
  { id: '6h', label: '6 Stunden', minutes: TARGET_6_HOURS_MINUTES, progressClassName: 'bg-gradient-to-r from-green-200 to-green-300 dark:from-green-800 dark:to-green-700' },
  { id: '7.7h', label: '7,7 Stunden', minutes: TARGET_7_7_HOURS_MINUTES, progressClassName: 'bg-gradient-to-r from-yellow-200 to-yellow-300 dark:from-yellow-800 dark:to-yellow-700' },
  { id: '10h', label: '10 Stunden', minutes: TARGET_10_HOURS_MINUTES, progressClassName: 'bg-gradient-to-r from-red-200 to-red-300 dark:from-red-800 dark:to-red-700' },
  { id: '12h', label: '12 Stunden', minutes: TARGET_12_HOURS_MINUTES, progressClassName: 'bg-gradient-to-r from-red-400 to-red-500 dark:from-red-900 dark:to-red-800' },
];

export const TargetTimesCard: React.FC = () => {
  const { targetTimesVisibility, setTargetTimesVisibility } = useAppSettings();

  // Initialize visibility if empty
  const visibleTargets = Object.keys(targetTimesVisibility).length === 0 
    ? targetTimeItems.reduce((acc, item) => {
        acc[item.id] = true;
        return acc;
      }, {} as { [key: string]: boolean })
    : targetTimesVisibility;

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

  if (specialDayType) {
    return null;
  }

  const handleVisibilityChange = (id: string, checked: boolean) => {
    const newVisibility = { ...visibleTargets, [id]: checked };
    setTargetTimesVisibility(newVisibility);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Zielzeiten
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {targetTimeItems.map(item => (
                <DropdownMenuItem key={item.id} onSelect={(e) => e.preventDefault()}>
                  <Label htmlFor={`vis-${item.id}`} className="flex items-center gap-2 font-normal">
                    <Checkbox
                      id={`vis-${item.id}`}
                      checked={visibleTargets[item.id] ?? true}
                      onCheckedChange={(checked) => handleVisibilityChange(item.id, !!checked)}
                    />
                    {item.label}
                  </Label>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {targetTimeItems.map(item => (
          (visibleTargets[item.id] ?? true) && (
            <TargetTimeProgress
              key={item.id}
              label={item.label}
              targetTime={calculateTargetTime(item.minutes)}
              progressValue={Math.min((totalMinutes / item.minutes) * 100, 100)}
              targetMinutes={item.minutes}
              progressClassName={item.progressClassName}
            />
          )
        ))}
      </CardContent>
    </Card>
  );
};
