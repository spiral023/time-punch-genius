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

export const calculateTimeDetails = (input: string, currentTime?: Date) => {
  const lines = input.split('\n').filter(line => line.trim());
  const entries: { start: string; end: string; duration: number }[] = [];
  const validationErrors: { line: number; message: string }[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (!trimmed.includes('-') && !trimmed.includes(':')) return;

    const openTimePattern = /^(\d{1,2}:\d{2})$/;
    const openMatch = trimmed.match(openTimePattern);
    
    if (openMatch && currentTime) {
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
      // Check for open entry format like "HH:MM - "
      const openEntryPattern = /^(\d{1,2}:\d{2})\s*-\s*$/;
      const openEntryMatch = trimmed.match(openEntryPattern);

      if (openEntryMatch && currentTime) {
        const [, startTime] = openEntryMatch;
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
        
        if (currentMinutes > startMinutes) {
          const duration = currentMinutes - startMinutes;
          const endTime = formatMinutesToTime(currentMinutes);
          entries.push({ start: startTime, end: endTime, duration });
        }
        // Don't add to validation errors if it's just an open entry
        return;
      }

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
  let breakDeduction = 0;

  if (grossTotalMinutes >= lunchBreakThreshold && totalBreak < requiredBreakDuration) {
    breakDeduction = requiredBreakDuration - totalBreak;
    total -= breakDeduction;
  }
  
  return { timeEntries: entries, errors: validationErrors, totalMinutes: total, totalBreak, breakDeduction, grossTotalMinutes };
}

export const calculateAverageDay = (allDaysData: string[], currentTime?: Date, currentDateKey?: string) => {
  const dailyStats: { start: number; end: number; break: number }[] = [];

  allDaysData.forEach(input => {
    if (!input) return;

    const { timeEntries, totalBreak, breakDeduction } = calculateTimeDetails(input, currentTime);
    if (timeEntries.length > 0) {
      const firstEntry = timeEntries[0];
      const lastEntry = timeEntries[timeEntries.length - 1];
      
      dailyStats.push({
        start: parseTimeToMinutes(firstEntry.start),
        end: parseTimeToMinutes(lastEntry.end),
        break: totalBreak + breakDeduction,
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
      return acc;
    },
    { start: 0, end: 0, break: 0 }
  );

  const count = dailyStats.length;
  return {
    avgStart: formatMinutesToTime(Math.round(total.start / count)),
    avgEnd: formatMinutesToTime(Math.round(total.end / count)),
    avgBreak: Math.round(total.break / count),
  };
};

export const calculateOutsideRegularHours = (
  timeEntries: { start: string; end: string; duration: number }[],
  date: Date
): number => {
  const regularStartMinutes = 6 * 60; // 06:00
  const regularEndMinutes = 19 * 60; // 19:00
  const dayOfWeek = date.getDay(); // Sunday = 0, Monday = 1, etc.

  let outsideMinutes = 0;

  // Weekend
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
  }

  // Weekday
  for (const entry of timeEntries) {
    const startMinutes = parseTimeToMinutes(entry.start);
    const endMinutes = parseTimeToMinutes(entry.end);

    // Time worked before 6:00
    if (startMinutes < regularStartMinutes) {
      outsideMinutes += Math.min(endMinutes, regularStartMinutes) - startMinutes;
    }

    // Time worked after 19:00
    if (endMinutes > regularEndMinutes) {
      outsideMinutes += endMinutes - Math.max(startMinutes, regularEndMinutes);
    }
  }

  return outsideMinutes;
};
