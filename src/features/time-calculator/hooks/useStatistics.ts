import { useMemo } from 'react';
import { parse, differenceInMinutes, getDayOfYear, format, isValid, getWeek, startOfWeek, endOfWeek, getDay, isToday } from 'date-fns';
import { calculateTimeDetails } from '@/lib/timeUtils';

export const useStatistics = (
  yearData: { [date: string]: string }, 
  dailyTargetMinutes: number,
  currentInput?: string,
  currentTime?: Date,
  selectedDate?: Date
) => {
  return useMemo(() => {

    const daysWithBookings = Object.values(yearData).filter(d => d && d.trim() !== '').length;
    const daysInYear = getDayOfYear(new Date());

    let earliestStart: string | null = null;
    let earliestStartDate: string | null = null;
    let latestEnd: string | null = null;
    let latestEndDate: string | null = null;
    let longestBreak: number | null = null;
    let longestBreakDate: string | null = null;
    let longestDay: number | null = null;
    let longestDayDate: string | null = null;
    let daysOver9Hours = 0;
    let longestStreak = 0;
    let longestStreakStart: string | null = null;
    let longestStreakEnd: string | null = null;
    let totalBlocks = 0;
    let vacationDays = 0;
    let daysWithoutRequiredBreak = 0;
    const weeklyMinutes: { [week: string]: { totalMinutes: number, date: Date } } = {};
    const dailyMinutes: { [day: number]: { totalMinutes: number, count: number } } = {
      0: { totalMinutes: 0, count: 0 }, // Sunday
      1: { totalMinutes: 0, count: 0 }, // Monday
      2: { totalMinutes: 0, count: 0 }, // Tuesday
      3: { totalMinutes: 0, count: 0 }, // Wednesday
      4: { totalMinutes: 0, count: 0 }, // Thursday
      5: { totalMinutes: 0, count: 0 }, // Friday
      6: { totalMinutes: 0, count: 0 }, // Saturday
    };

    for (const dateStr in yearData) {
      const input = yearData[dateStr];
      if (!input || input.trim() === '') continue;

      const { timeEntries, totalMinutes, grossTotalMinutes, specialDayType } = calculateTimeDetails(input, undefined, dailyTargetMinutes);
      if (timeEntries.length === 0 && !specialDayType) continue;

      if (specialDayType === 'vacation') {
        vacationDays++;
      }

      // Prüfe Pausenregelung für Tage mit mehr als 6 Stunden Arbeitszeit
      if (!specialDayType && grossTotalMinutes >= 360) { // 6 Stunden = 360 Minuten
        let totalBreakMinutes = 0;
        
        // Berechne Pausen zwischen Zeitblöcken
        for (let i = 0; i < timeEntries.length - 1; i++) {
          const currentEnd = timeEntries[i].end.split(':').map(Number);
          const nextStart = timeEntries[i + 1].start.split(':').map(Number);
          const currentEndMinutes = currentEnd[0] * 60 + currentEnd[1];
          const nextStartMinutes = nextStart[0] * 60 + nextStart[1];
          const breakDuration = nextStartMinutes - currentEndMinutes;
          
          if (breakDuration > 0) {
            totalBreakMinutes += breakDuration;
          }
        }
        
        // Österreichische Regel: Bei mehr als 6h Arbeitszeit sind 30 Min Pause erforderlich
        if (totalBreakMinutes < 30) {
          daysWithoutRequiredBreak++;
        }
      }

      totalBlocks += timeEntries.length;

      const entryDate = new Date(dateStr);
      const year = entryDate.getFullYear();
      const weekNumber = getWeek(entryDate, { weekStartsOn: 1 });
      const weekKey = `${year}-${weekNumber}`;

      if (!weeklyMinutes[weekKey]) {
        weeklyMinutes[weekKey] = { totalMinutes: 0, date: entryDate };
      }
      weeklyMinutes[weekKey].totalMinutes += totalMinutes;

      if (totalMinutes > 540) { // 9 hours * 60 minutes
        daysOver9Hours++;
      }

      if (longestDay === null || totalMinutes > longestDay) {
        longestDay = totalMinutes;
        longestDayDate = dateStr;
      }

      const dayOfWeek = getDay(entryDate);
      dailyMinutes[dayOfWeek].totalMinutes += totalMinutes;
      dailyMinutes[dayOfWeek].count++;

      const parsedEntries = timeEntries.map(entry => {
        const start = parse(entry.start, 'HH:mm', new Date(dateStr));
        const end = parse(entry.end, 'HH:mm', new Date(dateStr));
        return { start, end };
      }).filter(e => isValid(e.start) && isValid(e.end))
        .sort((a, b) => a.start.getTime() - b.start.getTime());

      if (parsedEntries.length === 0) continue;

      const dayStart = parsedEntries[0].start;
      const dayEnd = parsedEntries[parsedEntries.length - 1].end;

      const dayStartTime = format(dayStart, 'HH:mm');
      if (earliestStart === null || dayStartTime < earliestStart) {
        earliestStart = dayStartTime;
        earliestStartDate = dateStr;
      }

      const dayEndTime = format(dayEnd, 'HH:mm');
      if (latestEnd === null || dayEndTime > latestEnd) {
        latestEnd = dayEndTime;
        latestEndDate = dateStr;
      }

      for (let i = 0; i < parsedEntries.length - 1; i++) {
        const breakDuration = differenceInMinutes(parsedEntries[i + 1].start, parsedEntries[i].end);
        if (longestBreak === null || breakDuration > longestBreak) {
          longestBreak = breakDuration;
          longestBreakDate = dateStr;
        }
      }
    }

    const sortedDates = Object.keys(yearData)
      .filter(dateStr => yearData[dateStr] && yearData[dateStr].trim() !== '')
      .sort();

    if (sortedDates.length > 0) {
      let currentStreak = 1;
      let currentStreakStartDate = sortedDates[0];
      let maxStreak = 1;
      let maxStreakStartDate = sortedDates[0];
      let maxStreakEndDate = sortedDates[0];

      for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        const prevDate = new Date(sortedDates[i - 1]);
        const diffInDays = (currentDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24);

        if (diffInDays === 1) {
          currentStreak++;
        } else {
          if (currentStreak > maxStreak) {
            maxStreak = currentStreak;
            maxStreakStartDate = currentStreakStartDate;
            maxStreakEndDate = sortedDates[i - 1];
          }
          currentStreak = 1;
          currentStreakStartDate = sortedDates[i];
        }
      }

      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
        maxStreakStartDate = currentStreakStartDate;
        maxStreakEndDate = sortedDates[sortedDates.length - 1];
      }
      
      longestStreak = maxStreak;
      longestStreakStart = maxStreakStartDate;
      longestStreakEnd = maxStreakEndDate;
    }

    let longestWeek: number | null = null;
    let longestWeekStart: string | null = null;
    let longestWeekEnd: string | null = null;

    if (Object.keys(weeklyMinutes).length > 0) {
      const longestWeekKey = Object.keys(weeklyMinutes).reduce((a, b) =>
        weeklyMinutes[a].totalMinutes > weeklyMinutes[b].totalMinutes ? a : b
      );
      
      longestWeek = weeklyMinutes[longestWeekKey].totalMinutes;
      const weekDate = weeklyMinutes[longestWeekKey].date;
      longestWeekStart = format(startOfWeek(weekDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      longestWeekEnd = format(endOfWeek(weekDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentWeekNumber = getWeek(today, { weekStartsOn: 1 });
    const currentWeekKey = `${currentYear}-${currentWeekNumber}`;
    const previousWeekKey = `${currentYear}-${currentWeekNumber - 1}`;

    // Berechne currentWeekTotalMinutes mit Live-Daten
    let currentWeekTotalMinutes = weeklyMinutes[currentWeekKey]?.totalMinutes || 0;
    
    // Wenn wir Live-Daten haben und heute ausgewählt ist, aktualisiere die aktuelle Woche
    if (currentInput !== undefined && selectedDate && isToday(selectedDate)) {
      const todayKey = format(today, 'yyyy-MM-dd');
      const storedTodayInput = yearData[todayKey];
      
      // Entferne die gespeicherten Daten von heute aus der Wochensumme
      if (storedTodayInput && storedTodayInput.trim() !== '') {
        const { totalMinutes: storedMinutes } = calculateTimeDetails(storedTodayInput, undefined, dailyTargetMinutes);
        currentWeekTotalMinutes -= storedMinutes;
      }
      
      // Füge die Live-Daten von heute hinzu
      if (currentInput.trim() !== '') {
        const { totalMinutes: liveMinutes } = calculateTimeDetails(
          currentInput, 
          currentTime, 
          dailyTargetMinutes
        );
        currentWeekTotalMinutes += liveMinutes;
      }
    }

    const previousWeekTotalMinutes = weeklyMinutes[previousWeekKey]?.totalMinutes || 0;

    // Berechne den exakten Zeitpunkt vor 7 Tagen
    const currentDateTime = selectedDate || today;
    const previousWeekSameTime = new Date(currentDateTime);
    previousWeekSameTime.setDate(currentDateTime.getDate() - 7);
    
    // Wochenstart der Vorwoche
    const previousWeekStart = startOfWeek(previousWeekSameTime, { weekStartsOn: 1 });

    const previousWeekToDateTotalMinutes = Object.keys(yearData)
      .filter(dateStr => {
        const date = new Date(dateStr);
        // Alle Tage von Wochenstart bis zum gleichen Zeitpunkt vor 7 Tagen
        return date >= previousWeekStart && date <= previousWeekSameTime;
      })
      .reduce((total, dateStr) => {
        const input = yearData[dateStr];
        if (!input || input.trim() === '') return total;
        
        const entryDate = new Date(dateStr);
        let totalMinutes = 0;
        
        // Wenn es der gleiche Tag vor 7 Tagen ist und wir Live-Daten haben
        if (entryDate.getTime() === previousWeekSameTime.getTime() && 
            selectedDate && isToday(selectedDate) && currentTime) {
          // Berechne nur bis zur gleichen Tageszeit vor 7 Tagen
          const { totalMinutes: dayMinutes } = calculateTimeDetails(input, currentTime, dailyTargetMinutes);
          totalMinutes = dayMinutes;
        } else {
          // Für alle anderen Tage: komplette Tageszeit
          const { totalMinutes: dayMinutes } = calculateTimeDetails(input, undefined, dailyTargetMinutes);
          totalMinutes = dayMinutes;
        }
        
        return total + totalMinutes;
      }, 0);

    const averageDailyMinutes = Object.keys(dailyMinutes).map(day => {
        const dayIndex = parseInt(day);
        const data = dailyMinutes[dayIndex];
        const average = data.count > 0 ? data.totalMinutes / data.count : 0;
        return {
            day: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][dayIndex],
            averageMinutes: average
        };
    });

    const averageBlocksPerDay = daysWithBookings > 0 ? totalBlocks / daysWithBookings : 0;

    return {
      averageBlocksPerDay,
      averageDailyMinutes,
      daysWithBookings,
      daysInYear,
      earliestStart,
      latestEnd,
      longestBreak,
      earliestStartDate,
      latestEndDate,
      longestBreakDate,
      daysOver9Hours,
      longestWeek,
      longestWeekStart,
      longestWeekEnd,
      longestDay,
      longestDayDate,
      longestStreak,
      longestStreakStart,
      longestStreakEnd,
      currentWeekTotalMinutes,
      previousWeekTotalMinutes,
      previousWeekToDateTotalMinutes,
      vacationDays,
      daysWithoutRequiredBreak,
    };
  }, [yearData, currentInput, currentTime, selectedDate, dailyTargetMinutes]);
};
