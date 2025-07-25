import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Settings, Download, Upload } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface DataManagementProps {
  handleExportData: () => void;
  handleImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClearAllData: () => void;
  handleWebdeskImport: (text: string) => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({
  handleExportData,
  handleImportData,
  handleClearAllData,
  handleWebdeskImport,
}) => {
  const [webdeskInput, setWebdeskInput] = useState('');

  const onWebdeskImport = () => {
    handleWebdeskImport(webdeskInput);
    setWebdeskInput('');
  };

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
            <Button variant="outline" className="w-full">
              Webdesk Import
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Webdesk Daten importieren</AlertDialogTitle>
              <AlertDialogDescription>
                Geh in die Webdesk Monatsjournal Ansicht und geh auf -> Druck. Kopiere die Daten von "Datum" bis zur letzten Zeit (0:00) und füge sie hier ein. Klicke dann auf "Importieren". Mach dies pro Monat einzeln. Bestehende Daten werden überschrieben.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Textarea
              placeholder="Hier die Daten aus Webdesk Ansicht Druck einfügen..."
              value={webdeskInput}
              onChange={(e) => setWebdeskInput(e.target.value)}
              rows={10}
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={onWebdeskImport}>
                Importieren
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
