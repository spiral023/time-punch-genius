import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface AverageDayCardProps {
  avgStart: string;
  avgEnd: string;
  avgBreak: number;
  avgHours: string;
}

export const AverageDayCard: React.FC<AverageDayCardProps> = ({ avgStart, avgEnd, avgBreak, avgHours }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Durchschnittlicher Tag
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
