import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Info } from 'lucide-react';
import { InfoDialog } from './InfoDialog';

const InfoCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Infos
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
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
          </div>
        </InfoDialog>
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
