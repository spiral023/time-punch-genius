// HomeOfficeCard.tsx
// HomeOfficeCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
        <div className="flex justify-between">
          <span className="text-sm">HO Tage an Werktagen</span>
          <span className="text-sm font-bold">{workdays}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">HO Tage an WE/Feiertagen</span>
          <span className="text-sm font-bold">{weekendsAndHolidays}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Reine Bürotage</span>
          <span className="text-sm font-bold">{pureOfficeDays}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Hybrid-Tage</span>
          <span className="text-sm font-bold">{hybridDays}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">HO Stunden (Normalzeit)</span>
          <span className="text-sm font-bold">{hoursInNormalTime}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">HO Stunden (außerhalb NZ)</span>
          <span className="text-sm font-bold">{hoursOutsideNormalTime}</span>
        </div>
        <div className="flex justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm cursor-help">HO Anteil % Stunden</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zeigt den prozentualen Anteil der reinen Home-Office-Stunden an der gesamten Arbeitszeit (Büro + Home-Office)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="text-sm font-bold">{hoHoursPercentage.toFixed(2)}%</span>
        </div>
        <div className="flex justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm cursor-help">HO Anteil % Tage</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Anteil der Tage mit teil oder voll Homeoffice an Gesamtarbeitstagen (ohne Wochenenden und Feiertage)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="text-sm font-bold">{hoDaysPercentage.toFixed(2)}%</span>
        </div>
      </CardContent>
    </Card>
  );
};
