import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Home } from 'lucide-react';
import { StatisticLine } from '../StatisticLine';
import { useTimeCalculatorContext } from '@/features/time-calculator/contexts/TimeCalculatorContext';
import { formatHoursMinutes } from '@/lib/timeUtils';
import { getYear } from 'date-fns';

export const HomeOfficeCard: React.FC = () => {
  const { homeOfficeStats, selectedDate } = useTimeCalculatorContext();
  const {
    homeOfficeDaysWorkdays: workdays,
    homeOfficeDaysWeekendsAndHolidays: weekendsAndHolidays,
    totalHomeOfficeHoursInNormalTime,
    totalHomeOfficeHoursOutsideNormalTime,
    pureOfficeDays,
    hybridDays,
    hoHoursPercentage,
    hoDaysPercentage,
  } = homeOfficeStats;

  const hoursInNormalTime = formatHoursMinutes(totalHomeOfficeHoursInNormalTime);
  const hoursOutsideNormalTime = formatHoursMinutes(totalHomeOfficeHoursOutsideNormalTime);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Home-Office
        </CardTitle>
        <CardDescription>Statistik für das Jahr {getYear(selectedDate)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <StatisticLine label="HO Tage an Werktagen" value={workdays} />
        <StatisticLine label="HO Tage an WE/Feiertagen" value={weekendsAndHolidays} />
        <StatisticLine label="Reine Bürotage" value={pureOfficeDays} />
        <StatisticLine label="Hybrid-Tage" value={hybridDays} />
        <StatisticLine label="HO Stunden (Normalzeit)" value={hoursInNormalTime} />
        <StatisticLine label="HO Stunden (außerhalb NZ)" value={hoursOutsideNormalTime} />
        <StatisticLine
          label="HO Anteil % Stunden"
          value={`${hoHoursPercentage.toFixed(1)}%`}
          tooltip="Zeigt den prozentualen Anteil der reinen Home-Office-Stunden an der gesamten Arbeitszeit (Büro + Home-Office)"
        />
        <StatisticLine
          label="HO Anteil % Tage"
          value={`${hoDaysPercentage.toFixed(1)}%`}
          tooltip="Anteil der Tage mit teil oder voll Homeoffice an Gesamtarbeitstagen (ohne Wochenenden und Feiertage)"
        />
      </CardContent>
    </Card>
  );
};
