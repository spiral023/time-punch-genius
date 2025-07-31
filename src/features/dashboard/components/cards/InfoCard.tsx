import React from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { InfoDialog } from '../InfoDialog';
import { useBrowserNotifications } from '@/hooks/useBrowserNotifications';
import { useAppSettings } from '@/hooks/useAppSettings';

const InfoCard: React.FC = () => {
  const { showBrowserNotification } = useBrowserNotifications();
  const { setShowWelcomeScreen } = useAppSettings();

  const handleShowWelcome = () => {
    // Setze den localStorage-Wert zurück, damit der Welcome Dialog angezeigt wird
    localStorage.removeItem('zehelper_welcome_seen_v2');
    setShowWelcomeScreen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Infos
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button onClick={handleShowWelcome}>
          Einleitung wiederholen
        </Button>
        <Button asChild>
          <a href="mailto:philipp.asanger@gmail.com">Feedback</a>
        </Button>
        <Button asChild>
          <a
            href="https://www.wko.at/oe/kollektivvertrag/kv-informationstechnologie-2025.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            IT-KV 2025
          </a>
        </Button>
        <InfoDialog triggerText="Impressum" title="Impressum">
          <div>
            <p>
              <strong>Verantwortlich für den Inhalt:</strong>
            </p>
            <p>
              Philipp Asanger
              <br />
              Karl-Renner-Str. 3
              <br />
              4040 Linz
            </p>
            <p>
              <strong>Kontakt:</strong>
            </p>
            <p>
              E-Mail: philipp.asanger@gmail.com
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Danke an Thomas, Wolfgang & Dominik für euren Support!
            </p>
          </div>
        </InfoDialog>
        <Button
          onClick={() => {
            showBrowserNotification(
              'Test-Benachrichtigung',
              'Dies ist eine Testbenachrichtigung von deinem Browser.',
            );
          }}
        >
          Test Browser Alert
        </Button>
        <Button
          onClick={() => {
            setTimeout(() => {
              toast('Test-Benachrichtigung', {
                description: 'Dies ist eine Testbenachrichtigung.',
              });
            }, 1000);
          }}
        >
          Test Toast Alert
        </Button>
        <InfoDialog triggerText="Datenschutz" title="Datenschutz">
          <div>
            <p>
              <strong>Datenschutzerklärung</strong>
            </p>
            <p>
              Ich lege großen Wert auf den Schutz deiner Daten. Die Nutzung der Webseite ist ohne Angabe personenbezogener Daten möglich. Daten werden nur lokal verarbeitet und verlassen zu keinem Zeitpunkt den Browser.
            </p>
          </div>
        </InfoDialog>
      </CardContent>
    </Card>
  );
};

export default InfoCard;
