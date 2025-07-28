import * as XLSX from 'xlsx';
import { parseTimeToMinutes } from './timeUtils';
import { getHolidays, isHoliday, Holiday } from './holidays';

// Define the structure of a row in the Webdesk export
interface WebdeskRow {
  'Datum': string;
  'Wochentag': string;
  'von': string;
  'bis': string;
  'Fehlgründe (Code)': string;
  'Sollzeit': string;
  'geleistete Arbeitszeit': string;
}

// Define the structure for a processed day's data
export interface ProcessedDay {
  date: string;
  weekday: string;
  targetHours: number; // in minutes
  actualHours: number; // in minutes
  timeEntries: { start: string; end: string; type: 'office' | 'homeoffice' | 'absence'; reason: string }[];
  homeOfficeHoursInNormalTime: number;
  homeOfficeHoursOutsideNormalTime: number;
  fullDayAbsenceReason?: string;
}

// Define the structure for the final processed data
export interface ProcessedData {
  [date: string]: ProcessedDay;
}

export interface Statistics {
  homeOfficeDaysWorkdays: number;
  homeOfficeDaysWeekendsAndHolidays: number;
  pureOfficeDays: number;
  hybridDays: number;
  totalWorkDays: number;
  totalHomeOfficeHours: number;
  totalOfficeHours: number;
  vacationDays: number;
}

// Normal working hours
const NORMAL_WORK_START = 6 * 60; // 06:00 in minutes
const NORMAL_WORK_END = 19 * 60; // 19:00 in minutes

/**
 * Parses the Webdesk XLSX file and processes the data.
 * @param file The XLSX file to import.
 * @returns Processed data and statistics.
 */
export const processWebdeskFile = async (file: File): Promise<{ processedData: ProcessedData; statistics: Statistics }> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const json: WebdeskRow[] = XLSX.utils.sheet_to_json(worksheet);

  const groupedByDate = groupByDate(json);
  const processedData = processGroupedData(groupedByDate);

  const years = [...new Set(Object.keys(processedData).map(dateStr => new Date(dateStr.split('.').reverse().join('-')).getFullYear()))];
  const holidays = (await Promise.all(years.map(year => getHolidays(year, 'AT')))).flat();

  const statistics = calculateStatistics(processedData, holidays);

  return { processedData, statistics };
};

/**
 * Groups the raw data from the XLSX file by date.
 * @param data The raw data from the XLSX file.
 * @returns The data grouped by date.
 */
const groupByDate = (data: WebdeskRow[]): { [key: string]: WebdeskRow[] } => {
  return data.reduce((acc, row) => {
    const date = row['Datum'];
    if (date) {
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(row);
    }
    return acc;
  }, {} as { [key: string]: WebdeskRow[] });
};

/**
 * Processes the grouped data to calculate hours and other details.
 * @param groupedData The data grouped by date.
 * @returns The processed data.
 */
const processGroupedData = (groupedData: { [key: string]: WebdeskRow[] }): ProcessedData => {
  const processedData: ProcessedData = {};

  for (const dateStr in groupedData) {
    const dayEntries = groupedData[dateStr];
    const firstEntry = dayEntries[0];
    const dateParts = dateStr.split('.').map(Number);
    const date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);

    const timeEntries = dayEntries
      .filter(entry => entry.von && entry.bis)
      .map(entry => {
        const rawReason = entry['Fehlgründe (Code)'] || '';
        // Remove numbers in brackets, e.g., "Homeoffice (123)" -> "Homeoffice"
        const reason = rawReason.replace(/\s*\(\d+\)$/, '').trim();
        const type = reason.includes('Homeoffice') ? 'homeoffice' : (reason ? 'absence' : 'office');
        return { start: entry.von, end: entry.bis, type: type as 'office' | 'homeoffice' | 'absence', reason };
      });

    const fullDayAbsenceEntry = dayEntries.find(entry => (!entry.von || !entry.bis) && entry['Fehlgründe (Code)']);
    const fullDayAbsenceReason = fullDayAbsenceEntry ? (fullDayAbsenceEntry['Fehlgründe (Code)'] || '').replace(/\s*\(\d+\)$/, '').trim() : undefined;

    let homeOfficeHoursInNormalTime = 0;
    let homeOfficeHoursOutsideNormalTime = 0;

    timeEntries.filter(e => e.type === 'homeoffice').forEach(entry => {
      const startMinutes = parseTimeToMinutes(entry.start);
      const endMinutes = parseTimeToMinutes(entry.end);

      // Calculate overlap with normal working hours
      const overlapStart = Math.max(startMinutes, NORMAL_WORK_START);
      const overlapEnd = Math.min(endMinutes, NORMAL_WORK_END);

      if (overlapEnd > overlapStart) {
        homeOfficeHoursInNormalTime += (overlapEnd - overlapStart);
      }

      // Calculate time outside normal working hours
      if (startMinutes < NORMAL_WORK_START) {
        homeOfficeHoursOutsideNormalTime += Math.min(endMinutes, NORMAL_WORK_START) - startMinutes;
      }
      if (endMinutes > NORMAL_WORK_END) {
        homeOfficeHoursOutsideNormalTime += endMinutes - Math.max(startMinutes, NORMAL_WORK_END);
      }
    });

    processedData[dateStr] = {
      date: dateStr,
      weekday: firstEntry['Wochentag'],
      targetHours: firstEntry.Sollzeit ? parseTimeToMinutes(firstEntry.Sollzeit) : 0,
      actualHours: firstEntry['geleistete Arbeitszeit'] ? parseTimeToMinutes(firstEntry['geleistete Arbeitszeit']) : 0,
      timeEntries,
      homeOfficeHoursInNormalTime,
      homeOfficeHoursOutsideNormalTime,
      fullDayAbsenceReason,
    };
  }

  return processedData;
};

/**
 * Calculates statistics based on the processed data.
 * @param processedData The processed data.
 * @param holidays A list of holidays.
 * @returns The calculated statistics.
 */
const calculateStatistics = (processedData: ProcessedData, holidays: Holiday[]): Statistics => {
  let homeOfficeDaysWorkdays = 0;
  let homeOfficeDaysWeekendsAndHolidays = 0;
  let pureOfficeDays = 0;
  let hybridDays = 0;
  let totalWorkDays = 0;
  let totalHomeOfficeHours = 0;
  let totalOfficeHours = 0;
  let vacationDays = 0;

  for (const dateStr in processedData) {
    const day = processedData[dateStr];

    // Check for full-day vacation and other full-day absences
    if (day.fullDayAbsenceReason) {
      if (day.fullDayAbsenceReason.toLowerCase().includes('urlaub')) {
        vacationDays++;
      }
      // Potentially handle other absence reasons here, e.g., sick leave
      continue; // Skip further processing for full-day absences
    }

    if (day.actualHours === 0) continue;

    const dateParts = dateStr.split('.').map(Number);
    const date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const holiday = isHoliday(date, holidays);

    if (isWeekend || holiday) {
        if (day.timeEntries.some(e => e.type === 'homeoffice')) {
            homeOfficeDaysWeekendsAndHolidays++;
        }
    } else {
        totalWorkDays++;
        const hasHomeOffice = day.timeEntries.some(e => e.type === 'homeoffice');
        const hasOffice = day.timeEntries.some(e => e.type === 'office');

        if (hasHomeOffice && !hasOffice) {
            homeOfficeDaysWorkdays++;
        } else if (hasOffice && !hasHomeOffice) {
            pureOfficeDays++;
        } else if (hasHomeOffice && hasOffice) {
            hybridDays++;
        }
    }
    
    day.timeEntries.forEach(entry => {
        const duration = parseTimeToMinutes(entry.end) - parseTimeToMinutes(entry.start);
        if (entry.type === 'homeoffice') {
            totalHomeOfficeHours += duration;
        } else if (entry.type === 'office') {
            totalOfficeHours += duration;
        }
    });
  }

  return {
    homeOfficeDaysWorkdays,
    homeOfficeDaysWeekendsAndHolidays,
    pureOfficeDays,
    hybridDays,
    totalWorkDays,
    totalHomeOfficeHours,
    totalOfficeHours,
    vacationDays,
  };
};
