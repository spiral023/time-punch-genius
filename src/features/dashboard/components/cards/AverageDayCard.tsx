import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { useTimeCalculatorContext } from '@/features/time-calculator/contexts/TimeCalculatorContext';

export const AverageDayCard: React.FC = () => {
  const { averageDayData } = useTimeCalculatorContext();
  const { avgStart, avgEnd, avgBreak, avgHours } = averageDayData;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Mein durchschnittlicher Tag
        </CardTitle>
      </CardHeader>
      <CardContent>
        <blockquote className="italic text-muted-foreground">
          "Ich arbeite im Schnitt von <strong className="text-foreground">{avgStart}</strong> bis <strong className="text-foreground">{avgEnd} ({avgHours})</strong> und mache dabei <strong className="text-foreground">{avgBreak}</strong> Minuten Pause."
        </blockquote>
      </CardContent>
    </Card>
  );
};
