import { SpecialDayType, BreakCompliance, TimeEntry } from "@/types";

export const getWeekNumber = (date: Date): number => {
  // Create a copy of the date to avoid modifying the original
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  
  // Calculate full weeks to nearest Thursday
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const parseTimeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const formatMinutesToTime = (minutes: number): string => {
  const totalMinutesInDay = 24 * 60;
  let adjustedMinutes = minutes;

  if (adjustedMinutes >= totalMinutesInDay) {
    adjustedMinutes = totalMinutesInDay - 1; // Limit to 23:59
  }

  const hours = Math.floor(adjustedMinutes / 60);
  const mins = adjustedMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const formatHoursMinutes = (totalMinutes: number): string => {
  if (totalMinutes === 0) {
    return '0h 0m';
  }
  const sign = totalMinutes < 0 ? '-' : '';
  const absMinutes = Math.abs(totalMinutes);
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;
  
  const formattedHours = `${hours}h`;
  const formattedMinutes = `${minutes}m`;

  if (sign) {
    return `${sign}${formattedHours} ${formattedMinutes}`;
  }
  
  return `${formattedHours} ${formattedMinutes}`;
};

export const addMinutesToTime = (baseTime: string, minutesToAdd: number): string => {
  const baseMinutes = parseTimeToMinutes(baseTime);
  const newMinutes = baseMinutes + minutesToAdd;
  return formatMinutesToTime(newMinutes);
};

export const validateBreakCompliance = (
  timeEntries: TimeEntry[],
  grossTotalMinutes: number
): BreakCompliance => {
  // If working less than 6 hours, no break requirements apply
  if (grossTotalMinutes < 360) {
    return {
      hasRequiredTotalBreak: true,
      hasMinimumSingleBreak: true,
      totalBreakMinutes: 0,
      longestSingleBreak: 0,
      isCompliant: true,
      violations: []
    };
  }

  // Calculate breaks between time entries
  const breaks: number[] = [];
  for (let i = 0; i < timeEntries.length - 1; i++) {
    const currentEntryEnd = parseTimeToMinutes(timeEntries[i].end);
    const nextEntryStart = parseTimeToMinutes(timeEntries[i + 1].start);
    const breakDuration = nextEntryStart - currentEntryEnd;
    if (breakDuration > 0) {
      breaks.push(breakDuration);
    }
  }

  const totalBreakMinutes = breaks.reduce((sum, breakDuration) => sum + breakDuration, 0);
  const longestSingleBreak = breaks.length > 0 ? Math.max(...breaks) : 0;

  const hasRequiredTotalBreak = totalBreakMinutes >= 30;
  const hasMinimumSingleBreak = longestSingleBreak >= 10;

  const violations: string[] = [];
  if (!hasRequiredTotalBreak) {
    violations.push("Gesamtpausenzeit unter 30 Minuten");
  }
  if (!hasMinimumSingleBreak) {
    violations.push("Keine Pause ≥10 Minuten vorhanden");
  }

  return {
    hasRequiredTotalBreak,
    hasMinimumSingleBreak,
    totalBreakMinutes,
    longestSingleBreak,
    isCompliant: hasRequiredTotalBreak && hasMinimumSingleBreak,
    violations
  };
};

export const calculateTimeDetails = (
  input: string,
  currentTime?: Date,
  dailyTargetMinutes = 0,
  isHoliday = false
) => {
  const trimmedInput = input.trim().toLowerCase();

  const specialDayMappings: { [key: string]: string } = {
    'urlaub': 'vacation',
    'krankenstand': 'sick',
    'pflegeurlaub': 'care_leave',
    'pflegefreistellung': 'care_leave',
    'betriebsratsarbeit': 'works_council',
    'schulung': 'training',
    'seminar': 'training',
    'sonderurlaub': 'special_leave',
    'berufsschule': 'vocational_school',
    'hochzeit': 'wedding',
    'todesfall': 'bereavement',
  };

  // Standard break compliance for special days (no break requirements)
  const defaultBreakCompliance: BreakCompliance = {
    hasRequiredTotalBreak: true,
    hasMinimumSingleBreak: true,
    totalBreakMinutes: 0,
    longestSingleBreak: 0,
    isCompliant: true,
    violations: []
  };

  // Check for holiday first
  if (isHoliday && trimmedInput === '') {
    return {
      timeEntries: [],
      errors: [],
      totalMinutes: 0,
      totalBreak: 0,
      breakDeduction: 0,
      grossTotalMinutes: 0,
      specialDayType: 'holiday' as SpecialDayType,
      breakCompliance: defaultBreakCompliance,
    };
  }

  if (specialDayMappings[trimmedInput]) {
    return {
      timeEntries: [],
      errors: [],
      totalMinutes: dailyTargetMinutes,
      totalBreak: 0,
      breakDeduction: 0,
      grossTotalMinutes: dailyTargetMinutes,
      specialDayType: specialDayMappings[trimmedInput] as SpecialDayType,
      breakCompliance: defaultBreakCompliance,
    };
  }

  const { entries, validationErrors } = parseTimeEntries(input, currentTime);

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
  let breakDeduction = 0;

  if (grossTotalMinutes >= lunchBreakThreshold && totalBreak < requiredBreakDuration) {
    breakDeduction = requiredBreakDuration - totalBreak;
    total -= breakDeduction;
  }

  // Calculate break compliance
  const breakCompliance = validateBreakCompliance(entries, grossTotalMinutes);
  
  return { 
    timeEntries: entries, 
    errors: validationErrors, 
    totalMinutes: total, 
    totalBreak, 
    breakDeduction, 
    grossTotalMinutes, 
    specialDayType: null,
    breakCompliance
  };
}

export const calculateAverageDay = (allDaysData: string[], currentTime?: Date, dailyTargetMinutes = 0) => {
  const dailyStats: { start: number; end: number; break: number, duration: number }[] = [];

  allDaysData.forEach(input => {
    if (!input) return;

    const { timeEntries, totalBreak, breakDeduction, totalMinutes, specialDayType } = calculateTimeDetails(input, currentTime, dailyTargetMinutes);
    
    // Skip vacation and sick days from average calculation
    if (specialDayType === 'vacation' || specialDayType === 'sick') {
      return;
    }
    
    if (specialDayType) {
      // For special days like training, use the daily target minutes
      dailyStats.push({
        start: 8 * 60, // 08:00 - assume standard start time
        end: 8 * 60 + dailyTargetMinutes, // Add target duration
        break: 30, // Standard break
        duration: dailyTargetMinutes,
      });
    } else if (timeEntries.length > 0) {
      // For regular working days with actual time entries
      const firstEntry = timeEntries[0];
      const lastEntry = timeEntries[timeEntries.length - 1];
      const startMinutes = parseTimeToMinutes(firstEntry.start);
      const endMinutes = parseTimeToMinutes(lastEntry.end);
      
      dailyStats.push({
        start: startMinutes,
        end: endMinutes,
        break: totalBreak + breakDeduction,
        duration: totalMinutes,
      });
    }
  });

  if (dailyStats.length === 0) {
    return null;
  }

  const total = dailyStats.reduce(
    (acc, curr) => {
      acc.start += curr.start;
      acc.end += curr.end;
      acc.break += curr.break;
      acc.duration += curr.duration;
      return acc;
    },
    { start: 0, end: 0, break: 0, duration: 0 }
  );

  const count = dailyStats.length;
  return {
    avgStart: formatMinutesToTime(Math.round(total.start / count)),
    avgEnd: formatMinutesToTime(Math.round(total.end / count)),
    avgBreak: Math.round(total.break / count),
    avgHours: formatHoursMinutes(Math.round(total.duration / count)),
  };
};

const parseTimeEntries = (input: string, currentTime?: Date) => {
  const lines = input.split('\n').filter(line => line.trim());
  const entries: { start: string; end: string; duration: number, reason?: string, originalLine: string }[] = [];
  const validationErrors: { line: number; message: string }[] = [];
  const timeValidation = /^([01]?\d|2[0-3]):[0-5]\d$/;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Pattern 1: Closed interval (e.g., "08:00 - 17:00")
    const timePattern = /^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/;
    const match = trimmed.match(timePattern);

    if (match) {
      const [, startTime, endTime] = match;
      const reason = trimmed.substring(match[0].length).trim();

      if (!timeValidation.test(startTime) || !timeValidation.test(endTime)) {
        validationErrors.push({ line: index + 1, message: 'Ungültige Zeitangabe' });
        return;
      }

      const startMinutes = parseTimeToMinutes(startTime);
      const endMinutes = parseTimeToMinutes(endTime);

      if (endMinutes < startMinutes) {
        validationErrors.push({ line: index + 1, message: 'Endzeit muss nach Startzeit liegen' });
        return;
      }

      const duration = endMinutes - startMinutes;
      
      const hasOverlap = entries.some(entry => {
        const entryStart = parseTimeToMinutes(entry.start);
        const entryEnd = parseTimeToMinutes(entry.end);
        return (startMinutes < entryEnd && endMinutes > entryStart);
      });
  
      if (hasOverlap) {
        validationErrors.push({ line: index + 1, message: 'Zeitraum überlappt mit vorherigem Eintrag' });
        return;
      }

      entries.push({ start: startTime, end: endTime, duration, reason: reason ? reason : undefined, originalLine: line });
      return;
    }

    // Pattern 2: Open entry with dash (e.g., "09:00 - ")
    const openEntryPattern = /^(\d{1,2}:\d{2})\s*-\s*$/;
    const openEntryMatch = trimmed.match(openEntryPattern);

    if (openEntryMatch && currentTime) {
      const [, startTime] = openEntryMatch;
      const reason = trimmed.substring(openEntryMatch[0].length).trim();

      if (!timeValidation.test(startTime)) {
        validationErrors.push({ line: index + 1, message: 'Ungültige Zeitangabe' });
        return;
      }

      const startMinutes = parseTimeToMinutes(startTime);
      const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
      
      if (currentMinutes >= startMinutes) {
        const duration = currentMinutes - startMinutes;
        const endTime = formatMinutesToTime(currentMinutes);
        entries.push({ start: startTime, end: endTime, duration, reason: reason ? reason : undefined, originalLine: line });
      }
      return;
    }

    // Pattern 3: Open entry with single time (e.g., "09:00")
    const openTimePattern = /^(\d{1,2}:\d{2})$/;
    const openMatch = trimmed.match(openTimePattern);

    if (openMatch && currentTime) {
      const [, startTime] = openMatch;
      
      if (!timeValidation.test(startTime)) {
        validationErrors.push({ line: index + 1, message: 'Ungültige Zeitangabe' });
        return;
      }

      const startMinutes = parseTimeToMinutes(startTime);
      const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
      
      // Toleranz von 2 Minuten für zukünftige Zeiten (z.B. bei manueller Eingabe)
      if (startMinutes > currentMinutes + 2) {
        validationErrors.push({ line: index + 1, message: 'Startzeit liegt in der Zukunft' });
        return;
      }

      // Verwende die spätere Zeit als Endzeit (entweder aktuelle Zeit oder Startzeit)
      const endMinutes = Math.max(currentMinutes, startMinutes);
      const duration = Math.max(0, endMinutes - startMinutes);
      const endTime = formatMinutesToTime(endMinutes);
      
      entries.push({ start: startTime, end: endTime, duration, originalLine: line });
      return;
    }

    // If none of the above patterns match, it might be a special day or an error
    const specialDayPattern = /^(urlaub|krankenstand|pflegeurlaub|pflegefreistellung|betriebsratsarbeit|schulung|seminar|sonderurlaub|berufsschule|hochzeit|todesfall)$/i;
    if (!specialDayPattern.test(trimmed)) {
      validationErrors.push({
        line: index + 1,
        message: 'Ungültiges Format. Verwende HH:MM - HH:MM oder HH:MM.'
      });
    }
  });

  entries.sort((a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start));
  return { entries, validationErrors };
};

export const calculateOutsideRegularHours = (
  timeEntries: { start: string; end: string; duration: number }[],
  date: Date,
  isHoliday: boolean
): number => {
  const regularStartMinutes = 6 * 60; // 06:00
  const regularEndMinutes = 19 * 60; // 19:00
  const dayOfWeek = date.getDay(); // Sunday = 0, Monday = 1, etc.

  let outsideMinutes = 0;

  // Weekend or Holiday
  if (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday) {
    return timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
  }

  // Weekday
  for (const entry of timeEntries) {
    const startMinutes = parseTimeToMinutes(entry.start);
    const endMinutes = parseTimeToMinutes(entry.end);

    // Time worked before 6:00
    if (startMinutes < regularStartMinutes) {
      const durationBefore = Math.min(endMinutes, regularStartMinutes) - startMinutes;
      if (durationBefore > 0) {
        outsideMinutes += durationBefore;
      }
    }

    // Time worked after 19:00
    if (endMinutes > regularEndMinutes) {
      const durationAfter = endMinutes - Math.max(startMinutes, regularEndMinutes);
      if (durationAfter > 0) {
        outsideMinutes += durationAfter;
      }
    }
  }
  
  return outsideMinutes;
};
