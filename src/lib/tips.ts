export interface Tip {
  id: number;
  title: string;
  description: string;
}

export const tips: Tip[] = [
  {
    id: 0,
    title: 'Schnell zum aktuellen Tag',
    description: 'Klicke oben mittig auf den Titel der Seite, "ZE-Helper", und du wechselst sofort zum heutigen Tag',
  },
  {
    id: 1,
    title: 'Wochenstunden anpassen',
    description: 'In der Zusammenfassung kannst du deine vertraglichen Wochenstunden anpassem.',
  },
    {
    id: 2,
    title: 'Bring Farbe rein!',
    description: 'Easteregg! Ändere die Hintergrundfarbe, indem du auf die aktuelle Uhrzeit klickst. Die Einstellung wird gespeichert.',
  },
    {
    id: 3,
    title: 'Schneller einfügen',
    description: 'Lifehack: Du musst nicht erst ins Eingabefeld klicken, wenn du die Zeitbuchungen von Webdesk einfügst. Drücke einfach Strg+V.',
  },
  {
    id: 4,
    title: 'Daten exportieren und importieren',
    description: 'Unter "Datenverwaltung" kannst du alle deine erfassten Zeiten als JSON-Datei sichern oder aus einem Backup importieren importieren.',
  },
  {
    id: 5,
    title: 'Rein lokale Speicherung',
    description: 'Deine Daten (Einstellungen und Tagesbuchungen) werden nur im Browser gespeichert und verlassen zu keinem Zeitpunkt deinen Browser. Beachte dass dies Vorteile und Nachteile hat.',
  },
  {
    id: 6,
    title: 'Webdesk-Import',
    description: 'Du kannst dein Monatsjournal (Druckansicht) direkt aus Webdesk kopieren und hier über die Datenverwaltung importieren. Die Daten werden dann im Browser gespeichert.',
  },
  {
    id: 7,
    title: 'Achtung!',
    description: 'Die Daten werden nur bei dir im Local Storage vom jeweiligen Browser gespeichert. Löscht du den Cache dann sind diese Daten weg. Du kannst sie aber exportieren und importieren.',
  },
  {
    id: 8,
    title: 'Tages-Statistiken',
    description: 'Die Statistik-Karte gibt dir einen schnellen Überblick über interessante Fakten wie deinen frühesten Arbeitsbeginn oder die längste Pause des Jahres.',
  },
  {
    id: 9,
    title: 'Notizen für den Tag',
    description: 'Nutze die Notizkarte, um wichtige Ereignisse oder Aufgaben des Tages festzuhalten. So vergisst du nichts!',
  },
  {
    id: 10,
    title: 'Durchschnittliche Arbeitszeit',
    description: 'Die Karte "Durchschnittlicher Tag" zeigt dir, wie dein typischer Arbeitstag aussieht, inklusive Pausen.',
  },
  {
    id: 11,
    title: 'Wochenstunden-Diagramm',
    description: '"Diese Woche" visualisiert deine geleisteten Stunden der entsprechenden Woche und hilft dir, deine Arbeitsbelastung im Auge zu behalten.',
  },
  {
    id: 12,
    title: 'Zielzeiterreichung',
    description: 'Verfolge deinen Fortschritt zur Erreichung deiner täglichen Soll-Arbeitszeit mit der Fortschrittsanzeige.',
  },
  {
    id: 13,
    title: 'Arbeit außerhalb der Reihe',
    description: 'Die Karte "Außerhalb Normalzeit" zeigt dir, wieviel du außerhalb deiner normalen Arbeitszeiten tätig warst.',
  },
  {
    id: 14,
    title: 'Tastaturkürzel',
    description: 'Bewege dich mithilfe der Tab & Enter Taste schnell durch die Eingabefelder oder Tage.',
  },
];
