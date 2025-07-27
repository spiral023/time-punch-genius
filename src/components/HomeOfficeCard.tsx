import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home } from 'lucide-react';
import { StatisticLine } from './StatisticLine';

interface HomeOfficeCardProps {
  workdays: number;
  weekendsAndHolidays: number;
  hoursInNormalTime: string;
  hoursOutsideNormalTime: string;
  pureOfficeDays: number;
  hybridDays: number;
  hoHoursPercentage: number;
  hoDaysPercentage: number;
}

export const HomeOfficeCard: React.FC<HomeOfficeCardProps> = ({
  workdays,
  weekendsAndHolidays,
  hoursInNormalTime,
  hoursOutsideNormalTime,
  pureOfficeDays,
  hybridDays,
  hoHoursPercentage,
  hoDaysPercentage,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Home-Office-Statistik
        </CardTitle>
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
          value={`${hoHoursPercentage.toFixed(2)}%`}
          tooltip="Zeigt den prozentualen Anteil der reinen Home-Office-Stunden an der gesamten Arbeitszeit (Büro + Home-Office)"
        />
        <StatisticLine
          label="HO Anteil % Tage"
          value={`${hoDaysPercentage.toFixed(2)}%`}
          tooltip="Anteil der Tage mit teil oder voll Homeoffice an Gesamtarbeitstagen (ohne Wochenenden und Feiertage)"
        />
      </CardContent>
    </Card>
  );
};
