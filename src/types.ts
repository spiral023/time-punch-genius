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
  cardVisibility: { [key: string]: boolean };
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
