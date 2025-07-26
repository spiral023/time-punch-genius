import { useMemo } from 'react';
import { parse, differenceInMinutes, getDayOfYear, format, isValid, getWeek, startOfWeek, endOfWeek, getDay } from 'date-fns';
import { calculateTimeDetails } from '@/lib/timeUtils';

const formatDateKey = (date: Date): string => `zehelper_data_${format(date, 'yyyy-MM-dd')}`;

export const useStatistics = (selectedDate: Date, currentDayInput: string) => {
  return useMemo(() => {
    const year = selectedDate.getFullYear();
    const allKeys = Object.keys(localStorage);
    const yearData: { [date: string]: string } = {};

    for (const key of allKeys) {
      if (key.startsWith('zehelper_data_')) {
        const dateStr = key.replace('zehelper_data_', '');
        if (dateStr.startsWith(year.toString())) {
          yearData[dateStr] = localStorage.getItem(key) || '';
        }
      }
    }
    
    // Make sure current day's (potentially unsaved) data is included
    const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
    yearData[selectedDateKey] = currentDayInput;

    const daysWithBookings = Object.values(yearData).filter(d => d && d.trim() !== '').length;
    const daysInYear = getDayOfYear(new Date());

    let earliestStart: string | null = null;
    let earliestStartDate: string | null = null;
    let latestEnd: string | null = null;
    let latestEndDate: string | null = null;
    let longestBreak: number | null = null;
    let longestBreakDate: string | null = null;
    let daysOver9Hours = 0;
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

      const { timeEntries, totalMinutes } = calculateTimeDetails(input);
      if (timeEntries.length === 0) continue;

      totalBlocks += timeEntries.length;

      const entryDate = new Date(dateStr);
      const weekNumber = getWeek(entryDate, { weekStartsOn: 1 });
      const weekKey = `${year}-${weekNumber}`;

      if (!weeklyMinutes[weekKey]) {
        weeklyMinutes[weekKey] = { totalMinutes: 0, date: entryDate };
      }
      weeklyMinutes[weekKey].totalMinutes += totalMinutes;

      if (totalMinutes > 540) { // 9 hours * 60 minutes
        daysOver9Hours++;
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
    };
  }, [selectedDate, currentDayInput]);
};
