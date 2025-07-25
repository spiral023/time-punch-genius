import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { formatHoursMinutes } from '@/lib/timeUtils';
import { Button } from './ui/button';
import { Bell, BellOff } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Slider } from './ui/slider';
import { Label } from './ui/label';

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
  const { scheduleNotification } = useNotifications();
  const [isScheduled, setIsScheduled] = useState(false);
  const [offsetMinutes, setOffsetMinutes] = useState(5);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleSaveNotification = async () => {
    if (targetTime && targetTime !== "Ziel bereits erreicht") {
      await scheduleNotification(
        targetTime,
        'Zielzeit erreicht!',
        `Du hast deine Zielzeit von ${label} erreicht.`,
        offsetMinutes
      );
      setIsScheduled(true);
      setPopoverOpen(false);
    }
  };

  const isAchieved = targetTime === "Ziel bereits erreicht";

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {targetTime || '--:--'}
          </span>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={!targetTime || isAchieved || isScheduled}
                className="h-7 w-7"
              >
                {isScheduled ? (
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-4 text-center">
                <Label htmlFor="notification-time" className="text-sm font-medium">
                  Benachrichtigung {offsetMinutes > 0 ? `${offsetMinutes} Minuten früher` : 'genau zur Zielzeit'}
                </Label>
                <Slider
                  id="notification-time"
                  min={0}
                  max={30}
                  step={5}
                  value={[offsetMinutes]}
                  onValueChange={(value) => setOffsetMinutes(value[0])}
                />
                <Button onClick={handleSaveNotification} className="w-full">
                  Aktivieren
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
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
