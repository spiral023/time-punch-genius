import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { de } from 'date-fns/locale';

interface DateNavigatorProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({ selectedDate, setSelectedDate }) => {
  const changeDay = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' ? subDays(selectedDate, 1) : addDays(selectedDate, 1);
    setSelectedDate(newDate);
  };

  return (
    <div className="flex justify-center items-center gap-4 mb-6">
      <Button variant="outline" size="icon" onClick={() => changeDay('prev')}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-64 justify-start text-left font-normal">
            <CalendarDays className="mr-2 h-4 w-4" />
            {format(selectedDate, 'eeee, dd. MMMM yyyy', { locale: de })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            initialFocus
            locale={de}
          />
        </PopoverContent>
      </Popover>
      <Button variant="outline" size="icon" onClick={() => changeDay('next')}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
