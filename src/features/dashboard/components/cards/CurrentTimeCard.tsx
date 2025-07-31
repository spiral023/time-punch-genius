import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTimeCalculatorContext } from '@/features/time-calculator/contexts/TimeCalculatorContext';
import { useAppSettings } from '@/hooks/useAppSettings';
import { format, isToday } from 'date-fns';
import { de } from 'date-fns/locale';
import { Clock } from 'lucide-react';
import { gradients } from '@/lib/gradients';

export const CurrentTimeCard: React.FC = () => {
  const { gradientId, setGradientId } = useAppSettings();
  const { selectedDate, currentTime, holidays, getCurrentTimeColor } = useTimeCalculatorContext();

  const changeBackground = () => {
    const currentIndex = gradients.findIndex(g => g.id === gradientId);
    const nextIndex = (currentIndex + 1) % gradients.length;
    const nextGradient = gradients[nextIndex];
    setGradientId(nextGradient.id);
  };

  return (
    <Card onClick={changeBackground} className="cursor-pointer">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {isToday(selectedDate) ? 'Aktuelle Uhrzeit' : 'Tag'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${getCurrentTimeColor()}`}>
          {isToday(selectedDate)
            ? format(currentTime, 'HH:mm:ss')
            : holidays.find(h => h.date === format(selectedDate, 'yyyy-MM-dd'))?.localName ??
              format(selectedDate, 'eeee', { locale: de })}
        </div>
      </CardContent>
    </Card>
  );
};
