import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useFreeDays } from '@/features/time-calculator/hooks/useFreeDays';
import { PersonalVacationDaysSetting } from '@/features/time-calculator/components/PersonalVacationDaysSetting';
import { CalendarCheck } from 'lucide-react';
import { useTimeCalculatorContext } from '@/features/time-calculator/contexts/TimeCalculatorContext';

export const FreeDaysCard: React.FC = () => {
  const { selectedDate } = useTimeCalculatorContext();
  const {
    personalVacationDays,
    usedVacationDays,
    publicHolidays,
    pastPublicHolidays,
  } = useFreeDays(selectedDate.getFullYear());

  const vacationPercentage = personalVacationDays > 0 ? (usedVacationDays / personalVacationDays) * 100 : 0;
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
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <div className="space-y-2">
          <Progress
            value={vacationPercentage}
            className="h-3"
            indicatorClassName={getProgressColor(vacationPercentage)}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{`Urlaubstage: ${usedVacationDays}/${personalVacationDays}`}</span>
            <span>{`${vacationPercentage.toFixed(0)}%`}</span>
          </div>
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
