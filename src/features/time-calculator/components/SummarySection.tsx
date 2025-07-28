import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart3, Settings } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import { formatHoursMinutes } from '@/lib/timeUtils';
import { useTimeCalculatorContext } from '../contexts/TimeCalculatorContext';

export const SummarySection: React.FC = () => {
  const {
    weeklySummary,
    monthlySummary,
    yearlySummary,
    totalSummary,
    weeklyBalance,
    weeklyTargetHours,
    setWeeklyTargetHours,
    selectedDate,
  } = useTimeCalculatorContext();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Zusammenfassung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium">Diese Woche</span>
            <motion.span
              key={`weekly-${weeklySummary}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-lg"
            >
              {formatHoursMinutes(weeklySummary)}
            </motion.span>
          </div>
          <p className="text-xs text-muted-foreground">
            {format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'dd.MM')} - {format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'dd.MM')}
          </p>
        </div>
        <div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Wochen-Saldo</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Settings className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={weeklyTargetHours}
                      onChange={(e) => {
                        const value = e.target.value.replace(',', '.');
                        setWeeklyTargetHours(parseFloat(value) || 0);
                      }}
                      className="h-8 w-24 text-sm"
                      step="0.5"
                    />
                    <span className="text-xs text-muted-foreground">Soll-Std./Woche</span>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <motion.span
              key={`balance-${weeklyBalance}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`font-bold text-lg ${weeklyBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}
            >
              {weeklyBalance >= 0 ? '+' : ''}{formatHoursMinutes(weeklyBalance)}
            </motion.span>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium">Dieser Monat</span>
            <motion.span
              key={`monthly-${monthlySummary}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-lg"
            >
              {formatHoursMinutes(monthlySummary)}
            </motion.span>
          </div>
          <p className="text-xs text-muted-foreground">
            {format(selectedDate, 'MMMM yyyy', { locale: de })}
          </p>
        </div>
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium">Dieses Jahr</span>
            <motion.span
              key={`yearly-${yearlySummary}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-lg"
            >
              {formatHoursMinutes(yearlySummary)}
            </motion.span>
          </div>
          <p className="text-xs text-muted-foreground">
            {format(selectedDate, 'yyyy')}
          </p>
        </div>
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium">Gesamt</span>
            <motion.span
              key={`total-${totalSummary}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-lg"
            >
              {formatHoursMinutes(totalSummary)}
            </motion.span>
          </div>
          <p className="text-xs text-muted-foreground">
            Alle erfassten Daten
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
