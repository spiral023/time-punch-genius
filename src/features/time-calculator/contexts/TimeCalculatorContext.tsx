import React, { createContext, useContext, ReactNode, useState, useMemo, useEffect, useRef } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfYear, endOfYear, startOfMonth, endOfMonth, getYear } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { calculateTimeDetails, formatMinutesToTime, calculateAverageDay, calculateOutsideRegularHours, formatHoursMinutes } from '@/lib/timeUtils';
import { useTimeCalculator } from '../hooks/useTimeCalculator';
import { isHoliday } from '@/lib/holidays';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useDataManagement } from '../hooks/useDataManagement';
import { useHomeOfficeStats } from '../hooks/useHomeOfficeStats';
import { useDailyEntry } from '../hooks/useDailyEntry';
import { useSummary } from '../hooks/useSummary';
import { useStatistics } from '../hooks/useStatistics';
import { useYearData } from '../hooks/useYearData';
import { DataManagementHandles } from '../components/DataManagement';
import { Holiday, TimeEntry, YearData, ValidationError, BreakCompliance } from '@/types';
import { useHolidays } from '../hooks/useHolidays';


interface TimeCalculatorContextType {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  weeklyTargetHours: number;
  setWeeklyTargetHours: (hours: number) => void;
  currentTime: Date;
  holidays: Holiday[];
  yearData: YearData;
  input: string;
  setInput: (input: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  dailyTargetMinutes: number;
  handleExportData: () => void;
  handleImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClearAllData: () => void;
  handleWebdeskImport: (files: File[]) => Promise<void>;
  weeklySummary: number;
  monthlySummary: number;
  yearlySummary: number;
  totalSummary: number;
  statistics: ReturnType<typeof useStatistics>;
  homeOfficeStats: ReturnType<typeof useHomeOfficeStats>;
  dataManagementRef: React.RefObject<DataManagementHandles>;
  triggerImport: () => void;
  triggerWebdeskImport: () => void;
  timeEntries: TimeEntry[];
  errors: ValidationError[];
  totalMinutes: number;
  totalBreak: number;
  breakDeduction: number;
  grossTotalMinutes: number;
  breakCompliance: BreakCompliance;
  specialDayType: "vacation" | "sick" | "holiday" | null;
  weeklyBalance: number;
  weeklyChartData: { date: Date; totalMinutes: number }[];
  clearInput: () => void;
  averageDayData: { avgStart: string; avgEnd: string; avgBreak: number; avgHours: string; };
  outsideRegularHours: { week: number; month: number; year: number; daysWithOutsideHours: number; totalDaysWithEntries: number; };
  getCurrentTimeColor: () => string;
  handlePunch: () => void;
}

const TimeCalculatorContext = createContext<TimeCalculatorContextType | undefined>(undefined);

export const TimeCalculatorProvider = ({ children }: { children: ReactNode }) => {
  const { cardVisibility, weeklyTargetHours, setWeeklyTargetHours } = useAppSettings();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastFullMinute, setLastFullMinute] = useState(new Date());
  const { data: holidays = [] } = useHolidays(getYear(selectedDate));
  const { toast } = useToast();
  const dataManagementRef = useRef<DataManagementHandles>(null);
  const { yearData, updateYearData } = useYearData(selectedDate);
  const { input, setInput, notes, setNotes } = useDailyEntry(selectedDate, updateYearData);
  const dailyTargetMinutes = useMemo(() => (weeklyTargetHours / 5) * 60, [weeklyTargetHours]);
  const { handleExportData, handleImportData, handleClearAllData, handleWebdeskImport } = useDataManagement();
  const { weeklySummary, monthlySummary, yearlySummary, totalSummary } = useSummary(selectedDate, yearData, dailyTargetMinutes, input, currentTime);
  const statistics = useStatistics(yearData, dailyTargetMinutes, input, currentTime, selectedDate);
  const homeOfficeStats = useHomeOfficeStats(yearData, holidays, getYear(selectedDate));

  const triggerImport = () => dataManagementRef.current?.triggerImport();
  const triggerWebdeskImport = () => dataManagementRef.current?.triggerWebdeskImport();

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const text = event.clipboardData?.getData('text');
      if (text) {
        const activeElement = document.activeElement;
        const isInputFocused = activeElement && (
          activeElement.tagName === 'INPUT' || 
          activeElement.tagName === 'TEXTAREA' || 
          (activeElement as HTMLElement).isContentEditable
        );

        if (isInputFocused) {
          return;
        }
        
        event.preventDefault();
        setInput(prevInput => {
          const newText = text.trim();
          if (!prevInput) return newText;
          return `${prevInput}\n${newText}`;
        });
        toast({
          title: "Zeiten eingefügt",
          description: "Die kopierten Zeitbuchungen wurden übernommen."
        });
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [setInput, toast]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let animationFrame: number;

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      
      // Robustere Logik: Aktualisiere lastFullMinute wenn Sekunden 0 sind
      // ODER wenn mehr als 65 Sekunden seit der letzten Aktualisierung vergangen sind
      if (now.getSeconds() === 0) {
        setLastFullMinute(now);
      }
    };

    const startTimer = () => {
      // Verwende requestAnimationFrame für bessere Performance bei aktiven Tabs
      const tick = () => {
        updateTime();
        if (!document.hidden) {
          animationFrame = requestAnimationFrame(tick);
        }
      };
      
      // Fallback mit setInterval für inaktive Tabs
      interval = setInterval(updateTime, 1000);
      
      // Starte auch requestAnimationFrame für aktive Tabs
      if (!document.hidden) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab wurde wieder aktiv - sofortige Aktualisierung
        const now = new Date();
        setCurrentTime(now);
        setLastFullMinute(prev => {
          // Aktualisiere lastFullMinute wenn mehr als 65 Sekunden vergangen sind
          const timeDiff = now.getTime() - prev.getTime();
          if (timeDiff > 65000) { // Mehr als 65 Sekunden
            return now;
          }
          return prev;
        });
        
        // Starte requestAnimationFrame für aktive Tabs
        animationFrame = requestAnimationFrame(() => {
          const tick = () => {
            updateTime();
            if (!document.hidden) {
              animationFrame = requestAnimationFrame(tick);
            }
          };
          tick();
        });
      } else {
        // Tab wurde inaktiv - stoppe requestAnimationFrame
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      }
    };

    // Event Listener für Page Visibility API
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Starte Timer
    startTimer();

    return () => {
      clearInterval(interval);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const calculationTime = useMemo(() => {
    const newDate = new Date(selectedDate);
    newDate.setHours(lastFullMinute.getHours(), lastFullMinute.getMinutes(), lastFullMinute.getSeconds());
    return newDate;
  }, [selectedDate, lastFullMinute]);

  const { timeEntries, errors, totalMinutes, totalBreak, breakDeduction, grossTotalMinutes, specialDayType, breakCompliance } = useTimeCalculator(input, calculationTime, dailyTargetMinutes);

  const weeklyBalance = useMemo(() => {
    const targetMinutes = Math.round(weeklyTargetHours * 60);
    return weeklySummary - targetMinutes;
  }, [weeklySummary, weeklyTargetHours]);

  const weeklyChartData = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    const data = [];
    const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
    const todayKey = format(new Date(), 'yyyy-MM-dd');

    for (const day of days) {
      const dayKey = format(day, 'yyyy-MM-dd');
      let dayInput = localStorage.getItem(`zehelper_data_${dayKey}`) || '';

      // Verwende Live-Daten für den aktuell ausgewählten Tag
      if (dayKey === selectedDateKey) {
        dayInput = input;
      }
      
      // Verwende currentTime für Live-Berechnungen am heutigen Tag
      const useCurrentTime = dayKey === selectedDateKey && dayKey === todayKey;
      const details = calculateTimeDetails(
        dayInput, 
        useCurrentTime ? currentTime : undefined, 
        dailyTargetMinutes, 
        false
      );
      data.push({ date: day, totalMinutes: details.totalMinutes });
    }
    return data;
  }, [selectedDate, input, currentTime, dailyTargetMinutes]);

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
    return calculateAverageDay(Object.values(yearData), calculationTime, dailyTargetMinutes);
  }, [yearData, calculationTime, dailyTargetMinutes]);

  const outsideRegularHours = useMemo(() => {
    const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
    const todayKey = format(new Date(), 'yyyy-MM-dd');
    
    const calculateTotalOutsideHours = (start: Date, end: Date) => {
      const days = eachDayOfInterval({ start, end });
      let total = 0;
      days.forEach(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        let dayInput = yearData[dayKey];
        
        // Verwende Live-Daten für den aktuell ausgewählten Tag
        if (dayKey === selectedDateKey) {
          dayInput = input;
        }
        
        if (dayInput) {
          // Verwende currentTime für Live-Berechnungen am heutigen Tag
          const useCurrentTime = dayKey === selectedDateKey && dayKey === todayKey;
          const details = calculateTimeDetails(
            dayInput, 
            useCurrentTime ? currentTime : undefined, 
            dailyTargetMinutes, 
            false
          );
          total += calculateOutsideRegularHours(details.timeEntries, day, false);
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
        let dayInput = yearData[dayKey];
        
        // Verwende Live-Daten für den aktuell ausgewählten Tag
        if (dayKey === selectedDateKey) {
          dayInput = input;
        }
        
        if (dayInput) {
            // Verwende currentTime für Live-Berechnungen am heutigen Tag
            const useCurrentTime = dayKey === selectedDateKey && dayKey === todayKey;
            const details = calculateTimeDetails(
              dayInput, 
              useCurrentTime ? currentTime : undefined, 
              dailyTargetMinutes, 
              false
            );
            const outsideMinutes = calculateOutsideRegularHours(details.timeEntries, day, false);
            if (outsideMinutes > 0) {
                daysWithOutsideHours++;
            }
        }
    });

    // Berücksichtige auch Live-Input für totalDaysWithEntries
    const totalDaysWithEntries = Object.keys(yearData).filter(dayKey => {
      if (dayKey === selectedDateKey) {
        return input && input.trim() !== '';
      }
      return yearData[dayKey] && yearData[dayKey].trim() !== '';
    }).length;

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
  }, [selectedDate, yearData, dailyTargetMinutes, holidays, input, currentTime]);

  const getCurrentTimeColor = () => {
    if (isHoliday(selectedDate, holidays)) return 'text-yellow-500';
    const day = currentTime.getDay();
    const hour = currentTime.getHours();
    const isWeekday = day >= 1 && day <= 5;
    const isWorkingHours = hour >= 6 && hour < 19;
    return isWeekday && isWorkingHours ? 'text-primary' : 'text-red-500';
  };

  const handlePunch = () => {
    // Prüfe, ob das ausgewählte Datum heute ist
    const today = new Date();
    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
    
    if (!isToday) {
      toast({ 
        title: 'Zeitbuchung nicht möglich', 
        description: 'Zeitbuchungen können nur für den heutigen Tag hinzugefügt werden.',
        variant: 'destructive'
      });
      return;
    }

    const now = format(currentTime, 'HH:mm');
    const lines = input.trim().split('\n').filter(line => line.trim() !== '');
    const lastLine = lines.length > 0 ? lines[lines.length - 1].trim() : '';

    // Case 1: Punching out an open entry (e.g., "08:00 - ")
    if (lastLine.match(/^\d{1,2}:\d{2}\s*-\s*$/)) {
      lines[lines.length - 1] = lastLine.replace(/-\s*$/, `- ${now}`);
      setInput(lines.join('\n'));
      toast({ title: 'Ausgestempelt', description: `Zeitbuchung bis ${now} Uhr vervollständigt.` });
    // Case 2: Punching in from a specific time (e.g., "18:00")
    } else if (lastLine.match(/^\d{1,2}:\d{2}$/)) {
      lines[lines.length - 1] = `${lastLine} - ${now}`;
      setInput(lines.join('\n'));
      toast({ title: 'Zeitbuchung erstellt', description: `Buchung von ${lastLine} bis ${now} Uhr erstellt.` });
    } else {
      // Case 3: Punching in with current time (new entry)
      const newEntry = `${now} - `;
      const updatedInput = input ? `${input.trim()}\n${newEntry}` : newEntry;
      setInput(updatedInput);
      toast({ title: 'Eingestempelt', description: `Zeitbuchung um ${now} Uhr gestartet.` });
    }
  };

  const value: TimeCalculatorContextType = {
    selectedDate,
    setSelectedDate,
    weeklyTargetHours,
    setWeeklyTargetHours,
    currentTime,
    holidays,
    yearData,
    input,
    setInput,
    notes,
    setNotes,
    dailyTargetMinutes,
    handleExportData,
    handleImportData,
    handleClearAllData,
    handleWebdeskImport,
    weeklySummary,
    monthlySummary,
    yearlySummary,
    totalSummary,
    statistics,
    homeOfficeStats,
    dataManagementRef,
    triggerImport,
    triggerWebdeskImport,
    timeEntries,
    errors,
    totalMinutes,
    totalBreak,
    breakDeduction,
    grossTotalMinutes,
    breakCompliance,
    specialDayType,
    weeklyBalance,
    weeklyChartData,
    clearInput,
    averageDayData,
    outsideRegularHours,
    getCurrentTimeColor,
    handlePunch,
  };

  return (
    <TimeCalculatorContext.Provider value={value}>
      {children}
    </TimeCalculatorContext.Provider>
  );
};

export const useTimeCalculatorContext = () => {
  const context = useContext(TimeCalculatorContext);
  if (context === undefined) {
    throw new Error('useTimeCalculatorContext must be used within a TimeCalculatorProvider');
  }
  return context;
};
