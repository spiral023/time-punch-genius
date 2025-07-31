import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Calculator, Trash2, ListChecks, AlertCircle, Plane, HeartPulse, Star, Briefcase, School, Gift, Users, BookOpen, Heart, Flower2 } from 'lucide-react';
import { format } from 'date-fns';
import { SpecialDayType } from '@/types';
import { formatHoursMinutes } from '@/lib/timeUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTimeCalculatorContext } from '../contexts/TimeCalculatorContext';

const SpecialDayDisplay = ({ type }: { type: SpecialDayType }) => {
  const icons: { [key in SpecialDayType]: React.ReactNode } = {
    vacation: <Plane className="h-12 w-12 text-blue-500" />,
    sick: <HeartPulse className="h-12 w-12 text-red-500" />,
    holiday: <Star className="h-12 w-12 text-yellow-500" />,
    care_leave: <Users className="h-12 w-12 text-green-500" />,
    works_council: <Briefcase className="h-12 w-12 text-purple-500" />,
    training: <BookOpen className="h-12 w-12 text-indigo-500" />,
    special_leave: <Gift className="h-12 w-12 text-pink-500" />,
    vocational_school: <School className="h-12 w-12 text-orange-500" />,
    wedding: <Heart className="h-12 w-12 text-rose-500" />,
    bereavement: <Flower2 className="h-12 w-12 text-gray-500" />,
  };

  const descriptions: { [key in SpecialDayType]: string } = {
    vacation: 'Urlaub',
    sick: 'Krankenstand',
    holiday: 'Feiertag',
    care_leave: 'Pflegeurlaub',
    works_council: 'Betriebsratsarbeit',
    training: 'Schulung/Seminar',
    special_leave: 'Sonderurlaub',
    vocational_school: 'Berufsschule',
    wedding: 'Hochzeit',
    bereavement: 'Todesfall',
  };

  return (
    <div className="flex flex-col items-center justify-center h-[164px] bg-muted/50 rounded-md">
      {icons[type]}
      <p className="mt-2 text-lg font-semibold">{descriptions[type]}</p>
      <p className="text-sm text-muted-foreground">Keine Zeitbuchung erforderlich.</p>
    </div>
  );
};

export const TimeInputSection: React.FC = () => {
  const {
    input,
    setInput,
    errors,
    timeEntries,
    selectedDate,
    clearInput,
    specialDayType,
  } = useTimeCalculatorContext();
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
              <TooltipContent className="max-w-md">
                <div className="space-y-2">
                  <p><strong>Zeitbuchungen eingeben:</strong></p>
                  <ul className="text-xs space-y-1">
                    <li>• Format: 08:00 - 16:12 (eine Buchung pro Zeile)</li>
                    <li>• Offene Buchung: 08:00 - (ohne Endzeit)</li>
                    <li>• Mit Grund: 09:00 - 10:00 Homeoffice</li>
                    <li>• Klick auf aktuelle Arbeitszeit für schnelle Buchung</li>
                  </ul>
                  <p><strong>Sonderbuchungen:</strong></p>
                  <ul className="text-xs space-y-1">
                    <li>• Urlaub, Krankenstand, Pflegeurlaub</li>
                    <li>• Hochzeit, Todesfall, Sonderurlaub</li>
                    <li>• Betriebsratsarbeit, Schulung, Berufsschule</li>
                  </ul>
                </div>
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
            {specialDayType ? (
              <SpecialDayDisplay type={specialDayType} />
            ) : (
              <Textarea
                placeholder="Noch keine Einträge für diesen Tag. Buchungen im Format HH:mm-HH:mm, 'Urlaub' oder 'Krankenstand' eingeben."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[164px] font-mono text-sm resize-none"
              />
            )}
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
                        {entry.start} {entry.end && `- ${entry.end}`}
                      </span>
                      {entry.reason && (
                        <p className="text-xs text-muted-foreground">{entry.reason}</p>
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
