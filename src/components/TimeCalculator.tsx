import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, Coffee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfYear, endOfYear, startOfMonth, endOfMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import { formatMinutesToTime, formatHoursMinutes, calculateTimeDetails, calculateAverageDay, calculateOutsideRegularHours } from '@/lib/timeUtils';
import { useTimeCalculator } from '@/hooks/useTimeCalculator';
import { useDataManagement } from '@/hooks/useDataManagement';
import { useSummary } from '@/hooks/useSummary';
import { useStatistics } from '@/hooks/useStatistics';
import { useYearData } from '@/hooks/useYearData';
import { AverageDayCard } from './AverageDayCard';
import { OutsideRegularHoursCard } from './OutsideRegularHoursCard';
import { StatisticsCard } from './time-calculator/StatisticsCard';
import { AverageWorkdayHoursChart } from './AverageWorkdayHoursChart';
import { WeeklyHoursChart } from './WeeklyHoursChart';
import { WelcomePopup } from './WelcomePopup';
import { DateNavigator } from './time-calculator/DateNavigator';
import { TimeInputSection } from './time-calculator/TimeInputSection';
import { ResultsSection } from './time-calculator/ResultsSection';
import { SummarySection } from './time-calculator/SummarySection';
import { DataManagement } from './time-calculator/DataManagement';
import { NotesCard } from './NotesCard';
import { TipsCard } from './TipsCard';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const formatDateKey = (date: Date): string => `zehelper_data_${format(date, 'yyyy-MM-dd')}`;
const formatNotesKey = (date: Date): string => `zehelper_notes_${format(date, 'yyyy-MM-dd')}`;
const WEEKLY_HOURS_KEY = 'zehelper_weekly_hours';

const TimeCalculator = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [input, setInput] = useState('');
  const [notes, setNotes] = useState('');
  const [weeklyTargetHours, setWeeklyTargetHours] = useState<number>(38.5);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();
  const { yearData, updateYearData } = useYearData(selectedDate);
  const { handleExportData, handleImportData, handleClearAllData } = useDataManagement();
  const { weeklySummary, monthlySummary, yearlySummary } = useSummary(selectedDate, yearData);
  const statistics = useStatistics(yearData);

  const handleWebdeskImport = (text: string) => {
    const lines = text.split('\n');
    const dateRegex = /(\d{2})\.(\d{2})\.(\d{4})/;
    const timeRegex = /\d{2}:\d{2}\s*-\s*\d{2}:\d{2}/;
    let currentDate: Date | null = null;
    const entries: { [key: string]: string[] } = {};

    for (const line of lines) {
      const dateMatch = line.match(dateRegex);
      if (dateMatch) {
        const [, day, month, year] = dateMatch;
        currentDate = new Date(`${year}-${month}-${day}`);
        const dateKey = formatDateKey(currentDate);
        if (!entries[dateKey]) {
          entries[dateKey] = [];
        }
      }

      if (currentDate) {
        const timeMatch = line.match(timeRegex);
        if (timeMatch) {
          const dateKey = formatDateKey(currentDate);
          entries[dateKey].push(timeMatch[0]);
        }
      }
    }

    Object.keys(entries).forEach(dateKey => {
      if (entries[dateKey].length > 0) {
        localStorage.setItem(dateKey, entries[dateKey].join('\n'));
      } else {
        // If a date was found but no entries, we clear it
        localStorage.removeItem(dateKey);
      }
    });

    // Refresh the input for the currently selected date if it was part of the import
    const selectedDateKey = formatDateKey(selectedDate);
    if (entries[selectedDateKey]) {
      setInput(entries[selectedDateKey].join('\n'));
    } else if (Object.keys(entries).length > 0 && !entries[selectedDateKey]) {
      // If the selected date was not in the import, but other dates were,
      // we might need to clear its input if it was previously showing something.
      // Or just leave it as is. For now, we'll just reload it from localStorage.
      const savedInput = localStorage.getItem(selectedDateKey) || '';
      setInput(savedInput);
    }


    toast({
      title: "Webdesk Import erfolgreich",
      description: `${Object.keys(entries).length} Tage wurden importiert/aktualisiert.`,
    });
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
    const savedHours = localStorage.getItem(WEEKLY_HOURS_KEY);
    if (savedHours) {
      setWeeklyTargetHours(parseFloat(savedHours));
    }
  }, []);

  useEffect(() => {
    const dateKey = formatDateKey(selectedDate);
    const notesKey = formatNotesKey(selectedDate);
    const savedInput = localStorage.getItem(dateKey) || '';
    const savedNotes = localStorage.getItem(notesKey) || '';
    setInput(savedInput);
    setNotes(savedNotes);
  }, [selectedDate]);

  useEffect(() => {
    localStorage.setItem(WEEKLY_HOURS_KEY, weeklyTargetHours.toString());
  }, [weeklyTargetHours]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const dateKey = formatDateKey(selectedDate);
    if (input) {
      localStorage.setItem(dateKey, input);
    } else {
      localStorage.removeItem(dateKey);
    }
    updateYearData(selectedDate, input);
  }, [input, selectedDate, updateYearData]);

  useEffect(() => {
    const notesKey = formatNotesKey(selectedDate);
    if (notes) {
      localStorage.setItem(notesKey, notes);
    } else {
      localStorage.removeItem(notesKey);
    }
  }, [notes, selectedDate]);

  const { timeEntries, errors, totalMinutes, totalBreak, breakDeduction, grossTotalMinutes } = useTimeCalculator(input, currentTime);

  const weeklyBalance = useMemo(() => {
    const targetMinutes = Math.round(weeklyTargetHours * 60);
    return weeklySummary - targetMinutes;
  }, [weeklySummary, weeklyTargetHours]);

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

  useEffect(() => {
    if (totalMinutes > 0) {
      document.title = `${formatMinutesToTime(totalMinutes)} - ZE-Helper`;
    } else {
      document.title = 'ZE-Helper';
    }
  }, [totalMinutes]);

  const clearInput = () => {
    setInput('');
    toast({
      title: "Eingaben für diesen Tag gelöscht",
      description: `Alle Zeitbuchungen für ${format(selectedDate, 'dd.MM.yyyy')} wurden entfernt.`
    });
  };

  const averageDayData = useMemo(() => {
    return calculateAverageDay(Object.values(yearData), currentTime, format(selectedDate, 'yyyy-MM-dd'));
  }, [yearData, currentTime, selectedDate]);

  const outsideRegularHours = useMemo(() => {
    const calculateTotalOutsideHours = (start: Date, end: Date) => {
      const days = eachDayOfInterval({ start, end });
      let total = 0;

      days.forEach(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const dayInput = yearData[dayKey];

        if (dayInput) {
          const details = calculateTimeDetails(dayInput);
          total += calculateOutsideRegularHours(details.timeEntries, day);
        }
      });
      return total;
    };

    const yearlyStart = startOfYear(selectedDate);
    const yearlyEnd = endOfYear(selectedDate);
    
    let daysWithOutsideHours = 0;
    const yearDays = eachDayOfInterval({ start: yearlyStart, end: yearlyEnd });
    yearDays.forEach(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const dayInput = yearData[dayKey];
        if (dayInput) {
            const details = calculateTimeDetails(dayInput);
            const outsideMinutes = calculateOutsideRegularHours(details.timeEntries, day);
            if (outsideMinutes > 0) {
                daysWithOutsideHours++;
            }
        }
    });

    const totalDaysWithEntries = Object.values(yearData).filter(d => d && d.trim() !== '').length;

    const weeklyStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weeklyEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const monthlyStart = startOfMonth(selectedDate);
    const monthlyEnd = endOfMonth(selectedDate);

    return {
      week: calculateTotalOutsideHours(weeklyStart, weeklyEnd),
      month: calculateTotalOutsideHours(monthlyStart, monthlyEnd),
      year: calculateTotalOutsideHours(yearlyStart, yearlyEnd),
      daysWithOutsideHours: daysWithOutsideHours,
      totalDaysWithEntries: totalDaysWithEntries,
    };
  }, [selectedDate, yearData]);

  const getCurrentTimeColor = () => {
    const day = currentTime.getDay();
    const hour = currentTime.getHours();
    const isWeekday = day >= 1 && day <= 5;
    const isWorkingHours = hour >= 6 && hour < 19;
    return isWeekday && isWorkingHours ? 'text-primary' : 'text-red-500';
  };

  const handlePunch = () => {
    const now = format(currentTime, 'HH:mm');
    const lines = input.trim().split('\n');
    const lastLine = lines[lines.length - 1];

    if (lastLine.match(/^\d{2}:\d{2}\s*-\s*$/)) {
      const updatedInput = input.trim().replace(/-\s*$/, `- ${now}`);
      setInput(updatedInput);
      toast({ title: 'Ausgestempelt', description: `Zeitbuchung bis ${now} Uhr vervollständigt.` });
    } else {
      const newEntry = `${now} - `;
      const updatedInput = input ? `${input.trim()}\n${newEntry}` : newEntry;
      setInput(updatedInput);
      toast({ title: 'Eingestempelt', description: `Zeitbuchung um ${now} Uhr gestartet.` });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <WelcomePopup />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-6"
      >
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

        <DateNavigator selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div>
            <TimeInputSection
              input={input}
              setInput={setInput}
              errors={errors}
              timeEntries={timeEntries}
              selectedDate={selectedDate}
              clearInput={clearInput}
            />
            <motion.div className="mt-6">
              <NotesCard notes={notes} setNotes={setNotes} />
            </motion.div>
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
                          return <span className="text-green-500">Die Pausenzeit von 30 Minuten wurde erreicht.</span>;
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
            <motion.div className="mt-6">
              <DataManagement
                handleExportData={handleExportData}
                handleImportData={handleImportData}
                handleClearAllData={handleClearAllData}
                handleWebdeskImport={handleWebdeskImport}
              />
            </motion.div>
          </div>

          <div className="space-y-6">
            <ResultsSection
              totalMinutes={totalMinutes}
              timeEntries={timeEntries}
              handlePunch={handlePunch}
            />
            <OutsideRegularHoursCard
              selectedDate={selectedDate}
              outsideHoursWeek={formatHoursMinutes(outsideRegularHours.week)}
              outsideHoursMonth={formatHoursMinutes(outsideRegularHours.month)}
              outsideHoursYear={formatHoursMinutes(outsideRegularHours.year)}
              daysWithOutsideHours={outsideRegularHours.daysWithOutsideHours}
              totalDaysWithEntries={outsideRegularHours.totalDaysWithEntries}
            />
          </div>

          <div className="space-y-6">
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
                  avgHours={averageDayData.avgHours}
                />
              </motion.div>
            )}

            <WeeklyHoursChart data={weeklyChartData} />

            <SummarySection
              weeklySummary={weeklySummary}
              monthlySummary={monthlySummary}
              yearlySummary={yearlySummary}
              weeklyBalance={weeklyBalance}
              weeklyTargetHours={weeklyTargetHours}
              setWeeklyTargetHours={setWeeklyTargetHours}
              selectedDate={selectedDate}
            />
          </div>
          <div className="space-y-6">
            <TipsCard />
            <StatisticsCard {...statistics} averageBlocksPerDay={statistics.averageBlocksPerDay} />
            <AverageWorkdayHoursChart data={statistics.averageDailyMinutes} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TimeCalculator;
