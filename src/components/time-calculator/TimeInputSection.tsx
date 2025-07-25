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

interface TimeInputSectionProps {
  input: string;
  setInput: (input: string) => void;
  errors: { line: number; message: string }[];
  timeEntries: TimeEntry[];
  selectedDate: Date;
  clearInput: () => void;
}

export const TimeInputSection: React.FC<TimeInputSectionProps> = ({
  input,
  setInput,
  errors,
  timeEntries,
  selectedDate,
  clearInput,
}) => {
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
          <AnimatePresence mode="wait">
            <motion.div
              key={format(selectedDate, 'yyyy-MM-dd')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Textarea
                placeholder="Noch keine Einträge für diesen Tag"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[164px] font-mono text-sm resize-none"
              />
            </motion.div>
          </AnimatePresence>
          <AnimatePresence>
            {errors.length > 0 && (
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
        {timeEntries.length > 0 && (
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
                        <span className="font-mono text-sm">
                          {entry.start} - {entry.end}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatHoursMinutes(entry.duration)}
                        </span>
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
