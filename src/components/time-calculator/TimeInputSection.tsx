import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Calculator, Trash2, ListChecks } from 'lucide-react';
import { format } from 'date-fns';
import { TimeEntry } from '@/types';
import { formatHoursMinutes } from '@/lib/timeUtils';

import { Briefcase, HeartPulse, Star } from 'lucide-react';

interface TimeInputSectionProps {
  input: string;
  setInput: (input: string) => void;
  errors: { line: number; message: string }[];
  timeEntries: TimeEntry[];
  selectedDate: Date;
  clearInput: () => void;
  specialDayType: 'vacation' | 'sick' | 'holiday' | null;
}

export const TimeInputSection: React.FC<TimeInputSectionProps> = ({
  input,
  setInput,
  errors,
  timeEntries,
  selectedDate,
  clearInput,
  specialDayType,
}) => {
  const handleDeleteEntry = (originalLine: string) => {
    const lines = input.split('\n');
    const newLines = lines.filter(line => line !== originalLine);
    setInput(newLines.join('\n'));
  };
  const specialDayContent = {
    vacation: {
      icon: <Briefcase className="h-8 w-8 text-blue-500" />,
      title: 'Urlaub',
      description: 'Dieser Tag ist als Urlaubstag erfasst.',
    },
    sick: {
      icon: <HeartPulse className="h-8 w-8 text-red-500" />,
      title: 'Krankenstand',
      description: 'Dieser Tag ist als Krankenstand erfasst.',
    },
    holiday: {
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      title: 'Feiertag',
      description: 'Dieser Tag ist ein Feiertag.',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="h-fit hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-2 cursor-help">
                  <Calculator className="h-5 w-5" />
                  Zeitbuchungen
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Füge hier Zeitbuchungen, z.B. aus Webdesk, im Format 08:00 - 16:12 ein oder trage sie manuell ein. Eine Zeitbuchung kann auch offen sein. Eine Buchung pro Zeile.</p>
              </TooltipContent>
            </Tooltip>
            {input && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearInput}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zeitbuchungen für diesen Tag löschen</p>
                </TooltipContent>
              </Tooltip>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div
            key={format(selectedDate, 'yyyy-MM-dd')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Textarea
              placeholder="Noch keine Einträge für diesen Tag. Buchungen im Format HH:mm-HH:mm, 'Urlaub' oder 'Krankenstand' eingeben."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[164px] font-mono text-sm resize-none"
            />
          </motion.div>
          <AnimatePresence>
            {errors.length > 0 && !specialDayType && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {errors.map((error, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 rounded-md bg-destructive/10 border border-destructive/20"
                  >
                    <p className="text-sm text-destructive">
                      Zeile {error.line}: {error.message}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <AnimatePresence>
        {timeEntries.length > 0 && !specialDayType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5" />
                  Erfasste Zeiten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <AnimatePresence>
                    {timeEntries.map((entry, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex justify-between items-center p-3 rounded-md bg-muted/50"
                      >
                        <div>
                          <span className="font-mono text-sm">
                            {entry.start} - {entry.end}
                          </span>
                          {entry.reason && (
                            <p className="text-xs text-muted-foreground">{entry.reason.replace(/\(\d+\)/, '').trim()}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {formatHoursMinutes(entry.duration)}
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEntry(entry.originalLine)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Diesen Eintrag löschen</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
