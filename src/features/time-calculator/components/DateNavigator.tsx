import React from 'react';
import { isHoliday } from '@/lib/holidays';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { getWeekNumber } from '@/lib/timeUtils';
import { useTimeCalculatorContext } from '../contexts/TimeCalculatorContext';

interface DateNavigatorProps {
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({ leftSlot, rightSlot }) => {
  const { selectedDate, setSelectedDate, holidays } = useTimeCalculatorContext();

  const changeDay = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' ? subDays(selectedDate, 1) : addDays(selectedDate, 1);
    setSelectedDate(newDate);
  };

  const holidayName = isHoliday(selectedDate, holidays)
    ? holidays.find(h => h.date === format(selectedDate, 'yyyy-MM-dd'))?.localName
    : null;

  return (
    <div className="flex justify-center items-center gap-2 mb-6 flex-wrap">
      {leftSlot && (
        <div className="flex items-center">
          {leftSlot}
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => changeDay('prev')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-64 sm:w-72 justify-center text-center font-normal flex-col h-auto py-2">
              <div className="flex items-center">
                <CalendarDays className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">
                  {format(selectedDate, 'eeee, dd. MMMM yyyy', { locale: de })} (KW{getWeekNumber(selectedDate)})
                </span>
                <span className="sm:hidden">
                  {format(selectedDate, 'dd.MM.yyyy', { locale: de })} (KW{getWeekNumber(selectedDate)})
                </span>
              </div>
              {holidayName && <div className="text-xs text-yellow-500 font-semibold">{holidayName}</div>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
              locale={de}
              modifiers={{ holiday: (date) => isHoliday(date, holidays) }}
              modifiersClassNames={{ holiday: 'text-yellow-500 font-bold' }}
            />
          </PopoverContent>
        </Popover>
        <Button variant="outline" size="icon" onClick={() => changeDay('next')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      {rightSlot && (
        <div className="flex items-center">
          {rightSlot}
        </div>
      )}
    </div>
  );
};
