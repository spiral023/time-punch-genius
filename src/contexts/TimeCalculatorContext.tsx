import React, { createContext, useContext, ReactNode, useState, useMemo, useEffect, useRef } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfYear, endOfYear, startOfMonth, endOfMonth, getYear } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { calculateTimeDetails, formatMinutesToTime, calculateAverageDay, calculateOutsideRegularHours, formatHoursMinutes } from '@/lib/timeUtils';
import { useTimeCalculator } from '@/hooks/useTimeCalculator';
import { isHoliday } from '@/lib/holidays';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useDataManagement } from '@/hooks/useDataManagement';
import { useHomeOfficeStats } from '@/hooks/useHomeOfficeStats';
import { usePersistentState } from '@/hooks/usePersistentState';
import { useDailyEntry } from '@/hooks/useDailyEntry';
import { useSummary } from '@/hooks/useSummary';
import { useStatistics } from '@/hooks/useStatistics';
import { useYearData } from '@/hooks/useYearData';
import { DataManagementHandles } from '@/components/time-calculator/DataManagement';
import { Holiday, TimeEntry, YearData, ValidationError } from '@/types';
import { useHolidays } from '@/hooks/useHolidays';
import { useTimeEntries } from '@/hooks/useTimeEntries';

const WEEKLY_HOURS_KEY = 'zehelper_weekly_hours';

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
  const { cardVisibility } = useAppSettings();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weeklyTargetHours, setWeeklyTargetHours] = usePersistentState<number>(WEEKLY_HOURS_KEY, 38.5);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastFullMinute, setLastFullMinute] = useState(new Date());
  const { data: holidays = [] } = useHolidays(getYear(selectedDate));
  const { data: timeEntries = [], updateEntries } = useTimeEntries(selectedDate);
  const { toast } = useToast();
  const dataManagementRef = useRef<DataManagementHandles>(null);
  const { yearData, updateYearData } = useYearData(selectedDate);
  const { input, setInput, notes, setNotes } = useDailyEntry(selectedDate, updateYearData);
  const dailyTargetMinutes = useMemo(() => (weeklyTargetHours / 5) * 60, [weeklyTargetHours]);
  const { handleExportData, handleImportData, handleClearAllData, handleWebdeskImport } = useDataManagement();
  const { weeklySummary, monthlySummary, yearlySummary, totalSummary } = useSummary(selectedDate, yearData, dailyTargetMinutes);
  const statistics = useStatistics(yearData, dailyTargetMinutes);
  const homeOfficeStats = useHomeOfficeStats(yearData, holidays);

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
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      if (now.getSeconds() === 0) {
        setLastFullMinute(now);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const calculationTime = useMemo(() => {
    const newDate = new Date(selectedDate);
    newDate.setHours(lastFullMinute.getHours(), lastFullMinute.getMinutes(), lastFullMinute.getSeconds());
    return newDate;
  }, [selectedDate, lastFullMinute]);

  const { errors, totalMinutes, totalBreak, breakDeduction, grossTotalMinutes, specialDayType } = useTimeCalculator(input, calculationTime, dailyTargetMinutes);

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
      let dayInput = localStorage.getItem(`zehelper_data_${dayKey}`) || '';

      if (dayKey === selectedDateKey) {
        dayInput = input;
      }
      
      const details = calculateTimeDetails(dayInput, dayKey === format(new Date(), 'yyyy-MM-dd') ? calculationTime : undefined, dailyTargetMinutes, false);
      data.push({ date: day, totalMinutes: details.totalMinutes });
    }
    return data;
  }, [selectedDate, input, calculationTime, dailyTargetMinutes]);

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
    const calculateTotalOutsideHours = (start: Date, end: Date) => {
      const days = eachDayOfInterval({ start, end });
      let total = 0;
      days.forEach(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const dayInput = yearData[dayKey];
        if (dayInput) {
          const details = calculateTimeDetails(dayInput, undefined, dailyTargetMinutes, false);
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
        const dayInput = yearData[dayKey];
        if (dayInput) {
            const details = calculateTimeDetails(dayInput, undefined, dailyTargetMinutes, false);
            const outsideMinutes = calculateOutsideRegularHours(details.timeEntries, day, false);
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
  }, [selectedDate, yearData, dailyTargetMinutes, holidays]);

  const getCurrentTimeColor = () => {
    if (isHoliday(selectedDate, holidays)) return 'text-yellow-500';
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
    let newEntries: TimeEntry[];

    if (lastLine.match(/^\d{2}:\d{2}\s*-\s*$/)) {
      const updatedInput = input.trim().replace(/-\s*$/, `- ${now}`);
      setInput(updatedInput);
      const lastEntry = timeEntries[timeEntries.length - 1];
      newEntries = [...timeEntries.slice(0, -1), { ...lastEntry, end: now }];
      toast({ title: 'Ausgestempelt', description: `Zeitbuchung bis ${now} Uhr vervollständigt.` });
    } else {
      const newEntry = `${now} - `;
      const updatedInput = input ? `${input.trim()}\n${newEntry}` : newEntry;
      setInput(updatedInput);
      newEntries = [...timeEntries, { start: now, end: '', duration: 0, originalLine: newEntry }];
      toast({ title: 'Eingestempelt', description: `Zeitbuchung um ${now} Uhr gestartet.` });
    }
    updateEntries({ date: selectedDate, entries: newEntries });
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
