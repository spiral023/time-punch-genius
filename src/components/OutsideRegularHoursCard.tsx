import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface OutsideRegularHoursCardProps {
  outsideHoursWeek: string;
  outsideHoursMonth: string;
  outsideHoursYear: string;
}

export const OutsideRegularHoursCard: React.FC<OutsideRegularHoursCardProps> = ({ outsideHoursWeek, outsideHoursMonth, outsideHoursYear }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Arbeit außerhalb der Normalarbeitszeit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
            <p><strong>Diese Woche:</strong> {outsideHoursWeek}</p>
            <p><strong>Dieser Monat:</strong> {outsideHoursMonth}</p>
            <p><strong>Dieses Jahr:</strong> {outsideHoursYear}</p>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
            Normalarbeitszeit: Mo-Fr 06:00 - 19:00 Uhr
        </p>
      </CardContent>
    </Card>
  );
};
