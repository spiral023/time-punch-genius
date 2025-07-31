import React, { useState, useRef, useCallback } from 'react';
import { Database, Download, Upload, FileUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useDropzone } from 'react-dropzone';
import { useTimeCalculatorContext } from '@/features/time-calculator/contexts/TimeCalculatorContext';

export const ImportExportMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [webdeskDialogOpen, setWebdeskDialogOpen] = useState(false);
  const importRef = useRef<HTMLLabelElement>(null);

  const {
    handleExportData,
    handleImportData,
    handleClearAllData,
    handleWebdeskImport,
  } = useTimeCalculatorContext();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleWebdeskImport(acceptedFiles);
    setWebdeskDialogOpen(false);
  }, [handleWebdeskImport]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  });

  const handleImportClick = () => {
    importRef.current?.click();
    setOpen(false);
  };

  const handleExportClick = () => {
    handleExportData();
    setOpen(false);
  };

  const handleWebdeskImportClick = () => {
    setOpen(false);
    setWebdeskDialogOpen(true);
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Database className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="start">
              <div className="p-4 space-y-2">
                <h4 className="font-medium text-sm mb-3">Daten-Management</h4>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleExportClick}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Backup
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleImportClick}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import Backup
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleWebdeskImportClick}
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  Webdesk Import
                </Button>
                
                <div className="pt-2 border-t">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
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
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </TooltipTrigger>
        <TooltipContent>
          <p>Import/Export und Datenverwaltung</p>
        </TooltipContent>
      </Tooltip>

      {/* Hidden file input for import */}
      <label ref={importRef} className="hidden">
        <input 
          type="file" 
          accept=".json" 
          className="hidden" 
          onChange={handleImportData} 
        />
      </label>

      {/* Webdesk Import Dialog */}
      <Dialog open={webdeskDialogOpen} onOpenChange={setWebdeskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Webdesk-Dateien importieren</DialogTitle>
            <DialogDescription>
              Ziehen Sie eine oder mehrere XLSX-Dateien hierher oder klicken Sie, um Dateien auszuwählen.
            </DialogDescription>
          </DialogHeader>
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
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Schließen</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
