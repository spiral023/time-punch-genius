import React from 'react';
import { vi } from 'vitest';
import { TimeEntry, SpecialDayType, ValidationError, Holiday, YearData } from '@/types';

// Vollständige TimeCalculatorContextType Definition basierend auf dem echten Context
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
  statistics: {
    averageBlocksPerDay: number;
    averageDailyMinutes: { day: string; averageMinutes: number; }[];
    daysWithBookings: number;
    daysInYear: number;
    earliestStart: string | null;
    latestEnd: string | null;
    longestBreak: number | null;
    earliestStartDate: string | null;
    latestEndDate: string | null;
    longestBreakDate: string | null;
    daysOver9Hours: number;
    longestWeek: number | null;
    longestWeekStart: string | null;
    longestWeekEnd: string | null;
    longestDay: number | null;
    longestDayDate: string | null;
    longestStreak: number;
    longestStreakStart: string | null;
    longestStreakEnd: string | null;
    currentWeekTotalMinutes: number;
    previousWeekTotalMinutes: number;
    previousWeekToDateTotalMinutes: number;
    vacationDays: number;
    daysWithoutRequiredBreak: number;
  };
  homeOfficeStats: {
    homeOfficeDaysWorkdays: number;
    homeOfficeDaysWeekendsAndHolidays: number;
    totalHomeOfficeHoursInNormalTime: number;
    totalHomeOfficeHoursOutsideNormalTime: number;
    pureOfficeDays: number;
    hybridDays: number;
    hoHoursPercentage: number;
    hoDaysPercentage: number;
  };
  dataManagementRef: React.RefObject<{ triggerImport: () => void; triggerWebdeskImport: () => void } | null>;
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

interface AppSettingsContextType {
  targetHours: number;
  setTargetHours: (hours: number) => void;
  automaticBreakDeduction: boolean;
  setAutomaticBreakDeduction: (enabled: boolean) => void;
  regularWorkStart: string;
  setRegularWorkStart: (time: string) => void;
  regularWorkEnd: string;
  setRegularWorkEnd: (time: string) => void;
  personalVacationDays: number;
  setPersonalVacationDays: (days: number) => void;
  dashboardLayout: {
    left: string[];
    right: string[];
  };
  setDashboardLayout: (layout: { left: string[]; right: string[] }) => void;
}

// Mock-Daten für realistische Tests
export const mockTimeEntries: TimeEntry[] = [
  {
    start: '08:00',
    end: '12:00',
    duration: 240,
    originalLine: '08:00 - 12:00',
    reason: undefined
  },
  {
    start: '13:00',
    end: '17:00',
    duration: 240,
    originalLine: '13:00 - 17:00',
    reason: undefined
  }
];

export const mockValidationErrors: ValidationError[] = [
  {
    line: 1,
    message: 'Ungültiges Zeitformat'
  }
];

// Factory für TimeCalculatorContext Mock
export const createMockTimeCalculatorContext = (overrides: Partial<TimeCalculatorContextType> = {}): TimeCalculatorContextType => ({
  // Eingabe-State
  input: '08:00 - 12:00\n13:00 - 17:00',
  setInput: vi.fn(),
  
  // Datum-State
  selectedDate: new Date('2024-01-15'),
  setSelectedDate: vi.fn(),
  
  // Wöchentliche Zielstunden
  weeklyTargetHours: 38.5,
  setWeeklyTargetHours: vi.fn(),
  
  // Aktuelle Zeit
  currentTime: new Date('2024-01-15T14:30:00'),
  
  // Feiertage
  holidays: [],
  
  // Jahr-Daten
  yearData: {},
  
  // Notizen
  notes: '',
  setNotes: vi.fn(),
  
  // Tägliche Zielminuten
  dailyTargetMinutes: 462, // 7.7 Stunden
  
  // Berechnete Werte
  timeEntries: mockTimeEntries,
  totalMinutes: 480,
  totalBreak: 60,
  breakDeduction: 60,
  grossTotalMinutes: 540,
  
  // Validierung
  errors: [],
  
  // Spezielle Tage
  specialDayType: null,
  
  // Wöchentliche Balance
  weeklyBalance: 0,
  
  // Chart-Daten
  weeklyChartData: [],
  
  // Zusammenfassungen
  weeklySummary: 2310, // 38.5 Stunden
  monthlySummary: 9240, // 154 Stunden
  yearlySummary: 110880, // 1848 Stunden
  totalSummary: 110880,
  
  // Statistiken
  statistics: {
    averageBlocksPerDay: 2.0,
    averageDailyMinutes: [
      { day: 'Mo', averageMinutes: 480 },
      { day: 'Di', averageMinutes: 480 },
      { day: 'Mi', averageMinutes: 480 },
      { day: 'Do', averageMinutes: 480 },
      { day: 'Fr', averageMinutes: 480 },
      { day: 'Sa', averageMinutes: 0 },
      { day: 'So', averageMinutes: 0 }
    ],
    daysWithBookings: 20,
    daysInYear: 365,
    earliestStart: '07:30',
    latestEnd: '18:00',
    longestBreak: 90,
    earliestStartDate: '2024-01-10',
    latestEndDate: '2024-01-20',
    longestBreakDate: '2024-01-15',
    daysOver9Hours: 2,
    longestWeek: 2400,
    longestWeekStart: '2024-01-08',
    longestWeekEnd: '2024-01-12',
    longestDay: 600,
    longestDayDate: '2024-01-18',
    longestStreak: 5,
    longestStreakStart: '2024-01-08',
    longestStreakEnd: '2024-01-12',
    currentWeekTotalMinutes: 2310,
    previousWeekTotalMinutes: 2280,
    previousWeekToDateTotalMinutes: 1800,
    vacationDays: 3,
    daysWithoutRequiredBreak: 1
  },
  
  // Home Office Stats
  homeOfficeStats: {
    homeOfficeDaysWorkdays: 5,
    homeOfficeDaysWeekendsAndHolidays: 1,
    totalHomeOfficeHoursInNormalTime: 1200,
    totalHomeOfficeHoursOutsideNormalTime: 120,
    pureOfficeDays: 10,
    hybridDays: 3,
    hoHoursPercentage: 35.5,
    hoDaysPercentage: 44.4
  },
  
  // Data Management Ref
  dataManagementRef: { current: null },
  
  // Funktionen
  clearInput: vi.fn(),
  handleExportData: vi.fn(),
  handleImportData: vi.fn(),
  handleClearAllData: vi.fn(),
  handleWebdeskImport: vi.fn(),
  triggerImport: vi.fn(),
  triggerWebdeskImport: vi.fn(),
  
  // Durchschnittlicher Tag
  averageDayData: {
    avgStart: '08:00',
    avgEnd: '16:30',
    avgBreak: 60,
    avgHours: '7:30'
  },
  
  // Außerhalb der Regelarbeitszeit
  outsideRegularHours: {
    week: 0,
    month: 0,
    year: 0,
    daysWithOutsideHours: 0,
    totalDaysWithEntries: 0
  },
  
  // Weitere Funktionen
  getCurrentTimeColor: vi.fn(() => 'text-primary'),
  handlePunch: vi.fn(),
  
  // Überschreibungen anwenden
  ...overrides
});

// Factory für AppSettingsContext Mock
export const createMockAppSettingsContext = (overrides: Partial<AppSettingsContextType> = {}): AppSettingsContextType => ({
  // Arbeitszeit-Einstellungen
  targetHours: 8,
  setTargetHours: vi.fn(),
  
  // Pause-Einstellungen
  automaticBreakDeduction: true,
  setAutomaticBreakDeduction: vi.fn(),
  
  // Regelarbeitszeit
  regularWorkStart: '08:00',
  setRegularWorkStart: vi.fn(),
  regularWorkEnd: '17:00',
  setRegularWorkEnd: vi.fn(),
  
  // Persönliche Urlaubstage
  personalVacationDays: 25,
  setPersonalVacationDays: vi.fn(),
  
  // Dashboard-Layout
  dashboardLayout: {
    left: ['working-time', 'statistics'],
    right: ['info', 'average-day']
  },
  setDashboardLayout: vi.fn(),
  
  // Überschreibungen anwenden
  ...overrides
});

// Mock Context erstellen (ohne echte Provider zu verwenden)
const TimeCalculatorContext = React.createContext<TimeCalculatorContextType | undefined>(undefined);
const AppSettingsContext = React.createContext<AppSettingsContextType | undefined>(undefined);

// Provider-Wrapper für Tests
export const MockTimeCalculatorProvider: React.FC<{
  children: React.ReactNode;
  contextValue?: Partial<TimeCalculatorContextType>;
}> = ({ children, contextValue = {} }) => {
  const mockValue = createMockTimeCalculatorContext(contextValue);
  
  return (
    <TimeCalculatorContext.Provider value={mockValue}>
      {children}
    </TimeCalculatorContext.Provider>
  );
};

export const MockAppSettingsProvider: React.FC<{
  children: React.ReactNode;
  contextValue?: Partial<AppSettingsContextType>;
}> = ({ children, contextValue = {} }) => {
  const mockValue = createMockAppSettingsContext(contextValue);
  
  return (
    <AppSettingsContext.Provider value={mockValue}>
      {children}
    </AppSettingsContext.Provider>
  );
};

// Kombinierter Provider für vollständige Tests
export const MockProviders: React.FC<{
  children: React.ReactNode;
  timeCalculatorContext?: Partial<TimeCalculatorContextType>;
  appSettingsContext?: Partial<AppSettingsContextType>;
}> = ({ children, timeCalculatorContext = {}, appSettingsContext = {} }) => {
  return (
    <MockAppSettingsProvider contextValue={appSettingsContext}>
      <MockTimeCalculatorProvider contextValue={timeCalculatorContext}>
        {children}
      </MockTimeCalculatorProvider>
    </MockAppSettingsProvider>
  );
};

// Spezielle Mock-Szenarien
export const mockScenarios = {
  // Leerer Tag
  emptyDay: {
    input: '',
    timeEntries: [],
    totalMinutes: 0,
    specialDayType: null
  },
  
  // Urlaubstag
  vacationDay: {
    input: 'Urlaub',
    timeEntries: [],
    totalMinutes: 0,
    specialDayType: 'vacation' as SpecialDayType
  },
  
  // Krankenstand
  sickDay: {
    input: 'Krankenstand',
    timeEntries: [],
    totalMinutes: 0,
    specialDayType: 'sick' as SpecialDayType
  },
  
  // Feiertag
  holidayDay: {
    input: '',
    timeEntries: [],
    totalMinutes: 0,
    specialDayType: 'holiday' as SpecialDayType
  },
  
  // Tag mit Validierungsfehlern
  invalidDay: {
    input: 'invalid time format',
    timeEntries: [],
    totalMinutes: 0,
    errors: mockValidationErrors,
    isValid: false
  },
  
  // Offene Buchung
  openEntry: {
    input: '08:00 -',
    timeEntries: [{
      start: '08:00',
      end: undefined,
      duration: 0,
      originalLine: '08:00 -',
      reason: undefined
    }],
    totalMinutes: 0
  },
  
  // Homeoffice-Tag
  homeOfficeDay: {
    input: '08:00 - 16:00 Homeoffice',
    timeEntries: [{
      start: '08:00',
      end: '16:00',
      duration: 480,
      originalLine: '08:00 - 16:00 Homeoffice',
      reason: 'Homeoffice'
    }],
    totalMinutes: 480
  }
};
