import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Hand, Upload, FileText, Sparkles, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAppSettings } from '@/hooks/useAppSettings';

const WELCOME_KEY = 'zehelper_welcome_seen_v2';

interface WelcomePopupProps {
  onTriggerImport: () => void;
  onTriggerWebdeskImport: () => void;
}

const WelcomeStep1 = () => (
  <div className="text-center">
    <div className="flex justify-center mb-4">
      <Hand className="h-10 w-10 text-primary" />
    </div>
    <h3 className="text-xl font-semibold mb-2">Willkommen beim ZE-Helper!</h3>
    <p className="text-muted-foreground mb-6">Hier sind ein paar coole Features:</p>
    <ul className="space-y-3 text-sm text-left">
      <li className="flex items-start">
        <Sparkles className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
        <span>Automatische Berechnung der Gesamtarbeitszeit und Fortschrittsbalken mit Zieluhrzeiten & Browserbenachrichtigung.</span>
      </li>
      <li className="flex items-start">
        <ShieldCheck className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
        <span>Deine Eingaben werden nur lokal im Browser gespeichert (`localStorage`). Keine Datenübertragung an Server.</span>
      </li>
      <li className="flex items-start">
        <Sparkles className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
        <span>PS: Die Anwendung ist vollständig mit KI erstellt worden.</span>
      </li>
    </ul>
  </div>
);

const WelcomeStep2 = ({ onImportBackup, onImportWebdesk }: { onImportBackup: () => void; onImportWebdesk: () => void; }) => (
    <div className="text-center">
      <h3 className="text-xl font-semibold mb-4">Du scheinst neu hier zu sein!</h3>
      <p className="text-muted-foreground mb-6">Möchtest du zu Beginn Daten importieren? Sie werden nur bei dir am Gerät verarbeitet.</p>
      <div className="space-y-4">
        <Button className="w-full justify-start" variant="outline" onClick={onImportBackup}>
          <Upload className="h-5 w-5 mr-3" />
          Backup importieren
        </Button>
        <Button className="w-full justify-start" variant="outline" onClick={onImportWebdesk}>
          <FileText className="h-5 w-5 mr-3" />
          Webdesk Monatsjournal importieren
        </Button>
      </div>
    </div>
  );


export const WelcomePopup: React.FC<WelcomePopupProps> = ({ onTriggerImport, onTriggerWebdeskImport }) => {
  const { settings, setShowWelcomeScreen } = useAppSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [initialized, setInitialized] = useState(false);

  const handleImportBackup = () => {
    handleClose();
    setTimeout(() => {
      onTriggerImport();
    }, 500);
  };

  const handleImportWebdesk = () => {
    handleClose();
    setTimeout(() => {
      onTriggerWebdeskImport();
    }, 500);
  };

  useEffect(() => {
    // Nur beim ersten Laden initialisieren
    if (!initialized) {
      const hasSeenWelcome = localStorage.getItem(WELCOME_KEY) === 'true';
      
      // Zeige Welcome Screen NUR wenn:
      // 1. Der Benutzer den Welcome Screen noch nie gesehen hat UND
      // 2. showWelcomeScreen in den Einstellungen aktiviert ist
      if (!hasSeenWelcome && settings.showWelcomeScreen) {
        setIsOpen(true);
        setStep(0);
      }
      setInitialized(true);
    } else {
      // Nach der Initialisierung nur auf explizite Änderungen von showWelcomeScreen reagieren
      // Aber nur wenn der Welcome Screen noch nicht gesehen wurde
      const hasSeenWelcome = localStorage.getItem(WELCOME_KEY) === 'true';
      if (settings.showWelcomeScreen && !hasSeenWelcome) {
        setIsOpen(true);
        setStep(0);
      }
    }
  }, [settings.showWelcomeScreen, setShowWelcomeScreen, initialized]);

  const handleClose = () => {
    localStorage.setItem(WELCOME_KEY, 'true');
    setShowWelcomeScreen(false);
    setIsOpen(false);
  };

  const handleNext = () => {
    if (step < 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const steps = [
    <WelcomeStep1 />,
    <WelcomeStep2 onImportBackup={handleImportBackup} onImportWebdesk={handleImportWebdesk} />,
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {step === 0 ? 'Willkommen!' : 'Starthilfe'}
          </DialogTitle>
        </DialogHeader>
        <div className="transition-opacity duration-300">
          {steps[step]}
        </div>
        <DialogFooter>
          {step === 0 ? (
            <Button onClick={handleNext} className="w-full">
              Weiter <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleClose} variant="outline" className="w-full">
              Überspringen
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
