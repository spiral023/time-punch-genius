import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useFreeDays } from '@/features/time-calculator/hooks/useFreeDays';
import { PersonalVacationDaysSetting } from '@/features/time-calculator/components/PersonalVacationDaysSetting';
import { CalendarCheck } from 'lucide-react';
import { useTimeCalculatorContext } from '@/features/time-calculator/contexts/TimeCalculatorContext';
import { getYear } from 'date-fns';

export const FreeDaysCard: React.FC = () => {
  const { selectedDate } = useTimeCalculatorContext();
  const {
    personalVacationDays,
    usedVacationDays,
    publicHolidays,
    pastPublicHolidays,
  } = useFreeDays(selectedDate.getFullYear());

  // Calculate vacation usage
  const standardVacationUsed = Math.min(usedVacationDays, personalVacationDays);
  const extraVacationUsed = Math.max(0, usedVacationDays - personalVacationDays);
  const standardVacationPercentage = personalVacationDays > 0 ? (standardVacationUsed / personalVacationDays) * 100 : 0;
  const hasExtraVacation = extraVacationUsed > 0;

  const holidayPercentage = publicHolidays > 0 ? (pastPublicHolidays / publicHolidays) * 100 : 0;

  const getProgressColor = (percentage: number) => {
    if (percentage > 75) {
      return "bg-red-500";
    }
    if (percentage > 50) {
      return "bg-yellow-500";
    }
    return "bg-primary";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between w-full">
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
            Freie Tage
          </CardTitle>
          <PersonalVacationDaysSetting />
        </div>
        <CardDescription>Übersicht für das Jahr {getYear(selectedDate)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <div className="space-y-2">
          <div className="relative">
            <Progress
              value={standardVacationPercentage}
              className="h-3"
              indicatorClassName={getProgressColor(standardVacationPercentage)}
            />
            {hasExtraVacation && (
              <div className="absolute top-0 right-0 h-3 bg-orange-500 rounded-r-full flex items-center justify-center min-w-[20px] px-1">
                <span className="text-[8px] text-white font-bold">+{extraVacationUsed}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Urlaubstage: {standardVacationUsed}/{personalVacationDays}</span>
              {hasExtraVacation && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0">
                  +{extraVacationUsed} Zusatz
                </Badge>
              )}
            </div>
            <span>{standardVacationPercentage.toFixed(0)}%</span>
          </div>
          {hasExtraVacation && (
            <div className="text-[10px] text-orange-600 font-medium">
              Zusätzliche Urlaubstage (z.B. Übertrag aus Vorjahr)
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Progress
            value={holidayPercentage}
            className="h-3"
            indicatorClassName={getProgressColor(holidayPercentage)}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{`Feiertage: ${pastPublicHolidays}/${publicHolidays}`}</span>
            <span>{`${holidayPercentage.toFixed(0)}%`}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
