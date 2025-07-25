import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar as CalendarIcon, Clock, Calculator, Target, Trash2, Coffee, ListChecks, ChevronLeft, ChevronRight, CalendarDays, BarChart3, Settings, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, startOfYear, endOfYear } from 'date-fns';
import { de } from 'date-fns/locale';
import { formatMinutesToTime, formatHoursMinutes, addMinutesToTime, parseTimeToMinutes, calculateTimeDetails, formatDeltaToTime, calculateAverageDay, calculateOutsideRegularHours } from '@/lib/timeUtils';
import { useTimeCalculator } from '@/hooks/useTimeCalculator';
import { TimeEntry } from '@/types';
import { AverageDayCard } from './AverageDayCard';
import { OutsideRegularHoursCard } from './OutsideRegularHoursCard';
import { TargetTimeProgress } from './TargetTimeProgress';
import { WeeklyHoursChart } from './WeeklyHoursChart';
import { Calendar } from './ui/calendar';
import { Input } from './ui/input';
import { WelcomePopup } from './WelcomePopup';

const formatDateKey = (date: Date): string => `zehelper_data_${format(date, 'yyyy-MM-dd')}`;
const WEEKLY_HOURS_KEY = 'zehelper_weekly_hours';

const TimeCalculator = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [input, setInput] = useState('');
  const [weeklyTargetHours, setWeeklyTargetHours] = useState<number>(38.5);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();

  // Set dark mode and load weekly hours on initial mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
    const savedHours = localStorage.getItem(WEEKLY_HOURS_KEY);
    if (savedHours) {
      setWeeklyTargetHours(parseFloat(savedHours));
    }
  }, []);

  // Load data from localStorage when selectedDate changes
  useEffect(() => {
    const dateKey = formatDateKey(selectedDate);
    const savedInput = localStorage.getItem(dateKey) || '';
    setInput(savedInput);
  }, [selectedDate]);

  // Save weekly target hours to localStorage
  useEffect(() => {
    localStorage.setItem(WEEKLY_HOURS_KEY, weeklyTargetHours.toString());
  }, [weeklyTargetHours]);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save to localStorage on input change for the selected date
  useEffect(() => {
    const dateKey = formatDateKey(selectedDate);
    if (input) {
      localStorage.setItem(dateKey, input);
    } else {
      // If input is empty, remove the key from localStorage
      localStorage.removeItem(dateKey);
    }
  }, [input, selectedDate]);

  const { timeEntries, errors, totalMinutes, totalBreak, breakDeduction, grossTotalMinutes } = useTimeCalculator(input, currentTime);

  const weeklySummary = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    let total = 0;

    days.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');

      if (dayKey === selectedDateKey) {
        if (input) {
          const dayDetails = calculateTimeDetails(input, currentTime);
          total += dayDetails.totalMinutes;
        }
      } else {
        const storageKey = formatDateKey(day);
        const savedInput = localStorage.getItem(storageKey);
        if (savedInput) {
          const dayDetails = calculateTimeDetails(savedInput);
          total += dayDetails.totalMinutes;
        }
      }
    });
    return total;
  }, [selectedDate, input, currentTime]); // Re-calculate when date or input changes

  const weeklyBalance = useMemo(() => {
    const targetMinutes = Math.round(weeklyTargetHours * 60);
    return weeklySummary - targetMinutes;
  }, [weeklySummary, weeklyTargetHours]);

  const monthlySummary = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const days = eachDayOfInterval({ start, end });
    let total = 0;

    days.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');

      if (dayKey === selectedDateKey) {
        if (input) {
          const dayDetails = calculateTimeDetails(input, currentTime);
          total += dayDetails.totalMinutes;
        }
      } else {
        const storageKey = formatDateKey(day);
        const savedInput = localStorage.getItem(storageKey);
        if (savedInput) {
          const dayDetails = calculateTimeDetails(savedInput);
          total += dayDetails.totalMinutes;
        }
      }
    });
    return total;
  }, [selectedDate, input, currentTime]); // Re-calculate when date or input changes

  const weeklyChartData = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    const data = [];

    for (const day of days) {
      const dayKey = format(day, 'yyyy-MM-dd');
      const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
      let dayInput = localStorage.getItem(formatDateKey(day)) || '';

      if (dayKey === selectedDateKey) {
        dayInput = input;
      }
      
      const details = calculateTimeDetails(dayInput, dayKey === format(new Date(), 'yyyy-MM-dd') ? currentTime : undefined);
      data.push({ date: day, totalMinutes: details.totalMinutes });
    }
    return data;
  }, [selectedDate, input, currentTime]);

  // Update document title
  useEffect(() => {
    if (totalMinutes > 0) {
      document.title = `${formatMinutesToTime(totalMinutes)} - ZE-Helper`;
    } else {
      document.title = 'ZE-Helper';
    }
  }, [totalMinutes]);

  const handleClearAllData = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('zehelper_')) {
        localStorage.removeItem(key);
      }
    });
    toast({
      title: 'Alle Daten gelöscht',
      description: 'Die Anwendung wird neu geladen.',
    });
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleExportData = () => {
    const data: { [key: string]: string } = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('zehelper_')) {
        data[key] = localStorage.getItem(key) || '';
      }
    });
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zehelper-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Daten exportiert',
      description: 'Ihre Daten wurden erfolgreich als JSON-Datei heruntergeladen.',
    });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const data = JSON.parse(json);
        
        // Simple validation
        if (typeof data !== 'object' || data === null) {
          throw new Error('Ungültiges Format');
        }

        Object.keys(data).forEach(key => {
          if (key.startsWith('zehelper_')) {
            localStorage.setItem(key, data[key]);
          }
        });

        toast({
          title: 'Daten importiert',
          description: 'Ihre Daten wurden erfolgreich importiert. Die Anwendung wird neu geladen.',
        });

        setTimeout(() => {
          window.location.reload();
        }, 1000);

      } catch (error) {
        toast({
          title: 'Import fehlgeschlagen',
          description: 'Die ausgewählte Datei ist keine gültige Backup-Datei.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  const calculateTargetTime = (targetMinutes: number): string | null => {
    if (timeEntries.length === 0) return null;
    
    const remainingMinutes = targetMinutes - totalMinutes;
    if (remainingMinutes <= 0) return "Ziel bereits erreicht";
    
    // Find the last entry's end time
    const lastEntry = timeEntries[timeEntries.length - 1];
    return addMinutesToTime(lastEntry.end, remainingMinutes);
  };

  const TARGET_6_HOURS_MINUTES = 360;
  const TARGET_7_7_HOURS_MINUTES = 462;
  const TARGET_10_HOURS_MINUTES = 600;

  const clearInput = () => {
    setInput('');
    toast({
      title: "Eingaben für diesen Tag gelöscht",
      description: `Alle Zeitbuchungen für ${format(selectedDate, 'dd.MM.yyyy')} wurden entfernt.`
    });
  };

  const changeDay = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' ? subDays(selectedDate, 1) : addDays(selectedDate, 1);
    setSelectedDate(newDate);
  };

  const progress6h = Math.min((totalMinutes / TARGET_6_HOURS_MINUTES) * 100, 100);
  const progress77 = Math.min((totalMinutes / TARGET_7_7_HOURS_MINUTES) * 100, 100);
  const progress10h = Math.min((totalMinutes / TARGET_10_HOURS_MINUTES) * 100, 100);

  const averageDayData = useMemo(() => {
    const allKeys = Object.keys(localStorage);
    const dateKeys = allKeys.filter(key => key.startsWith('zehelper_data_'));
    const allDaysData = dateKeys.map(key => localStorage.getItem(key) || '');
    return calculateAverageDay(allDaysData);
  }, [input, selectedDate]); // Recalculate when input changes to reflect new data

  const outsideRegularHours = useMemo(() => {
    const calculateTotalOutsideHours = (start: Date, end: Date) => {
      const days = eachDayOfInterval({ start, end });
      let total = 0;

      days.forEach(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
        let dayInput = localStorage.getItem(formatDateKey(day)) || '';

        if (dayKey === selectedDateKey) {
          dayInput = input;
        }

        if (dayInput) {
          const details = calculateTimeDetails(dayInput);
          total += calculateOutsideRegularHours(details.timeEntries, day);
        }
      });
      return total;
    };

    const weeklyStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weeklyEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const monthlyStart = startOfMonth(selectedDate);
    const monthlyEnd = endOfMonth(selectedDate);
    const yearlyStart = startOfYear(selectedDate);
    const yearlyEnd = endOfYear(selectedDate);

    return {
      week: calculateTotalOutsideHours(weeklyStart, weeklyEnd),
      month: calculateTotalOutsideHours(monthlyStart, monthlyEnd),
      year: calculateTotalOutsideHours(yearlyStart, yearlyEnd),
    };
  }, [selectedDate, input]);

  const getCurrentTimeColor = () => {
    const day = currentTime.getDay();
    const hour = currentTime.getHours();

    const isWeekday = day >= 1 && day <= 5;
    const isWorkingHours = hour >= 6 && hour < 19;

    if (isWeekday && isWorkingHours) {
      return 'text-primary';
    }
    
    return 'text-red-500';
  };

  const handlePunch = () => {
    const now = format(currentTime, 'HH:mm');
    const lines = input.trim().split('\n');
    const lastLine = lines[lines.length - 1];

    if (lastLine.match(/^\d{2}:\d{2}\s*-\s*$/)) {
      // Ausstempeln: Letzte Zeile ist offen
      const updatedInput = input.trim().replace(/-\s*$/, `- ${now}`);
      setInput(updatedInput);
      toast({ title: 'Ausgestempelt', description: `Zeitbuchung bis ${now} Uhr vervollständigt.` });
    } else {
      // Einstempeln: Neue Zeile beginnen
      const newEntry = `${now} - `;
      const updatedInput = input ? `${input.trim()}\n${newEntry}` : newEntry;
      setInput(updatedInput);
      toast({ title: 'Eingestempelt', description: `Zeitbuchung um ${now} Uhr gestartet.` });
    }
  };

  const getTextColorClass = (minutes: number): string => {
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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <WelcomePopup />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex justify-center items-center mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <Clock className="h-8 w-8 text-primary" />
            <Tooltip>
              <TooltipTrigger asChild>
                <h1 
                  className="text-3xl font-bold text-foreground cursor-pointer"
                  onClick={() => setSelectedDate(new Date())}
                >
                  ZE-Helper
                </h1>
              </TooltipTrigger>
              <TooltipContent>
                <p>Klick mich um zum aktuellen Tag zu wechseln</p>
              </TooltipContent>
            </Tooltip>
          </motion.div>
        </div>

        {/* Date Navigation */}
        <motion.div
          key={format(selectedDate, 'yyyy-MM-dd')}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center items-center gap-4 mb-6"
        >
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
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
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

            {/* Time Entries List */}
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

            {/* Lunch Break Info */}
            <motion.div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coffee className="h-5 w-5" />
                    Pauseninfo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Konsumierte Pausen</span>
                      <span className="text-sm font-bold">{formatHoursMinutes(totalBreak)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground pt-2">
                      {(() => {
                        if (breakDeduction > 0) {
                          return <span className="text-destructive">{`Gesetzliche Pause (${breakDeduction}m) wurde von der Arbeitszeit abgezogen.`}</span>;
                        }
                        if (grossTotalMinutes >= 360 && totalBreak >= 30) {
                          return "Die Pausenzeit von 30 Minuten wurde erreicht.";
                        }
                        if (grossTotalMinutes >= 360 && totalBreak < 30) {
                          return `Restliche ${30 - totalBreak}m Pause werden noch abgezogen.`;
                        }
                        return "Bei über 6h Arbeit sind 30m Pause Pflicht.";
                      })()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Current Work Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Arbeitszeit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      key={totalMinutes}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className={`text-4xl font-bold ${getTextColorClass(totalMinutes)} cursor-pointer`}
                      onClick={handlePunch}
                    >
                      {formatHoursMinutes(totalMinutes)}
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Klicken zum Ein- oder Ausstempeln</p>
                  </TooltipContent>
                </Tooltip>
                <div className="text-sm text-muted-foreground mt-2">
                  Delta:
                  <span className={`font-bold ${totalMinutes - TARGET_7_7_HOURS_MINUTES >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatDeltaToTime(totalMinutes - TARGET_7_7_HOURS_MINUTES)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {timeEntries.length > 0
                    ? `${timeEntries.length} ${timeEntries.length === 1 ? 'Zeitraum' : 'Zeiträume'} erfasst`
                    : "Keine Einträge"
                  }
                </p>
              </CardContent>
            </Card>

            {/* Target Times */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Zielzeiten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <TargetTimeProgress
                  label="6 Stunden"
                  targetTime={calculateTargetTime(TARGET_6_HOURS_MINUTES)}
                  progressValue={progress6h}
                  targetMinutes={TARGET_6_HOURS_MINUTES}
                  progressClassName="bg-gradient-to-r from-green-200 to-green-300 dark:from-green-800 dark:to-green-700"
                />
                <TargetTimeProgress
                  label="7,7 Stunden"
                  targetTime={calculateTargetTime(TARGET_7_7_HOURS_MINUTES)}
                  progressValue={progress77}
                  targetMinutes={TARGET_7_7_HOURS_MINUTES}
                  progressClassName="bg-gradient-to-r from-yellow-200 to-yellow-300 dark:from-yellow-800 dark:to-yellow-700"
                />
                <TargetTimeProgress
                  label="10 Stunden"
                  targetTime={calculateTargetTime(TARGET_10_HOURS_MINUTES)}
                  progressValue={progress10h}
                  targetMinutes={TARGET_10_HOURS_MINUTES}
                  progressClassName="bg-gradient-to-r from-red-200 to-red-300 dark:from-red-800 dark:to-red-700"
                />
              </CardContent>
            </Card>

            <OutsideRegularHoursCard
              outsideHoursWeek={formatHoursMinutes(outsideRegularHours.week)}
              outsideHoursMonth={formatHoursMinutes(outsideRegularHours.month)}
              outsideHoursYear={formatHoursMinutes(outsideRegularHours.year)}
            />

            {/* Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Einstellungen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button variant="outline" asChild>
                    <label htmlFor="import-file">
                      <Upload className="mr-2 h-4 w-4" />
                      Import
                      <input type="file" id="import-file" accept=".json" className="hidden" onChange={handleImportData} />
                    </label>
                  </Button>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      Alle Daten löschen
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Sind Sie absolut sicher?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Diese Aktion kann nicht rückgängig gemacht werden. Dadurch werden alle Ihre gespeicherten Zeitbuchungen und Einstellungen dauerhaft von diesem Gerät gelöscht.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearAllData}>
                        Fortfahren
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </motion.div>

          {/* Time & Entries Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            {/* Current Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Aktuelle Uhrzeit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getCurrentTimeColor()}`}>
                  {format(currentTime, 'HH:mm:ss')}
                </div>
              </CardContent>
            </Card>

            {/* Average Day Card */}
            {averageDayData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <AverageDayCard
                  avgStart={averageDayData.avgStart}
                  avgEnd={averageDayData.avgEnd}
                  avgBreak={averageDayData.avgBreak}
                />
              </motion.div>
            )}

            {/* Chart */}
            <WeeklyHoursChart data={weeklyChartData} />

            {/* Summaries */}
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
              </CardContent>
            </Card>

          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default TimeCalculator;
