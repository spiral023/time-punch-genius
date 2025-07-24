import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Calculator, Target, Trash2, Sun, Moon, Coffee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TimeEntry {
  start: string;
  end: string;
  duration: number; // in minutes
}

interface ValidationError {
  line: number;
  message: string;
}

const TimeCalculator = () => {
  const [input, setInput] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('timeCalculatorInput');
    if (saved) {
      setInput(saved);
    }
    
    // Set dark mode by default
    document.documentElement.classList.add('dark');
  }, []);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save to localStorage on input change
  useEffect(() => {
    localStorage.setItem('timeCalculatorInput', input);
  }, [input]);

  const parseTimeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatMinutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const formatHoursMinutes = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const addMinutesToTime = (baseTime: string, minutesToAdd: number): string => {
    const baseMinutes = parseTimeToMinutes(baseTime);
    const newMinutes = baseMinutes + minutesToAdd;
    return formatMinutesToTime(newMinutes);
  };

  const { timeEntries, errors, totalMinutes, totalBreak, breakDeducted, grossTotalMinutes } = useMemo(() => {
    const lines = input.split('\n').filter(line => line.trim());
    const entries: TimeEntry[] = [];
    const validationErrors: ValidationError[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Skip lines like "Homeoffice"
      if (!trimmed.includes('-') && !trimmed.includes(':')) return;

      // Check for open time entry (just start time)
      const openTimePattern = /^(\d{1,2}:\d{2})$/;
      const openMatch = trimmed.match(openTimePattern);
      
      if (openMatch) {
        const [, startTime] = openMatch;
        
        // Validate time format
        const timeValidation = /^([01]?\d|2[0-3]):[0-5]\d$/;
        if (!timeValidation.test(startTime)) {
          validationErrors.push({
            line: index + 1,
            message: 'Ungültige Zeitangabe'
          });
          return;
        }

        const startMinutes = parseTimeToMinutes(startTime);
        const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        
        if (currentMinutes <= startMinutes) {
          validationErrors.push({
            line: index + 1,
            message: 'Startzeit liegt in der Zukunft'
          });
          return;
        }

        const duration = currentMinutes - startMinutes;
        const endTime = formatMinutesToTime(currentMinutes);
        
        entries.push({ start: startTime, end: endTime, duration });
        return;
      }

      // Check for complete time entry (start - end)
      const timePattern = /^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/;
      const match = trimmed.match(timePattern);

      if (!match) {
        validationErrors.push({
          line: index + 1,
          message: 'Ungültiges Format. Verwenden Sie HH:MM - HH:MM oder HH:MM'
        });
        return;
      }

      const [, startTime, endTime] = match;
      
      // Validate time format
      const timeValidation = /^([01]?\d|2[0-3]):[0-5]\d$/;
      if (!timeValidation.test(startTime) || !timeValidation.test(endTime)) {
        validationErrors.push({
          line: index + 1,
          message: 'Ungültige Zeitangabe'
        });
        return;
      }

      const startMinutes = parseTimeToMinutes(startTime);
      const endMinutes = parseTimeToMinutes(endTime);

      if (endMinutes <= startMinutes) {
        validationErrors.push({
          line: index + 1,
          message: 'Endzeit muss nach Startzeit liegen'
        });
        return;
      }

      const duration = endMinutes - startMinutes;
      
      // Check for overlaps with existing entries
      const hasOverlap = entries.some(entry => {
        const entryStart = parseTimeToMinutes(entry.start);
        const entryEnd = parseTimeToMinutes(entry.end);
        return (startMinutes < entryEnd && endMinutes > entryStart);
      });

      if (hasOverlap) {
        validationErrors.push({
          line: index + 1,
          message: 'Zeitraum überlappt mit vorherigem Eintrag'
        });
        return;
      }

      entries.push({ start: startTime, end: endTime, duration });
    });

    // Einträge nach Startzeit sortieren, um die Pausen korrekt zu berechnen
    entries.sort((a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start));

    const grossTotalMinutes = entries.reduce((sum, entry) => sum + entry.duration, 0);
    let total = grossTotalMinutes;
    let totalBreak = 0;

    // Pausen zwischen den Einträgen berechnen
    for (let i = 0; i < entries.length - 1; i++) {
      const currentEntryEnd = parseTimeToMinutes(entries[i].end);
      const nextEntryStart = parseTimeToMinutes(entries[i + 1].start);
      const breakDuration = nextEntryStart - currentEntryEnd;
      if (breakDuration > 0) {
        totalBreak += breakDuration;
      }
    }

    // Abzug der Mittagspause: 30 Minuten nach 6 Stunden Arbeitszeit, wenn nicht schon genug Pause gemacht wurde
    const lunchBreakThreshold = 6 * 60; // 6 Stunden in Minuten
    const requiredBreakDuration = 30; // 30 Minuten
    let breakDeducted = false;

    if (grossTotalMinutes >= lunchBreakThreshold && totalBreak < requiredBreakDuration) {
      total -= requiredBreakDuration;
      breakDeducted = true;
    }
    
    return { timeEntries: entries, errors: validationErrors, totalMinutes: total, totalBreak, breakDeducted, grossTotalMinutes };
  }, [input, currentTime]);

  // Update document title
  useEffect(() => {
    if (totalMinutes > 0) {
      document.title = `${formatMinutesToTime(totalMinutes)} - ZE-Helper`;
    } else {
      document.title = 'ZE-Helper';
    }
  }, [totalMinutes]);

  const calculateTargetTime = (targetMinutes: number): string | null => {
    if (timeEntries.length === 0) return null;
    
    const remainingMinutes = targetMinutes - totalMinutes;
    if (remainingMinutes <= 0) return "Ziel bereits erreicht";
    
    // Find the last entry's end time
    const lastEntry = timeEntries[timeEntries.length - 1];
    return addMinutesToTime(lastEntry.end, remainingMinutes);
  };

  const target6Hours = 6 * 60; // 360 minutes
  const target77Minutes = 7.7 * 60; // 462 minutes
  const target10Hours = 10 * 60; // 600 minutes

  const clearInput = () => {
    setInput('');
    toast({
      title: "Eingaben gelöscht",
      description: "Alle Zeitbuchungen wurden entfernt."
    });
  };

  const progress6h = Math.min((totalMinutes / target6Hours) * 100, 100);
  const progress77 = Math.min((totalMinutes / target77Minutes) * 100, 100);
  const progress10h = Math.min((totalMinutes / target10Hours) * 100, 100);

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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto space-y-6"
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
            <h1 className="text-3xl font-bold text-foreground">ZE-Helper</h1>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-fit hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Zeitbuchungen
                  </span>
                  {input && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearInput}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Zeitbuchungen eingeben:&#10;08:00 - 12:00&#10;12:30 - 16:42&#10;13:15&#10;Homeoffice"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[410px] font-mono text-sm resize-none"
                />
                
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
                  Aktuelle Arbeitszeit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div
                  key={totalMinutes}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className={`text-4xl font-bold ${getTextColorClass(totalMinutes)}`}
                >
                  {formatHoursMinutes(totalMinutes)}
                </motion.div>
                <p className="text-sm text-muted-foreground mt-1">
                  {timeEntries.length} Zeiträume erfasst
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
                {/* 6 Hours Target */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">6 Stunden</span>
                    <span className="text-sm text-muted-foreground">
                      {calculateTargetTime(target6Hours) || '--:--'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Progress value={progress6h} className="h-3 bg-gradient-to-r from-green-200 to-green-300 dark:from-green-800 dark:to-green-700" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{(Math.round(progress6h * 10) / 10)}%</span>
                      <span>{formatHoursMinutes(target6Hours)}</span>
                    </div>
                  </div>
                </div>

                {/* 7.7 Hours Target */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">7,7 Stunden</span>
                    <span className="text-sm text-muted-foreground">
                      {calculateTargetTime(target77Minutes) || '--:--'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Progress value={progress77} className="h-3 bg-gradient-to-r from-yellow-200 to-yellow-300 dark:from-yellow-800 dark:to-yellow-700" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{(Math.round(progress77 * 10) / 10)}%</span>
                      <span>{formatHoursMinutes(target77Minutes)}</span>
                    </div>
                  </div>
                </div>

                {/* 10 Hours Target */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">10 Stunden</span>
                    <span className="text-sm text-muted-foreground">
                      {calculateTargetTime(target10Hours) || '--:--'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Progress value={progress10h} className="h-3 bg-gradient-to-r from-red-200 to-red-300 dark:from-red-800 dark:to-red-700" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{(Math.round(progress10h * 10) / 10)}%</span>
                      <span>{formatHoursMinutes(target10Hours)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="text-center text-sm text-muted-foreground mt-4">
              <a href="http://ze-helper.sp23.online" target="_blank" rel="noopener noreferrer" className="hover:underline">
                ze-helper.sp23.online
              </a>
            </div>
          </motion.div>

          {/* Time & Entries Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            {/* Current Browser Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Aktuelle Zeit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary font-mono">
                  {currentTime.toLocaleTimeString('de-DE', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentTime.toLocaleDateString('de-DE', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </p>
              </CardContent>
            </Card>

            {/* Lunch Break Info */}
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
                    <span className="text-sm">Gemachte Pausen</span>
                    <span className="text-sm font-bold">{formatHoursMinutes(totalBreak)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground pt-2">
                    {(() => {
                      if (breakDeducted) {
                        return "Gesetzliche Pause (30m) wurde von der Arbeitszeit abgezogen.";
                      }
                      if (grossTotalMinutes >= 360) {
                        return "Die Pausenzeit von 30 Minuten wurde erreicht.";
                      }
                      return "Bei über 6h Arbeit sind 30m Pause Pflicht.";
                    })()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Time Entries List */}
            {timeEntries.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Erfasste Zeiten</CardTitle>
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
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default TimeCalculator;
