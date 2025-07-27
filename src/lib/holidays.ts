// src/lib/holidays.ts

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

const holidayCache: { [key: string]: Holiday[] } = {};

export const getHolidays = async (year: number, countryCode: string): Promise<Holiday[]> => {
  const cacheKey = `${year}-${countryCode}`;
  if (holidayCache[cacheKey]) {
    return holidayCache[cacheKey];
  }

  try {
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
    if (!response.ok) {
      throw new Error('Failed to fetch holidays');
    }
    const holidays: Holiday[] = await response.json();
    holidayCache[cacheKey] = holidays;
    return holidays;
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return [];
  }
};

export const isHoliday = (date: Date, holidays: Holiday[]): boolean => {
  const adjustedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  const dateString = adjustedDate.toISOString().split('T')[0];
  return holidays.some(holiday => holiday.date === dateString);
};
