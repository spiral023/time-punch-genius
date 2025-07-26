export interface Tip {
  title: string;
  description: string;
}

export const tips: Tip[] = [
  {
    title: 'Schnell zum aktuellen Tag',
    description: 'Klicke oben mittig auf den Titel der Seite, "ZE-Helper", und du wechselst sofort zum heutigen Tag',
  },
  {
    title: 'Wochenstunden anpassen',
    description: 'In der Zusammenfassung kannst du deine vertraglichen Wochenstunden anpassem.',
  },
  {
    title: 'Daten exportieren und importieren',
    description: 'Unter "Datenverwaltung" kannst du alle deine erfassten Zeiten als JSON-Datei sichern oder aus einem Backup importieren importieren.',
  },
  {
    title: 'Rein lokale Speicherung',
    description: 'Deine Daten (Einstellungen und Tagesbuchungen) werden nur im Browser gespeichert und verlassen zu keinem Zeitpunkt deinen Browser. Beachte dass dies Vorteile und Nachteile hat.',
  },
  {
    title: 'Webdesk-Import',
    description: 'Du kannst dein Monatsjournal (Druckansicht) direkt aus Webdesk kopieren und hier über die Datenverwaltung importieren. Die Daten werden dann im Browser gespeichert.',
  },
  {
    title: 'Achtung!',
    description: 'Die Daten werden nur bei dir im Local Storage vom jeweiligen Browser gespeichert. Löscht du den Cache dann sind diese Daten weg. Du kannst sie aber exportieren und importieren.',
  },
  {
    title: 'Tages-Statistiken',
    description: 'Die Statistik-Karte gibt dir einen schnellen Überblick über interessante Fakten wie deinen frühesten Arbeitsbeginn oder die längste Pause des Jahres.',
  },
  {
    title: 'Notizen für den Tag',
    description: 'Nutze die Notizkarte, um wichtige Ereignisse oder Aufgaben des Tages festzuhalten. So vergisst du nichts!',
  },
  {
    title: 'Durchschnittliche Arbeitszeit',
    description: 'Die Karte "Durchschnittlicher Tag" zeigt dir, wie dein typischer Arbeitstag aussieht, inklusive Pausen.',
  },
  {
    title: 'Wochenstunden-Diagramm',
    description: '"Diese Woche" visualisiert deine geleisteten Stunden der entsprechenden Woche und hilft dir, deine Arbeitsbelastung im Auge zu behalten.',
  },
  {
    title: 'Zielzeiterreichung',
    description: 'Verfolge deinen Fortschritt zur Erreichung deiner täglichen Soll-Arbeitszeit mit der Fortschrittsanzeige.',
  },
  {
    title: 'Arbeit außerhalb der Reihe',
    description: 'Die Karte "Außerhalb Normalzeit" zeigt dir, wieviel du außerhalb deiner normalen Arbeitszeiten tätig warst.',
  },
  {
    title: 'Tastaturkürzel',
    description: 'Bewege dich mithilfe der Tab & Enter Taste schnell durch die Eingabefelder oder Tage.',
  },
];
