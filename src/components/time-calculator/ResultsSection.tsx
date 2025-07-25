import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, Target } from 'lucide-react';
import { formatHoursMinutes, addMinutesToTime } from '@/lib/timeUtils';
import { TimeEntry } from '@/types';
import { TargetTimeProgress } from '../TargetTimeProgress';

interface ResultsSectionProps {
  totalMinutes: number;
  timeEntries: TimeEntry[];
  handlePunch: () => void;
}

const TARGET_6_HOURS_MINUTES = 360;
const TARGET_7_7_HOURS_MINUTES = 462;
const TARGET_10_HOURS_MINUTES = 600;

export const ResultsSection: React.FC<ResultsSectionProps> = ({
  totalMinutes,
  timeEntries,
  handlePunch,
}) => {
  const getTextColorClass = (minutes: number): string => {
    if (minutes < 360) { // unter 06:00
      return 'text-red-500';
    } else if (minutes >= 360 && minutes < 462) { // zwischen 06:00 und 07:42
      return 'text-purple-500';
    } else if (minutes >= 462 && minutes < 570) { // zwischen 07:42 und 09:30
      return 'text-green-500';
    } else if (minutes >= 570 && minutes < 600) { // zwischen 09:30 und 10:00
      return 'text-yellow-500';
    } else { // über 10:00
      return 'text-red-500';
    }
  };

  const calculateTargetTime = (targetMinutes: number): string | null => {
    if (timeEntries.length === 0) return null;
    
    const remainingMinutes = targetMinutes - totalMinutes;
    if (remainingMinutes <= 0) return "Ziel bereits erreicht";
    
    const lastEntry = timeEntries[timeEntries.length - 1];
    return addMinutesToTime(lastEntry.end, remainingMinutes);
  };

  const progress6h = Math.min((totalMinutes / TARGET_6_HOURS_MINUTES) * 100, 100);
  const progress77 = Math.min((totalMinutes / TARGET_7_7_HOURS_MINUTES) * 100, 100);
  const progress10h = Math.min((totalMinutes / TARGET_10_HOURS_MINUTES) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Arbeitszeit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                key={totalMinutes}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className={`text-4xl font-bold ${getTextColorClass(totalMinutes)} cursor-pointer`}
                onClick={handlePunch}
              >
                {formatHoursMinutes(totalMinutes)}
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Klicken zum Ein- oder Ausstempeln</p>
            </TooltipContent>
          </Tooltip>
          <div className="text-sm text-muted-foreground mt-2">
            Delta:&nbsp;
            <span className={`font-bold ${totalMinutes - TARGET_7_7_HOURS_MINUTES >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalMinutes - TARGET_7_7_HOURS_MINUTES >= 0 ? '+' : ''}{formatHoursMinutes(totalMinutes - TARGET_7_7_HOURS_MINUTES)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {timeEntries.length > 0
              ? `${timeEntries.length} ${timeEntries.length === 1 ? 'Zeitraum' : 'Zeiträume'} erfasst`
              : "Keine Einträge"
            }
          </p>
        </CardContent>
      </Card>

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
        </CardContent>
      </Card>
    </motion.div>
  );
};
