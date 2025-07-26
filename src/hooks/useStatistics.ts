import { useMemo } from 'react';
import { parse, differenceInMinutes, getDayOfYear, format, isValid, getWeek, startOfWeek, endOfWeek, getDay } from 'date-fns';
import { calculateTimeDetails } from '@/lib/timeUtils';

export const useStatistics = (yearData: { [date: string]: string }, dailyTargetMinutes: number) => {
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

      const { timeEntries, totalMinutes, specialDayType } = calculateTimeDetails(input, undefined, dailyTargetMinutes);
      if (timeEntries.length === 0 && !specialDayType) continue;

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

    const currentWeekTotalMinutes = weeklyMinutes[currentWeekKey]?.totalMinutes || 0;
    const previousWeekTotalMinutes = weeklyMinutes[previousWeekKey]?.totalMinutes || 0;

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
    };
  }, [yearData]);
};
