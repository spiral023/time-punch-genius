// src/hooks/useHomeOfficeStats.ts
import { useState, useEffect } from 'react';
import { isHoliday } from '@/lib/holidays';
import { parseTimeToMinutes } from '@/lib/timeUtils';
import { Holiday } from '@/types';

export const useHomeOfficeStats = (yearData: { [key: string]: string }, holidays: Holiday[]) => {
  const [homeOfficeStats, setHomeOfficeStats] = useState({
    homeOfficeDaysWorkdays: 0,
    homeOfficeDaysWeekendsAndHolidays: 0,
    totalHomeOfficeHoursInNormalTime: 0,
    totalHomeOfficeHoursOutsideNormalTime: 0,
    pureOfficeDays: 0,
    hybridDays: 0,
    hoHoursPercentage: 0,
    hoDaysPercentage: 0,
  });

  useEffect(() => {
    let homeOfficeDaysWorkdays = 0;
    let homeOfficeDaysWeekendsAndHolidays = 0;
    let pureOfficeDays = 0;
    let hybridDays = 0;
    let totalHomeOfficeHours = 0;
    let totalOfficeHours = 0;
    let totalHomeOfficeHoursInNormalTime = 0;
    let totalHomeOfficeHoursOutsideNormalTime = 0;

    const NORMAL_WORK_START = 6 * 60;
    const NORMAL_WORK_END = 19 * 60;

    Object.keys(yearData).forEach(dateKey => {
      const input = yearData[dateKey];
      if (!input) return;

      const date = new Date(dateKey);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const holiday = isHoliday(date, holidays);
      
      const lines = input.split('\n');
      const hasHomeOffice = lines.some(line => line.toLowerCase().includes('homeoffice'));
      const hasOffice = lines.some(line => !line.toLowerCase().includes('homeoffice') && line.match(/\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}/));

      if (isWeekend || holiday) {
        if (hasHomeOffice) homeOfficeDaysWeekendsAndHolidays++;
      } else {
        if (hasHomeOffice && !hasOffice) homeOfficeDaysWorkdays++;
        else if (hasOffice && !hasHomeOffice) pureOfficeDays++;
        else if (hasHomeOffice && hasOffice) hybridDays++;
      }

      lines.forEach(line => {
        const match = line.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
        if (match) {
          const startMinutes = parseTimeToMinutes(match[1]);
          const endMinutes = parseTimeToMinutes(match[2]);
          const duration = endMinutes - startMinutes;

          if (line.toLowerCase().includes('homeoffice')) {
            totalHomeOfficeHours += duration;
            
            if (isWeekend || holiday) {
              totalHomeOfficeHoursOutsideNormalTime += duration;
            } else {
              const overlapStart = Math.max(startMinutes, NORMAL_WORK_START);
              const overlapEnd = Math.min(endMinutes, NORMAL_WORK_END);
              if (overlapEnd > overlapStart) {
                totalHomeOfficeHoursInNormalTime += (overlapEnd - overlapStart);
              }
              if (startMinutes < NORMAL_WORK_START) {
                totalHomeOfficeHoursOutsideNormalTime += Math.min(endMinutes, NORMAL_WORK_START) - startMinutes;
              }
              if (endMinutes > NORMAL_WORK_END) {
                totalHomeOfficeHoursOutsideNormalTime += endMinutes - Math.max(startMinutes, NORMAL_WORK_END);
              }
            }
          } else {
            totalOfficeHours += duration;
          }
        }
      });
    });

    const totalHours = totalHomeOfficeHours + totalOfficeHours;
    const hoHoursPercentage = totalHours > 0 ? (totalHomeOfficeHours / totalHours) * 100 : 0;
    
    const totalDays = homeOfficeDaysWorkdays + pureOfficeDays + hybridDays;
    const hoDaysPercentage = totalDays > 0 ? ((homeOfficeDaysWorkdays + hybridDays) / totalDays) * 100 : 0;

    setHomeOfficeStats({
      homeOfficeDaysWorkdays,
      homeOfficeDaysWeekendsAndHolidays,
      totalHomeOfficeHoursInNormalTime,
      totalHomeOfficeHoursOutsideNormalTime,
      pureOfficeDays,
      hybridDays,
      hoHoursPercentage,
      hoDaysPercentage,
    });
  }, [yearData, holidays]);

  return homeOfficeStats;
};
