import { YearlyStatistics } from '@/types';

/**
 * Get statistics for a specific year from localStorage
 */
export const getStatisticsForYear = (year: number): YearlyStatistics | null => {
  try {
    const key = `zehelper_statistics_${year}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    return {
      year,
      ...parsed,
      lastUpdated: parsed.lastUpdated || new Date().toISOString()
    };
  } catch (error) {
    console.error(`Failed to load statistics for year ${year}:`, error);
    return null;
  }
};

/**
 * Save statistics for a specific year to localStorage
 */
export const saveStatisticsForYear = (year: number, stats: Omit<YearlyStatistics, 'year' | 'lastUpdated'>): void => {
  try {
    const key = `zehelper_statistics_${year}`;
    const statisticsToSave: YearlyStatistics = {
      ...stats,
      year,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(key, JSON.stringify(statisticsToSave));
  } catch (error) {
    console.error(`Failed to save statistics for year ${year}:`, error);
  }
};

/**
 * Get all available statistics years from localStorage
 */
export const getAvailableStatisticsYears = (): number[] => {
  const years: number[] = [];
  
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('zehelper_statistics_')) {
        const yearStr = key.replace('zehelper_statistics_', '');
        const year = parseInt(yearStr, 10);
        if (!isNaN(year)) {
          years.push(year);
        }
      }
    });
    
    return years.sort((a, b) => b - a); // Sort descending (newest first)
  } catch (error) {
    console.error('Failed to get available statistics years:', error);
    return [];
  }
};

/**
 * Merge statistics across multiple years
 */
export const mergeStatisticsAcrossYears = (years: number[]): YearlyStatistics => {
  const merged: YearlyStatistics = {
    year: 0, // Indicates merged data
    homeOfficeDaysWorkdays: 0,
    homeOfficeDaysWeekendsAndHolidays: 0,
    pureOfficeDays: 0,
    hybridDays: 0,
    totalWorkDays: 0,
    totalHomeOfficeHours: 0,
    totalOfficeHours: 0,
    vacationDays: 0,
    lastUpdated: new Date().toISOString()
  };

  years.forEach(year => {
    const yearStats = getStatisticsForYear(year);
    if (yearStats) {
      merged.homeOfficeDaysWorkdays += yearStats.homeOfficeDaysWorkdays;
      merged.homeOfficeDaysWeekendsAndHolidays += yearStats.homeOfficeDaysWeekendsAndHolidays;
      merged.pureOfficeDays += yearStats.pureOfficeDays;
      merged.hybridDays += yearStats.hybridDays;
      merged.totalWorkDays += yearStats.totalWorkDays;
      merged.totalHomeOfficeHours += yearStats.totalHomeOfficeHours;
      merged.totalOfficeHours += yearStats.totalOfficeHours;
      merged.vacationDays += yearStats.vacationDays;
    }
  });

  return merged;
};

/**
 * Migrate old statistics format to year-specific format
 */
export const migrateOldStatistics = (): void => {
  try {
    const oldStats = localStorage.getItem('zehelper_statistics');
    if (!oldStats) return;

    const parsed = JSON.parse(oldStats);
    
    // Try to determine the year from existing data or use current year as fallback
    const currentYear = new Date().getFullYear();
    let targetYear = currentYear;
    
    // Try to find the most recent year from daily data
    const dailyDataKeys = Object.keys(localStorage).filter(key => key.startsWith('zehelper_data_'));
    if (dailyDataKeys.length > 0) {
      const years = dailyDataKeys.map(key => {
        const dateStr = key.replace('zehelper_data_', '');
        return new Date(dateStr).getFullYear();
      }).filter(year => !isNaN(year));
      
      if (years.length > 0) {
        targetYear = Math.max(...years);
      }
    }

    // Save to year-specific key
    saveStatisticsForYear(targetYear, parsed);
    
    // Remove old key
    localStorage.removeItem('zehelper_statistics');
    
    console.log(`Migrated statistics to year ${targetYear}`);
  } catch (error) {
    console.error('Failed to migrate old statistics:', error);
  }
};

/**
 * Update statistics for a specific year by merging with existing data
 * WARNING: This function adds values together - use with caution to avoid double-counting
 */
export const updateStatisticsForYear = (year: number, newStats: Omit<YearlyStatistics, 'year' | 'lastUpdated'>): void => {
  const existing = getStatisticsForYear(year);
  
  if (existing) {
    // Merge with existing statistics (add values together)
    const merged = {
      homeOfficeDaysWorkdays: existing.homeOfficeDaysWorkdays + newStats.homeOfficeDaysWorkdays,
      homeOfficeDaysWeekendsAndHolidays: existing.homeOfficeDaysWeekendsAndHolidays + newStats.homeOfficeDaysWeekendsAndHolidays,
      pureOfficeDays: existing.pureOfficeDays + newStats.pureOfficeDays,
      hybridDays: existing.hybridDays + newStats.hybridDays,
      totalWorkDays: existing.totalWorkDays + newStats.totalWorkDays,
      totalHomeOfficeHours: existing.totalHomeOfficeHours + newStats.totalHomeOfficeHours,
      totalOfficeHours: existing.totalOfficeHours + newStats.totalOfficeHours,
      vacationDays: existing.vacationDays + newStats.vacationDays,
    };
    
    saveStatisticsForYear(year, merged);
  } else {
    // No existing data, save as new
    saveStatisticsForYear(year, newStats);
  }
};

/**
 * Safely regenerate statistics for a year by deleting existing ones first
 */
export const regenerateStatisticsForYear = async (year: number): Promise<void> => {
  try {
    console.log(`Regenerating statistics for year ${year}...`);
    
    // Delete existing statistics to prevent double-counting
    deleteStatisticsForYear(year);
    
    // Generate fresh statistics
    await generateStatisticsForYear(year);
    
    console.log(`Successfully regenerated statistics for year ${year}`);
  } catch (error) {
    console.error(`Failed to regenerate statistics for year ${year}:`, error);
  }
};

/**
 * Delete statistics for a specific year
 */
export const deleteStatisticsForYear = (year: number): void => {
  try {
    const key = `zehelper_statistics_${year}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to delete statistics for year ${year}:`, error);
  }
};

/**
 * Generate and save statistics for a year based on daily data
 */
export const generateStatisticsForYear = async (year: number): Promise<void> => {
  try {
    // Check if statistics already exist
    if (getStatisticsForYear(year)) {
      return; // Statistics already exist
    }

    // Get all daily data for the year
    const yearData: { [key: string]: string } = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('zehelper_data_')) {
        const dateStr = key.replace('zehelper_data_', '');
        const date = new Date(dateStr);
        if (date.getFullYear() === year) {
          const data = localStorage.getItem(key);
          if (data) {
            yearData[dateStr] = data;
          }
        }
      }
    });

    // If no data for this year, don't create empty statistics
    if (Object.keys(yearData).length === 0) {
      return;
    }

    // Import holidays for the year
    const { getHolidays, isHoliday } = await import('@/lib/holidays');
    const holidays = await getHolidays(year, 'AT');

    // Calculate statistics
    let homeOfficeDaysWorkdays = 0;
    let homeOfficeDaysWeekendsAndHolidays = 0;
    let pureOfficeDays = 0;
    let hybridDays = 0;
    let totalWorkDays = 0;
    let totalHomeOfficeHours = 0;
    let totalOfficeHours = 0;
    let vacationDays = 0;
    let totalHomeOfficeHoursInNormalTime = 0;
    let totalHomeOfficeHoursOutsideNormalTime = 0;

    const NORMAL_WORK_START = 6 * 60; // 06:00 in minutes
    const NORMAL_WORK_END = 19 * 60; // 19:00 in minutes

    const { parseTimeToMinutes } = await import('@/lib/timeUtils');

    Object.keys(yearData).forEach(dateKey => {
      const input = yearData[dateKey];
      if (!input) return;

      const date = new Date(dateKey);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const holiday = isHoliday(date, holidays);

      // Check for vacation days
      if (input.toLowerCase().includes('urlaub')) {
        vacationDays++;
        return;
      }

      // Skip other special day types for work statistics
      if (input.toLowerCase().includes('krank') || 
          input.toLowerCase().includes('pflege') ||
          input.toLowerCase().includes('betriebsrat') ||
          input.toLowerCase().includes('schulung') ||
          input.toLowerCase().includes('sonderurlaub') ||
          input.toLowerCase().includes('berufsschule') ||
          input.toLowerCase().includes('hochzeit') ||
          input.toLowerCase().includes('todesfall')) {
        return;
      }

      const lines = input.split('\n');
      const hasHomeOffice = lines.some(line => line.toLowerCase().includes('homeoffice'));
      const hasOffice = lines.some(line => !line.toLowerCase().includes('homeoffice') && line.match(/\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}/));

      if (isWeekend || holiday) {
        if (hasHomeOffice) homeOfficeDaysWeekendsAndHolidays++;
      } else {
        if (hasHomeOffice && !hasOffice) {
          homeOfficeDaysWorkdays++;
          totalWorkDays++;
        } else if (hasOffice && !hasHomeOffice) {
          pureOfficeDays++;
          totalWorkDays++;
        } else if (hasHomeOffice && hasOffice) {
          hybridDays++;
          totalWorkDays++;
        } else if (hasOffice || hasHomeOffice) {
          totalWorkDays++;
        }
      }

      lines.forEach(line => {
        const match = line.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
        if (match) {
          const startMinutes = parseTimeToMinutes(match[1]);
          const endMinutes = parseTimeToMinutes(match[2]);
          const duration = endMinutes - startMinutes;

          if (line.toLowerCase().includes('homeoffice')) {
            totalHomeOfficeHours += duration;
            
            // Calculate detailed home office time breakdown
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

    // Save the calculated statistics
    const statistics = {
      homeOfficeDaysWorkdays,
      homeOfficeDaysWeekendsAndHolidays,
      pureOfficeDays,
      hybridDays,
      totalWorkDays,
      totalHomeOfficeHours,
      totalOfficeHours,
      vacationDays,
      totalHomeOfficeHoursInNormalTime,
      totalHomeOfficeHoursOutsideNormalTime,
    };

    // Validate statistics for plausibility
    const totalHours = totalHomeOfficeHours + totalOfficeHours;
    const avgHoursPerDay = totalWorkDays > 0 ? totalHours / totalWorkDays : 0;
    
    console.log(`Generated statistics for year ${year}:`);
    console.log(`- Days processed: ${Object.keys(yearData).length}`);
    console.log(`- Total work days: ${totalWorkDays}`);
    console.log(`- Total hours: ${Math.round(totalHours / 60)} (${totalHours} minutes)`);
    console.log(`- Average hours per day: ${Math.round(avgHoursPerDay / 60 * 100) / 100}`);
    console.log(`- Home office hours: ${Math.round(totalHomeOfficeHours / 60)}`);
    console.log(`- Office hours: ${Math.round(totalOfficeHours / 60)}`);
    
    // Warn about unrealistic values
    if (avgHoursPerDay > 16 * 60) { // More than 16 hours per day
      console.warn(`⚠️  Unrealistic average hours per day detected for year ${year}: ${Math.round(avgHoursPerDay / 60)} hours`);
    }
    
    if (totalHours > 3000 * 60) { // More than 3000 hours per year
      console.warn(`⚠️  Unrealistic total hours detected for year ${year}: ${Math.round(totalHours / 60)} hours`);
    }

    saveStatisticsForYear(year, statistics);

  } catch (error) {
    console.error(`Failed to generate statistics for year ${year}:`, error);
  }
};

/**
 * Ensure statistics exist for all years that have daily data
 */
export const ensureStatisticsForAllYears = async (): Promise<void> => {
  try {
    // Get all years that have daily data
    const yearsWithData = new Set<number>();
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('zehelper_data_')) {
        const dateStr = key.replace('zehelper_data_', '');
        const date = new Date(dateStr);
        const year = date.getFullYear();
        if (!isNaN(year)) {
          yearsWithData.add(year);
        }
      }
    });

    // Generate statistics for years that don't have them
    for (const year of yearsWithData) {
      await generateStatisticsForYear(year);
    }
  } catch (error) {
    console.error('Failed to ensure statistics for all years:', error);
  }
};

/**
 * Create a debug report for statistics and daily data
 */
export const createStatisticsDebugReport = (): void => {
  console.log('=== STATISTICS DEBUG REPORT ===');
  
  // Get all years with daily data
  const yearsWithData = new Map<number, number>();
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('zehelper_data_')) {
      const dateStr = key.replace('zehelper_data_', '');
      const date = new Date(dateStr);
      const year = date.getFullYear();
      if (!isNaN(year)) {
        yearsWithData.set(year, (yearsWithData.get(year) || 0) + 1);
      }
    }
  });

  // Get all years with statistics
  const yearsWithStats = new Set<number>();
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('zehelper_statistics_')) {
      const yearStr = key.replace('zehelper_statistics_', '');
      const year = parseInt(yearStr, 10);
      if (!isNaN(year)) {
        yearsWithStats.add(year);
      }
    }
  });

  console.log('\n--- DAILY DATA SUMMARY ---');
  Array.from(yearsWithData.entries())
    .sort(([a], [b]) => a - b)
    .forEach(([year, count]) => {
      console.log(`${year}: ${count} days of data`);
    });

  console.log('\n--- STATISTICS SUMMARY ---');
  Array.from(yearsWithStats)
    .sort((a, b) => a - b)
    .forEach(year => {
      const stats = getStatisticsForYear(year);
      if (stats) {
        const totalHours = stats.totalHomeOfficeHours + stats.totalOfficeHours;
        const avgHoursPerDay = stats.totalWorkDays > 0 ? totalHours / stats.totalWorkDays : 0;
        
        console.log(`${year}:`);
        console.log(`  - Work days: ${stats.totalWorkDays}`);
        console.log(`  - Total hours: ${Math.round(totalHours / 60)} (${totalHours} minutes)`);
        console.log(`  - Avg hours/day: ${Math.round(avgHoursPerDay / 60 * 100) / 100}`);
        console.log(`  - Home office: ${Math.round(stats.totalHomeOfficeHours / 60)}h`);
        console.log(`  - Office: ${Math.round(stats.totalOfficeHours / 60)}h`);
        console.log(`  - Last updated: ${stats.lastUpdated}`);
        
        if (avgHoursPerDay > 16 * 60) {
          console.warn(`  ⚠️  SUSPICIOUS: Average ${Math.round(avgHoursPerDay / 60)} hours/day`);
        }
      }
    });

  console.log('\n--- MISSING STATISTICS ---');
  yearsWithData.forEach((count, year) => {
    if (!yearsWithStats.has(year)) {
      console.log(`${year}: Has ${count} days of data but no statistics`);
    }
  });

  console.log('\n--- ORPHANED STATISTICS ---');
  yearsWithStats.forEach(year => {
    if (!yearsWithData.has(year)) {
      console.log(`${year}: Has statistics but no daily data`);
    }
  });

  console.log('\n=== END DEBUG REPORT ===');
};

/**
 * Force regenerate all statistics (use with caution)
 */
export const forceRegenerateAllStatistics = async (): Promise<void> => {
  console.log('🔄 Force regenerating all statistics...');
  
  // Get all years with daily data
  const yearsWithData = new Set<number>();
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('zehelper_data_')) {
      const dateStr = key.replace('zehelper_data_', '');
      const date = new Date(dateStr);
      const year = date.getFullYear();
      if (!isNaN(year)) {
        yearsWithData.add(year);
      }
    }
  });

  // Delete all existing statistics
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('zehelper_statistics_')) {
      localStorage.removeItem(key);
    }
  });

  // Regenerate statistics for all years
  for (const year of yearsWithData) {
    await generateStatisticsForYear(year);
  }

  console.log('✅ All statistics regenerated');
};
