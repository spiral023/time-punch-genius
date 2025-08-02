export interface TimeEntry {
  start: string;
  end: string;
  duration: number; // in minutes
  reason?: string;
  originalLine: string;
}

export interface ValidationError {
  line: number;
  message: string;
}

export type Holiday = {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
};

export interface DashboardLayout {
  version: number;
  columns: string[][];
}

export interface AppSettings {
  personalVacationDays: number;
  cardVisibility: { [key: string]: boolean };
  gradientId: number;
  showWelcomeScreen: boolean;
  columnWidthSlider: number;
  zoomLevel: number;
  weeklyTargetHours: number;
  dashboardLayout: DashboardLayout;
  targetTimesVisibility?: { [key: string]: boolean };
}

export interface BreakCompliance {
  hasRequiredTotalBreak: boolean;
  hasMinimumSingleBreak: boolean;
  totalBreakMinutes: number;
  longestSingleBreak: number;
  isCompliant: boolean;
  violations: string[];
}

export type SpecialDayType =
  | 'vacation'
  | 'sick'
  | 'holiday'
  | 'care_leave'
  | 'works_council'
  | 'training'
  | 'special_leave'
  | 'vocational_school'
  | 'wedding'
  | 'bereavement';

export interface YearData {
  [date: string]: string;
}

export interface YearlyStatistics {
  year: number;
  homeOfficeDaysWorkdays: number;
  homeOfficeDaysWeekendsAndHolidays: number;
  pureOfficeDays: number;
  hybridDays: number;
  totalWorkDays: number;
  totalHomeOfficeHours: number;
  totalOfficeHours: number;
  vacationDays: number;
  totalHomeOfficeHoursInNormalTime?: number; // Optional for backward compatibility
  totalHomeOfficeHoursOutsideNormalTime?: number; // Optional for backward compatibility
  lastUpdated: string; // ISO timestamp
}
