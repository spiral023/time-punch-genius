import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StatisticLineProps {
  label: string;
  value: string | number;
  tooltip?: string;
}

export const StatisticLine: React.FC<StatisticLineProps> = ({ label, value, tooltip }) => {
  const content = (
    <div className="flex justify-between">
      <span className="text-sm">{label}</span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex justify-between cursor-help">
              <span className="text-sm">{label}</span>
              <span className="text-sm font-bold">{value}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};
