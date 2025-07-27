import { useToast } from '@/hooks/use-toast';
import { processWebdeskFile, ProcessedData, Statistics } from '@/lib/webdeskUtils';

const formatDateKey = (date: Date): string => `zehelper_data_${date.toISOString().split('T')[0]}`;

export const useDataManagement = () => {
  const { toast } = useToast();

  const handleWebdeskImport = async (files: File[]) => {
    if (!files || files.length === 0) return;

    try {
      let allProcessedData: ProcessedData = {};
      const allStatistics: Statistics = {
        homeOfficeDaysWorkdays: 0,
        homeOfficeDaysWeekendsAndHolidays: 0,
        pureOfficeDays: 0,
        hybridDays: 0,
        totalWorkDays: 0,
        totalHomeOfficeHours: 0,
        totalOfficeHours: 0,
      };

      for (const file of files) {
        const { processedData, statistics } = await processWebdeskFile(file);
        allProcessedData = { ...allProcessedData, ...processedData };
        
        // Merge statistics
        allStatistics.homeOfficeDaysWorkdays += statistics.homeOfficeDaysWorkdays;
        allStatistics.homeOfficeDaysWeekendsAndHolidays += statistics.homeOfficeDaysWeekendsAndHolidays;
        allStatistics.pureOfficeDays += statistics.pureOfficeDays;
        allStatistics.hybridDays += statistics.hybridDays;
        allStatistics.totalWorkDays += statistics.totalWorkDays;
        allStatistics.totalHomeOfficeHours += statistics.totalHomeOfficeHours;
        allStatistics.totalOfficeHours += statistics.totalOfficeHours;
      }

      Object.keys(allProcessedData).forEach(dateStr => {
        const dayData = allProcessedData[dateStr];
        const date = new Date(dateStr.split('.').reverse().join('-'));
        const key = formatDateKey(date);
        const timeEntriesString = dayData.timeEntries.map(e => `${e.start} - ${e.end} ${e.reason.trim()}`).join('\n');
        localStorage.setItem(key, timeEntriesString);
      });

      localStorage.setItem('zehelper_statistics', JSON.stringify(allStatistics));

      toast({
        title: `${files.length} Webdesk-Dateien importiert`,
        description: 'Ihre Daten wurden erfolgreich verarbeitet. Die Anwendung wird neu geladen.',
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
