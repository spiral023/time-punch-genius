import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, AlertTriangle } from 'lucide-react';
import { formatHoursMinutes } from '@/lib/timeUtils';
import { useTimeCalculatorContext } from '@/features/time-calculator/contexts/TimeCalculatorContext';
import { format } from 'date-fns';

const TARGET_7_7_HOURS_MINUTES = 462;

export const WorkingTimeCard: React.FC = () => {
  const {
    totalMinutes,
    timeEntries,
    handlePunch,
    specialDayType,
    selectedDate,
  } = useTimeCalculatorContext();
  const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;
  
  // Prüfe, ob das ausgewählte Datum heute ist
  const today = new Date();
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  
  // Definiere ganztägige Sondertage, bei denen kein Punchen erlaubt ist
  const fullDaySpecialTypes = [
    'vacation',
    'sick', 
    'care_leave',
    'wedding',
    'bereavement',
    'special_leave',
    'works_council',
    'training',
    'vocational_school'
  ];
  
  // Erlaube Punchen für heute, außer bei ganztägigen Sondertagen
  const canPunch = isToday && (!specialDayType || !fullDaySpecialTypes.includes(specialDayType));

  const getTextColorClass = (minutes: number): string => {
    if (specialDayType) return 'text-blue-500';
    if (minutes < 360) { // unter 06:00
      return 'text-red-500';
    } else if (minutes >= 360 && minutes < 462) { // zwischen 06:00 und 07:42
      return 'text-purple-500';
    } else if (minutes >= 462 && minutes < 570) { // zwischen 07:42 und 09:30
      return 'text-green-500';
    } else if (minutes >= 570 && minutes < 600) { // zwischen 09:30 und 10:00
      return 'text-yellow-500';
    } else { // über 10:00
      return 'text-red-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Arbeitszeit
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              key={totalMinutes}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className={`text-4xl font-bold ${getTextColorClass(totalMinutes)} ${canPunch ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
              onClick={canPunch ? handlePunch : undefined}
            >
              {formatHoursMinutes(totalMinutes)}
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {!isToday 
                ? 'Zeitbuchungen nur für heute möglich' 
                : specialDayType === 'holiday'
                ? 'Klicken zum Ein- oder Ausstempeln (Feiertag)'
                : specialDayType && fullDaySpecialTypes.includes(specialDayType)
                ? 'Zeitbuchung bei ganztägigen Sondertagen nicht möglich' 
                : 'Klicken zum Ein- oder Ausstempeln'
              }
            </p>
          </TooltipContent>
        </Tooltip>
        
        {/* Warn-Icon ab 9h 30m - groß und rechtsbündig */}
        {totalMinutes >= 570 && !specialDayType && (
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                animate={totalMinutes >= 600 ? { opacity: [1, 0.3, 1] } : {}}
                transition={totalMinutes >= 600 ? { duration: 1, repeat: Infinity } : {}}
                className={`absolute top-0 right-5 ${getTextColorClass(totalMinutes)}`}
              >
                <AlertTriangle className="h-24 w-24" />
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {totalMinutes >= 600 
                  ? 'Achtung: Arbeitszeit über 10 Stunden!' 
                  : 'Warnung: Arbeitszeit über 9h 30m'
                }
              </p>
            </TooltipContent>
          </Tooltip>
        )}
        <div className="text-sm text-muted-foreground mt-2">
          Delta:&nbsp;
          <span className={`font-bold ${specialDayType === 'holiday' || isWeekend ? 'text-gray-500' : totalMinutes - TARGET_7_7_HOURS_MINUTES >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {specialDayType === 'holiday' || isWeekend ? formatHoursMinutes(0) : `${totalMinutes - TARGET_7_7_HOURS_MINUTES >= 0 ? '+' : ''}${formatHoursMinutes(totalMinutes - TARGET_7_7_HOURS_MINUTES)}`}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {specialDayType
            ? ''
            : timeEntries.length > 0
            ? `${timeEntries.length} ${timeEntries.length === 1 ? 'Zeitraum' : 'Zeiträume'} erfasst`
            : "Keine Einträge"
          }
        </p>
      </CardContent>
    </Card>
  );
};
