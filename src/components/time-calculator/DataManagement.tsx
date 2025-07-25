import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Settings, Download, Upload } from 'lucide-react';

interface DataManagementProps {
  handleExportData: () => void;
  handleImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClearAllData: () => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({
  handleExportData,
  handleImportData,
  handleClearAllData,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Datenverwaltung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" asChild>
            <label htmlFor="import-file">
              <Upload className="mr-2 h-4 w-4" />
              Import
              <input type="file" id="import-file" accept=".json" className="hidden" onChange={handleImportData} />
            </label>
          </Button>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              Alle Daten löschen
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sind Sie absolut sicher?</AlertDialogTitle>
              <AlertDialogDescription>
                Diese Aktion kann nicht rückgängig gemacht werden. Dadurch werden alle Ihre gespeicherten Zeitbuchungen und Einstellungen dauerhaft von diesem Gerät gelöscht.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearAllData}>
                Fortfahren
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};
