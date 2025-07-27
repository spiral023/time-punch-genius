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

export interface AppSettings {
  personalVacationDays: number;
}
