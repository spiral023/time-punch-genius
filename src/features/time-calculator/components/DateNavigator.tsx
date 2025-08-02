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

// Datumsbeschränkungen für den Datepicker
const MIN_DATE = new Date(2024, 0, 1); // 1.1.2024
const MAX_DATE = new Date(2027, 11, 31); // 31.12.2027

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

  // Prüfung ob Navigation möglich ist
  const canGoBack = selectedDate > MIN_DATE;
  const canGoForward = selectedDate < MAX_DATE;

  return (
    <div className="flex justify-center items-center gap-1 sm:gap-2 mb-6">
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        {leftSlot && (
          <div className="flex items-center shrink-0">
            {leftSlot}
          </div>
        )}
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => changeDay('prev')}
          disabled={!canGoBack}
          className="shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-0 max-w-xs sm:max-w-sm justify-center text-center font-normal flex-col h-auto py-2">
              <div className="flex items-center min-w-0">
                <CalendarDays className="mr-2 h-4 w-4 shrink-0" />
                <span className="hidden sm:inline truncate">
                  {format(selectedDate, 'eeee, dd. MMMM yyyy', { locale: de })} (KW{getWeekNumber(selectedDate)})
                </span>
                <span className="sm:hidden truncate">
                  {format(selectedDate, 'dd.MM.yyyy', { locale: de })} (KW{getWeekNumber(selectedDate)})
                </span>
              </div>
              {holidayName && <div className="text-xs text-yellow-500 font-semibold truncate">{holidayName}</div>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              fromDate={MIN_DATE}
              toDate={MAX_DATE}
              initialFocus
              locale={de}
              modifiers={{ holiday: (date) => isHoliday(date, holidays) }}
              modifiersClassNames={{ holiday: 'text-yellow-500 font-bold' }}
            />
          </PopoverContent>
        </Popover>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => changeDay('next')}
          disabled={!canGoForward}
          className="shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        {rightSlot && (
          <div className="flex items-center shrink-0">
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  );
};
