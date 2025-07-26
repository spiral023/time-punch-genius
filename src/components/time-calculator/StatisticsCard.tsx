import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { formatHoursMinutes } from '@/lib/timeUtils';

interface StatisticsCardProps {
  daysWithBookings: number;
  daysInYear: number;
  earliestStart: string | null;
  latestEnd: string | null;
  longestBreak: number | null;
  earliestStartDate: string | null;
  latestEndDate: string | null;
  longestBreakDate: string | null;
  daysOver9Hours: number;
  longestWeek: number | null;
  longestWeekStart: string | null;
  longestWeekEnd: string | null;
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  daysWithBookings,
  daysInYear,
  earliestStart,
  latestEnd,
  longestBreak,
  earliestStartDate,
  latestEndDate,
  longestBreakDate,
  daysOver9Hours,
  longestWeek,
  longestWeekStart,
  longestWeekEnd,
}) => {
  const bookedDaysPercentage = daysInYear > 0 ? ((daysWithBookings / daysInYear) * 100).toFixed(1) : 0;
  const over9HoursPercentage = daysWithBookings > 0 ? ((daysOver9Hours / daysWithBookings) * 100).toFixed(1) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Statistik
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium">Tage mit Buchungen</span>
            <motion.span
              key={`booked-days-${daysWithBookings}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-lg"
            >
              {daysWithBookings} / {daysInYear}
            </motion.span>
          </div>
          <p className="text-xs text-muted-foreground text-right">
            Das sind {bookedDaysPercentage}%
          </p>
        </div>
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium">Frühester Beginn</span>
            <motion.span
              key={`earliest-start-${earliestStart}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-lg"
            >
              {earliestStart || '-'}
            </motion.span>
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {earliestStartDate ? format(new Date(earliestStartDate), 'dd.MM.yyyy', { locale: de }) : ''}
          </p>
        </div>
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium">Spätestes Ende</span>
            <motion.span
              key={`latest-end-${latestEnd}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-lg"
            >
              {latestEnd || '-'}
            </motion.span>
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {latestEndDate ? format(new Date(latestEndDate), 'dd.MM.yyyy', { locale: de }) : ''}
          </p>
        </div>
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium">Längste Pause</span>
            <motion.span
              key={`longest-break-${longestBreak}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-lg"
            >
              {longestBreak ? formatHoursMinutes(longestBreak) : '-'}
            </motion.span>
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {longestBreakDate ? format(new Date(longestBreakDate), 'dd.MM.yyyy', { locale: de }) : ''}
          </p>
        </div>
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium">{'Tage > 9h'}</span>
            <motion.span
              key={`over-9-hours-${daysOver9Hours}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-lg"
            >
              {daysOver9Hours} Tage
            </motion.span>
          </div>
          <p className="text-xs text-muted-foreground text-right">
            Das sind {over9HoursPercentage}%
          </p>
        </div>
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium">Längste Woche</span>
            <motion.span
              key={`longest-week-${longestWeek}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-lg"
            >
              {longestWeek ? formatHoursMinutes(longestWeek) : '-'}
            </motion.span>
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {longestWeekStart && longestWeekEnd
              ? `KW ${format(new Date(longestWeekStart), 'ww', {
                  locale: de,
                })} (${format(new Date(longestWeekStart), 'dd.', {
                  locale: de,
                })}–${format(new Date(longestWeekEnd), 'dd. MMM', {
                  locale: de,
                })})`
              : ''}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
