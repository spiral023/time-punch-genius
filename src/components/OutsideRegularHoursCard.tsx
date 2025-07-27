import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';

import { Separator } from './ui/separator';

interface OutsideRegularHoursCardProps {
  selectedDate: Date;
  outsideHoursWeek: string;
  outsideHoursMonth: string;
  outsideHoursYear: string;
  daysWithOutsideHours: number;
  totalDaysWithEntries: number;
  totalWeekMinutes: number;
  totalMonthMinutes: number;
  totalYearMinutes: number;
  rawOutsideHoursWeek: number;
  rawOutsideHoursMonth: number;
  rawOutsideHoursYear: number;
}

export const OutsideRegularHoursCard: React.FC<OutsideRegularHoursCardProps> = ({
  selectedDate,
  outsideHoursWeek,
  outsideHoursMonth,
  outsideHoursYear,
  daysWithOutsideHours,
  totalDaysWithEntries,
  totalWeekMinutes,
  totalMonthMinutes,
  totalYearMinutes,
  rawOutsideHoursWeek,
  rawOutsideHoursMonth,
  rawOutsideHoursYear,
}) => {
  const daysPercentage = totalDaysWithEntries > 0
    ? ((daysWithOutsideHours / totalDaysWithEntries) * 100).toFixed(1)
    : 0;

  const weekPercentage = totalWeekMinutes > 0
    ? ((rawOutsideHoursWeek / totalWeekMinutes) * 100).toFixed(1)
    : 0;

  const monthPercentage = totalMonthMinutes > 0
    ? ((rawOutsideHoursMonth / totalMonthMinutes) * 100).toFixed(1)
    : 0;

  const yearPercentage = totalYearMinutes > 0
    ? ((rawOutsideHoursYear / totalYearMinutes) * 100).toFixed(1)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Außerhalb Normalzeit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium">Diese Woche</span>
            <span className="font-bold text-lg">
              {outsideHoursWeek} {totalWeekMinutes > 0 && `(${weekPercentage}%)`}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'dd.MM')} - {format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'dd.MM')}
          </p>
        </div>
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium">Dieser Monat</span>
            <span className="font-bold text-lg">
              {outsideHoursMonth} {totalMonthMinutes > 0 && `(${monthPercentage}%)`}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {format(selectedDate, 'MMMM yyyy', { locale: de })}
          </p>
        </div>

        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium">Dieses Jahr</span>
            <span className="font-bold text-lg">
              {outsideHoursYear} {totalYearMinutes > 0 && `(${yearPercentage}%)`}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {format(selectedDate, 'yyyy')}
          </p>
        </div>

        <Separator />

        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium">Gesamt</span>
            <span className="font-bold text-lg">
              {outsideHoursYear} {totalYearMinutes > 0 && `(${yearPercentage}%)`}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {daysWithOutsideHours} von {totalDaysWithEntries} Tagen mit Buchung ({daysPercentage}%)
          </p>
        </div>
        <p className="text-xs text-muted-foreground pt-2">
            Normalarbeitszeit: Mo-Fr 06:00 - 19:00 Uhr
        </p>
      </CardContent>
    </Card>
  );
};
