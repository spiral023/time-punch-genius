export interface Tip {
  title: string;
  description: string;
}

export const tips: Tip[] = [
  {
    title: 'Schnell zum aktuellen Tag wechseln',
    description: 'Klicke oben mittig auf den Titel der Seite, "ZE-Helper", und du wechselst sofort zum heutigen Datum.',
  },
  {
    title: 'Wochenstunden anpassen',
    description: 'In der Zusammenfassung kannst du deine vertraglichen Wochenstunden anpassen, um deine Überstunden korrekt zu berechnen.',
  },
  {
    title: 'Daten exportieren und importieren',
    description: 'Unter "Datenverwaltung" kannst du alle deine erfassten Zeiten als JSON-Datei sichern oder von einem anderen Gerät importieren.',
  },
  {
    title: 'Webdesk-Import',
    description: 'Du kannst deine Zeiten direkt aus Webdesk exportieren und hier über die Datenverwaltung importieren, um deine Einträge schnell zu synchronisieren.',
  },
  {
    title: 'Tages-Statistiken',
    description: 'Die Statistik-Karte gibt dir einen schnellen Überblick über interessante Fakten wie deinen frühesten Arbeitsbeginn oder die längste Pause des Jahres.',
  },
];
