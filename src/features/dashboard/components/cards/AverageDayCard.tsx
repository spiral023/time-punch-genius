import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp } from 'lucide-react';
import { useTimeCalculatorContext } from '@/features/time-calculator/contexts/TimeCalculatorContext';
import { getYear } from 'date-fns';

export const AverageDayCard: React.FC = () => {
  const { averageDayData, selectedDate } = useTimeCalculatorContext();
  const { avgStart, avgEnd, avgBreak, avgHours } = averageDayData;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help">Mein durchschnittlicher Tag</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Gemessen nur in der Normalarbeitszeit</p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
        <CardDescription>Durchschnitt für das Jahr {getYear(selectedDate)}</CardDescription>
      </CardHeader>
      <CardContent>
        <blockquote className="italic text-muted-foreground">
          "Ich arbeite im Schnitt von <strong className="text-foreground">{avgStart}</strong> bis <strong className="text-foreground">{avgEnd} ({avgHours})</strong> und mache dabei <strong className="text-foreground">{avgBreak}</strong> Minuten Pause."
        </blockquote>
      </CardContent>
    </Card>
  );
};
