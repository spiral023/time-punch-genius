import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Palette, BarChart3, Lock, GitBranch, ChevronLeft, ChevronRight } from 'lucide-react';

const WELCOME_KEY = 'zehelper_welcome_seen';

const features = [
  {
    icon: <Rocket className="h-8 w-8 text-primary" />,
    title: 'Hauptfunktionen',
    content: [
      'Zeitbuchungen (z.B. `08:00 - 12:00` oder `13:00`) ins Textfeld kopieren.',
      'Automatische Berechnung der Gesamtarbeitszeit.',
      'Einzelzeiten werden live bis zur aktuellen Browser-Uhrzeit ergänzt.',
      'Fortschrittsbalken für 6h, 7.7h und 10h mit Zieluhrzeiten.',
      'Browser-Benachrichtigungen für wichtige Zeitmarken (optional auch früher).',
    ],
  },
  {
    icon: <Palette className="h-8 w-8 text-primary" />,
    title: 'Design & Bedienung',
    content: [
      'Modernes, aufgeräumtes Design mit Dark Mode.',
      'Ein-Klick-Reset für einen neuen Arbeitstag.',
      'Farbige Anzeige der Arbeitszeit zur schnellen Orientierung.',
      'Automatischer Hinweis auf gesetzliche Pausenzeiten.',
    ],
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    title: 'Zusätzliche Funktionen',
    content: [
        'Wöchentliche Übersicht als Balkendiagramm.',
        'Darstellung aller Zeiten im Format HH:mm.',
        'Aktuelle Uhrzeit wird außerhalb der Normalarbeitszeit rot dargestellt.',
    ],
  },
  {
    icon: <Lock className="h-8 w-8 text-primary" />,
    title: 'Datenschutz',
    content: [
      'Deine Eingaben werden nur lokal im Browser gespeichert (`localStorage`).',
      'Keine Datenübertragung an Server – alles bleibt privat.',
    ],
  },
  {
    icon: <GitBranch className="h-8 w-8 text-primary" />,
    title: 'Offen & transparent',
    content: [
      'Der Quellcode ist vollständig KI-generiert.',
      'Öffentlich einsehbar auf GitHub.',
    ],
  },
];

export const WelcomePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem(WELCOME_KEY);
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(WELCOME_KEY, 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (step < features.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const currentFeature = features[step];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold text-center">
            Willkommen beim ZE-Helper!
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-4">{currentFeature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{currentFeature.title}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                {currentFeature.content.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
        <DialogFooter className="p-6 pt-4 flex justify-between w-full">
          {step > 0 ? (
            <Button variant="outline" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Zurück
            </Button>
          ) : (
            <div /> 
          )}
          <Button onClick={handleNext}>
            {step === features.length - 1 ? 'Fertig' : 'Weiter'}
            {step < features.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
