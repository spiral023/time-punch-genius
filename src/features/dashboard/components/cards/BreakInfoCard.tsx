import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTimeCalculatorContext } from '@/features/time-calculator/contexts/TimeCalculatorContext';
import { Coffee } from 'lucide-react';
import { formatHoursMinutes } from '@/lib/timeUtils';

export const BreakInfoCard: React.FC = () => {
  const { totalBreak, breakDeduction, grossTotalMinutes } = useTimeCalculatorContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coffee className="h-5 w-5" />
          Pauseninfo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Konsumierte Pausen</span>
            <span className="text-sm font-bold">{formatHoursMinutes(totalBreak)}</span>
          </div>
          <p className="text-sm text-muted-foreground pt-2">
            {(() => {
              if (breakDeduction > 0) {
                return <span className="text-destructive">{`Gesetzliche Pause (${breakDeduction}m) wurde von der Arbeitszeit abgezogen.`}</span>;
              }
              if (grossTotalMinutes >= 360 && totalBreak >= 30) {
                return <span className="text-green-500">Die Pausenzeit von 30 Minuten wurde erreicht.</span>;
              }
              if (grossTotalMinutes >= 360 && totalBreak < 30) {
                return `Restliche ${30 - totalBreak}m Pause werden noch abgezogen.`;
              }
              return "Bei über 6h Arbeit sind 30m Pause Pflicht.";
            })()}
          </p>
        </div>
        <div className="flex justify-center mt-4">
          <a href='https://ko-fi.com/R6R21IOETB' target='_blank' rel="noopener noreferrer">
            <img height='36' style={{ border: 0, height: '36px' }} src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' alt='Buy Me a Coffee at ko-fi.com' />
          </a>
        </div>
      </CardContent>
    </Card>
  );
};
