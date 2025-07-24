import React from 'react';
import { Progress } from '@/components/ui/progress';
import { formatHoursMinutes } from '@/lib/timeUtils';

interface TargetTimeProgressProps {
  label: string;
  targetTime: string | null;
  progressValue: number;
  targetMinutes: number;
  progressClassName: string;
}

export const TargetTimeProgress: React.FC<TargetTimeProgressProps> = ({
  label,
  targetTime,
  progressValue,
  targetMinutes,
  progressClassName,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">
          {targetTime || '--:--'}
        </span>
      </div>
      <div className="space-y-2">
        <Progress value={progressValue} className={`h-3 ${progressClassName}`} />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{Math.round(progressValue * 10) / 10}%</span>
          <span>{formatHoursMinutes(targetMinutes)}</span>
        </div>
      </div>
    </div>
  );
};
