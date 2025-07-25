import { useToast } from '@/hooks/use-toast';

const formatDateKey = (date: Date): string => `zehelper_data_${date.toISOString().split('T')[0]}`;

export const useDataManagement = () => {
  const { toast } = useToast();

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
  };
};
