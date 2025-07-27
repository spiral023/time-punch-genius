import React, { useCallback, useImperativeHandle, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Settings, Download, Upload, FileUp } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CardManager } from '@/components/CardManager';

interface DataManagementProps {
  handleExportData: () => void;
  handleImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClearAllData: () => void;
  handleWebdeskImport: (files: File[]) => void;
}

export interface DataManagementHandles {
  triggerImport: () => void;
  triggerWebdeskImport: () => void;
}

export const DataManagement = React.forwardRef<DataManagementHandles, DataManagementProps>(({
  handleExportData,
  handleImportData,
  handleClearAllData,
  handleWebdeskImport,
}, ref) => {
  const importRef = useRef<HTMLLabelElement>(null);
  const webdeskImportTriggerRef = useRef<HTMLButtonElement>(null);

  useImperativeHandle(ref, () => ({
    triggerImport: () => {
      importRef.current?.click();
    },
    triggerWebdeskImport: () => {
      webdeskImportTriggerRef.current?.click();
    },
  }));

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleWebdeskImport(acceptedFiles);
  }, [handleWebdeskImport]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  });

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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Exportiert ein Backup aller Daten aus dem Browser-Cache.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" asChild>
                  <label htmlFor="import-file" ref={importRef}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                    <input type="file" id="import-file" accept=".json" className="hidden" onChange={handleImportData} />
                  </label>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Importiert ein ZE-Helper .json Backup in die Webanwendung.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full" ref={webdeskImportTriggerRef}>
              Webdesk Import (XLSX)
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Webdesk-Dateien importieren</AlertDialogTitle>
              <AlertDialogDescription>
                Ziehen Sie eine oder mehrere XLSX-Dateien hierher oder klicken Sie, um Dateien auszuwählen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div
              {...getRootProps()}
              className={`mt-4 p-8 border-2 border-dashed rounded-lg text-center cursor-pointer ${
                isDragActive ? 'border-primary' : 'border-muted-foreground'
              }`}
            >
              <input {...getInputProps()} />
              <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
              {isDragActive ? (
                <p className="mt-2">Dateien hier ablegen...</p>
              ) : (
                <p className="mt-2">Dateien hierher ziehen oder klicken, um sie auszuwählen</p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Schließen</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <CardManager />
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
});
