import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useFreeDays } from '@/hooks/useFreeDays';
import { PersonalVacationDaysSetting } from './time-calculator/PersonalVacationDaysSetting';
import { CalendarCheck } from 'lucide-react';

interface FreeDaysCardProps {
  year: number;
}

export const FreeDaysCard: React.FC<FreeDaysCardProps> = ({ year }) => {
  const {
    personalVacationDays,
    usedVacationDays,
    publicHolidays,
    pastPublicHolidays,
  } = useFreeDays(year);

  const vacationPercentage = personalVacationDays > 0 ? (usedVacationDays / personalVacationDays) * 100 : 0;
  const holidayPercentage = publicHolidays > 0 ? (pastPublicHolidays / publicHolidays) * 100 : 0;

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
        <div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{`Urlaubstage: ${usedVacationDays}/${personalVacationDays}`}</span>
            <span>{`${vacationPercentage.toFixed(0)}%`}</span>
          </div>
          <Progress value={vacationPercentage} className="mt-1" />
        </div>
        <div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{`Feiertage: ${pastPublicHolidays}/${publicHolidays}`}</span>
            <span>{`${holidayPercentage.toFixed(0)}%`}</span>
          </div>
          <Progress value={holidayPercentage} className="mt-1" />
        </div>
      </CardContent>
    </Card>
  );
};
