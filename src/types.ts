export interface TimeEntry {
  start: string;
  end: string;
  duration: number; // in minutes
}

export interface ValidationError {
  line: number;
  message: string;
}
