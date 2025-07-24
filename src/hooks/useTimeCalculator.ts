import { useMemo } from 'react';
import { parseTimeToMinutes, formatMinutesToTime } from '@/lib/timeUtils';
import { TimeEntry, ValidationError } from '@/types';

export const useTimeCalculator = (input: string, currentTime: Date) => {
  return useMemo(() => {
    const lines = input.split('\n').filter(line => line.trim());
    const entries: TimeEntry[] = [];
    const validationErrors: ValidationError[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (!trimmed.includes('-') && !trimmed.includes(':')) return;

      const openTimePattern = /^(\d{1,2}:\d{2})$/;
      const openMatch = trimmed.match(openTimePattern);
      
      if (openMatch) {
        const [, startTime] = openMatch;
        
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

    entries.sort((a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start));

    const grossTotalMinutes = entries.reduce((sum, entry) => sum + entry.duration, 0);
    let total = grossTotalMinutes;
    let totalBreak = 0;

    for (let i = 0; i < entries.length - 1; i++) {
      const currentEntryEnd = parseTimeToMinutes(entries[i].end);
      const nextEntryStart = parseTimeToMinutes(entries[i + 1].start);
      const breakDuration = nextEntryStart - currentEntryEnd;
      if (breakDuration > 0) {
        totalBreak += breakDuration;
      }
    }

    const lunchBreakThreshold = 6 * 60;
    const requiredBreakDuration = 30;
    let breakDeducted = false;

    if (grossTotalMinutes >= lunchBreakThreshold && totalBreak < requiredBreakDuration) {
      total -= requiredBreakDuration;
      breakDeducted = true;
    }
    
    return { timeEntries: entries, errors: validationErrors, totalMinutes: total, totalBreak, breakDeducted, grossTotalMinutes };
  }, [input, currentTime]);
};
