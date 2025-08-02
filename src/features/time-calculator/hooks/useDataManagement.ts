import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { processWebdeskFile, ProcessedData, Statistics } from '@/lib/webdeskUtils';
import { migrateOldStatistics, saveStatisticsForYear, ensureStatisticsForAllYears, regenerateStatisticsForYear } from '@/lib/statisticsUtils';

const formatDateKey = (date: Date): string => `zehelper_data_${date.toISOString().split('T')[0]}`;

export const useDataManagement = () => {
  const { toast } = useToast();

  // Run migration on hook initialization
  React.useEffect(() => {
    const runMigrationAndEnsureStats = async () => {
      const MIGRATION_FLAG = 'zehelper_migration_v2_completed';
      
      // Check if migration has already been completed
      if (localStorage.getItem(MIGRATION_FLAG)) {
        return; // Migration already completed
      }
      
      console.log('Running migration and statistics generation...');
      
      // Run migration
      migrateOldStatistics();
      
      // Regenerate statistics for 2024 to fix potential double-counting issues
      const currentYear = new Date().getFullYear();
      if (currentYear >= 2024) {
        console.log('Regenerating statistics for 2024 to fix potential issues...');
        await regenerateStatisticsForYear(2024);
      }
      
      // Ensure statistics exist for all other years
      await ensureStatisticsForAllYears();
      
      // Mark migration as completed
      localStorage.setItem(MIGRATION_FLAG, 'true');
      console.log('Migration and statistics generation completed');
    };
    
    runMigrationAndEnsureStats();
  }, []);

  const handleWebdeskImport = async (files: File[]) => {
    if (!files || files.length === 0) return;

    try {
      let allProcessedData: ProcessedData = {};
      const allStatisticsByYear: { [year: number]: Statistics } = {};

      for (const file of files) {
        const { processedData, statistics } = await processWebdeskFile(file);
        allProcessedData = { ...allProcessedData, ...processedData };
        
        // Merge statistics by year
        Object.keys(statistics).forEach(yearStr => {
          const year = parseInt(yearStr, 10);
          const yearStats = statistics[year];
          
          if (!allStatisticsByYear[year]) {
            allStatisticsByYear[year] = {
              homeOfficeDaysWorkdays: 0,
              homeOfficeDaysWeekendsAndHolidays: 0,
              pureOfficeDays: 0,
              hybridDays: 0,
              totalWorkDays: 0,
              totalHomeOfficeHours: 0,
              totalOfficeHours: 0,
              vacationDays: 0,
            };
          }
          
          // Merge statistics for this year
          allStatisticsByYear[year].homeOfficeDaysWorkdays += yearStats.homeOfficeDaysWorkdays;
          allStatisticsByYear[year].homeOfficeDaysWeekendsAndHolidays += yearStats.homeOfficeDaysWeekendsAndHolidays;
          allStatisticsByYear[year].pureOfficeDays += yearStats.pureOfficeDays;
          allStatisticsByYear[year].hybridDays += yearStats.hybridDays;
          allStatisticsByYear[year].totalWorkDays += yearStats.totalWorkDays;
          allStatisticsByYear[year].totalHomeOfficeHours += yearStats.totalHomeOfficeHours;
          allStatisticsByYear[year].totalOfficeHours += yearStats.totalOfficeHours;
          allStatisticsByYear[year].vacationDays += yearStats.vacationDays;
        });
      }

      Object.keys(allProcessedData).forEach(dateStr => {
        const dayData = allProcessedData[dateStr];
        const date = new Date(dateStr.split('.').reverse().join('-'));
        const key = formatDateKey(date);
        
        const reason = dayData.fullDayAbsenceReason?.toLowerCase() || '';
        if (reason.includes('urlaub')) {
          localStorage.setItem(key, 'Urlaub');
        } else if (reason.includes('krank')) {
          localStorage.setItem(key, 'Krankenstand');
        } else if (reason.includes('pflege')) {
          localStorage.setItem(key, 'Pflegeurlaub');
        } else if (reason.includes('betriebsrat')) {
          localStorage.setItem(key, 'Betriebsratsarbeit');
        } else if (reason.includes('schulung') || reason.includes('seminar')) {
          localStorage.setItem(key, 'Schulung');
        } else if (reason.includes('sonderurlaub')) {
          localStorage.setItem(key, 'Sonderurlaub');
        } else if (reason.includes('berufsschule')) {
          localStorage.setItem(key, 'Berufsschule');
        } else if (reason.includes('hochzeit')) {
          localStorage.setItem(key, 'Hochzeit');
        } else if (reason.includes('todesfall')) {
          localStorage.setItem(key, 'Todesfall');
        }
        else {
          const timeEntriesString = dayData.timeEntries.map(e => `${e.start} - ${e.end} ${e.reason.trim()}`).join('\n');
          if (timeEntriesString) {
            localStorage.setItem(key, timeEntriesString);
          }
        }
      });

      // Save year-specific statistics
      Object.keys(allStatisticsByYear).forEach(yearStr => {
        const year = parseInt(yearStr, 10);
        saveStatisticsForYear(year, allStatisticsByYear[year]);
      });

      const importedYears = Object.keys(allStatisticsByYear).map(Number).sort();
      const yearText = importedYears.length === 1 
        ? `Jahr ${importedYears[0]}` 
        : `Jahre ${importedYears.join(', ')}`;

      toast({
        title: `${files.length} Webdesk-Dateien importiert`,
        description: `Daten für ${yearText} wurden erfolgreich verarbeitet. Die Anwendung wird neu geladen.`,
      });

      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error(error);
      toast({
        title: 'Import fehlgeschlagen',
        description: 'Die ausgewählte Datei konnte nicht verarbeitet werden.',
        variant: 'destructive',
      });
    }
  };

  const handleExportData = () => {
    const data: { [key: string]: string } = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('zehelper_')) {
        data[key] = localStorage.getItem(key) || '';
      }
    });
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zehelper-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Daten exportiert',
      description: 'Ihre Daten wurden erfolgreich als JSON-Datei heruntergeladen.',
    });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const data = JSON.parse(json);
        
        if (typeof data !== 'object' || data === null) {
          throw new Error('Ungültiges Format');
        }

        Object.keys(data).forEach(key => {
          if (key.startsWith('zehelper_')) {
            localStorage.setItem(key, data[key]);
          }
        });

        toast({
          title: 'Daten importiert',
          description: 'Ihre Daten wurden erfolgreich importiert. Die Anwendung wird neu geladen.',
        });

        setTimeout(() => {
          window.location.reload();
        }, 1000);

      } catch (error) {
        toast({
          title: 'Import fehlgeschlagen',
          description: 'Die ausgewählte Datei ist keine gültige Backup-Datei.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('zehelper_')) {
        localStorage.removeItem(key);
      }
    });
    toast({
      title: 'Alle Daten gelöscht',
      description: 'Die Anwendung wird neu geladen.',
    });
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return {
    handleExportData,
    handleImportData,
    handleClearAllData,
    handleWebdeskImport,
  };
};
