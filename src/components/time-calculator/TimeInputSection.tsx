import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Calculator, Trash2, ListChecks, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { TimeEntry } from '@/types';
import { formatHoursMinutes } from '@/lib/timeUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

  return (
    <div>
      <Card className="h-fit transition-all duration-300">
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
          <div key={format(selectedDate, 'yyyy-MM-dd')}>
            <Textarea
              placeholder="Noch keine Einträge für diesen Tag. Buchungen im Format HH:mm-HH:mm, 'Urlaub' oder 'Krankenstand' eingeben."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[164px] font-mono text-sm resize-none"
            />
          </div>
          {errors.length > 0 && !specialDayType && (
            <div className="space-y-2">
              {errors.map((error, index) => (
                <Alert variant="destructive" key={index}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Zeile {error.line}: {error.message}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {timeEntries.length > 0 && !specialDayType && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                Erfasste Zeiten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {timeEntries.map((entry, index) => (
                  <div
                    key={index}
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
