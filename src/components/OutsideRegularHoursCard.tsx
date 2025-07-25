import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';

interface OutsideRegularHoursCardProps {
  selectedDate: Date;
  outsideHoursWeek: string;
  outsideHoursMonth: string;
  outsideHoursYear: string;
}

export const OutsideRegularHoursCard: React.FC<OutsideRegularHoursCardProps> = ({ selectedDate, outsideHoursWeek, outsideHoursMonth, outsideHoursYear }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Arbeit außerhalb der Normalarbeitszeit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium">Diese Woche</span>
            <span className="font-bold text-lg">{outsideHoursWeek}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'dd.MM')} - {format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'dd.MM')}
          </p>
        </div>
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium">Dieser Monat</span>
            <span className="font-bold text-lg">{outsideHoursMonth}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {format(selectedDate, 'MMMM yyyy', { locale: de })}
          </p>
        </div>
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium">Dieses Jahr</span>
            <span className="font-bold text-lg">{outsideHoursYear}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {format(selectedDate, 'yyyy')}
          </p>
        </div>
        <p className="text-xs text-muted-foreground pt-2">
            Normalarbeitszeit: Mo-Fr 06:00 - 19:00 Uhr
        </p>
      </CardContent>
    </Card>
  );
};
