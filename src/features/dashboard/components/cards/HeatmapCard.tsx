import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useHeatmapData } from '@/features/time-calculator/hooks/useHeatmapData';
import { Flame, Maximize } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatHoursMinutes } from '@/lib/timeUtils';

interface HeatmapDataPoint {
  day: number;
  hour: number;
  value: number;
}

const yAxisLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

const getColor = (value: number, maxValue: number) => {
  if (value === 0) return 'hsl(var(--muted))';
  if (maxValue === 0) return 'hsl(var(--primary) / 0.2)'; // Handle case where there's only one value
  
  // Use a power scale to make differences more visible
  const intensity = Math.pow(value / maxValue, 0.7);
  
  // Clamp opacity between 0.15 (for very low values) and 1.0
  const opacity = Math.max(0.15, intensity);
  
  return `hsl(var(--primary) / ${opacity})`;
};

const HeatmapDetailView: React.FC<{ data: HeatmapDataPoint[], error: string | null }> = ({ data, error }) => {
  const maxValue = useMemo(() => data ? Math.max(...data.map(d => d.value)) : 0, [data]);

  return (
    <div className="p-4 overflow-x-auto">
      {error && <p className="text-red-500">{error}</p>}
      {!error && data && (
        <div className="grid grid-cols-[auto_repeat(24,minmax(0,1fr))] gap-1 text-xs">
          {/* Header Row for Hours */}
          <div /> {/* Empty corner */}
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="text-center text-muted-foreground">
              {String(i).padStart(2, '0')}
            </div>
          ))}

          {/* Data Rows for Days */}
          {yAxisLabels.map((dayLabel, dayIndex) => (
            <React.Fragment key={dayLabel}>
              <div className="font-medium text-muted-foreground flex items-center justify-end pr-2">{dayLabel}</div>
              {Array.from({ length: 24 }).map((_, hourIndex) => {
                const entry = data.find(d => d.day === dayIndex && d.hour === hourIndex);
                const value = entry ? entry.value : 0;
                return (
                  <Tooltip key={`${dayIndex}-${hourIndex}`}>
                    <TooltipTrigger>
                      <div
                        className="w-full h-5 rounded-sm"
                        style={{ backgroundColor: getColor(value, maxValue) }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{`${dayLabel}, ${hourIndex}:00 - ${hourIndex}:59`}</p>
                      <p>{`Zeit: ${formatHoursMinutes(value)}`}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

const HeatmapCard: React.FC = () => {
  const { data: heatmapData, error } = useHeatmapData();

  const compactData = useMemo(() => {
    if (!heatmapData) return { entries: [], maxValue: 0 };
    const entries = heatmapData.filter(d => d.hour >= 6 && d.hour <= 19);
    const maxValue = Math.max(...entries.map(d => d.value));
    return { entries, maxValue };
  }, [heatmapData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Arbeits-Heatmap
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Maximize className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-screen-lg">
              <DialogHeader>
                <DialogTitle>Detaillierte Arbeits-Heatmap</DialogTitle>
              </DialogHeader>
              <HeatmapDetailView data={heatmapData} error={error} />
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500">{error}</p>}
        {!error && (
          <div className="grid grid-cols-[auto_repeat(14,minmax(0,1fr))] gap-0.5">
            {/* Empty corner */}
            <div />
            {/* Hour labels */}
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="text-center text-xs text-muted-foreground">
                {i % 2 === 0 ? String(i + 6).padStart(2, '0') : ''}
              </div>
            ))}

            {/* Day labels and data */}
            {yAxisLabels.map((label, dayIndex) => (
              <React.Fragment key={label}>
                <div className="text-xs text-muted-foreground flex items-center justify-end pr-1">{label}</div>
                {Array.from({ length: 14 }).map((_, hourIndex) => {
                  const hour = hourIndex + 6;
                  const entry = compactData.entries.find(d => d.day === dayIndex && d.hour === hour);
                  const value = entry ? entry.value : 0;
                  return (
                    <Tooltip key={`${dayIndex}-${hourIndex}`}>
                      <TooltipTrigger>
                        <div
                          className="w-full h-2.5 rounded-sm"
                          style={{ backgroundColor: getColor(value, compactData.maxValue) }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{`${label}, ${hour}:00 - ${hour}:59`}</p>
                        <p>{`Zeit: ${formatHoursMinutes(value)}`}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HeatmapCard;
