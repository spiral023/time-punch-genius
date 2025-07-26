import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useFreeDays } from '@/hooks/useFreeDays';
import { PersonalVacationDaysSetting } from './time-calculator/PersonalVacationDaysSetting';

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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Freie Tage</CardTitle>
        <PersonalVacationDaysSetting />
      </CardHeader>
      <CardContent className="space-y-4">
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
