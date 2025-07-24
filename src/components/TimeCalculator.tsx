import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Calculator, Target, Trash2, Coffee, ListChecks } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatMinutesToTime, formatHoursMinutes, addMinutesToTime } from '@/lib/timeUtils';
import { useTimeCalculator } from '@/hooks/useTimeCalculator';
import { TimeEntry } from '@/types';
import { TargetTimeProgress } from './TargetTimeProgress';

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


  const { timeEntries, errors, totalMinutes, totalBreak, breakDeducted, grossTotalMinutes } = useTimeCalculator(input, currentTime);

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

  const TARGET_6_HOURS_MINUTES = 360;
  const TARGET_7_7_HOURS_MINUTES = 462;
  const TARGET_10_HOURS_MINUTES = 600;

  const clearInput = () => {
    setInput('');
    toast({
      title: "Eingaben gelöscht",
      description: "Alle Zeitbuchungen wurden entfernt."
    });
  };

  const progress6h = Math.min((totalMinutes / TARGET_6_HOURS_MINUTES) * 100, 100);
  const progress77 = Math.min((totalMinutes / TARGET_7_7_HOURS_MINUTES) * 100, 100);
  const progress10h = Math.min((totalMinutes / TARGET_10_HOURS_MINUTES) * 100, 100);

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
            <h1 className="text-3xl font-bold text-foreground">
              <a href="http://ze-helper.sp23.online/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                ZE-Helper
              </a>
            </h1>
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
              <CardHeader>
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
                  {timeEntries.length} {timeEntries.length === 1 ? 'Zeitraum' : 'Zeiträume'} erfasst
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
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default TimeCalculator;
