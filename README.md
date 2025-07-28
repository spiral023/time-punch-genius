# ZE-Helper – Die smarte Webanwendung zur Arbeitszeiterfassung

![ZE-Helper Screenshot](https://sp23.online/images/ze-helper-screenshot.png)

**Live: [ze-helper.sp23.online](https://ze-helper.sp23.online)**

---

ZE-Helper ist eine moderne, als Single Page Application (SPA) entwickelte Webanwendung zur Arbeitszeiterfassung. Sie zeigt in Echtzeit die heute geleistete Arbeitszeit an und berechnet automatisch, wann definierte Zielzeiten erreicht werden. Benutzer können sich optional per Browserbenachrichtigung informieren lassen, wenn diese Zielzeiten erreicht sind. Die Anwendung bietet zahlreiche weitere Funktionen, die im Folgenden detailliert beschrieben werden.

---

## 🔒 Datenschutz & Technologie

*   **Datenschutzfreundlich:** Sämtliche Datenverarbeitung erfolgt ausschließlich lokal im Browser. Es findet keine Übertragung an externe Server statt.
*   **Speicherung:** Alle Daten werden im Browser-Cache (LocalStorage) gespeichert.
*   **Hosting:** Bereitgestellt über Cloudflare Pages.
*   **Technologie-Stack:**
    *   **Framework:** React
    *   **Sprache:** TypeScript
    *   **UI-Komponenten:** Radix UI & shadcn/ui

---

## 🧩 Benutzeroberfläche & Interaktion

Die Benutzeroberfläche basiert auf einem modularen Karten-System („Cards“). Diese Karten werden kontextabhängig ein- oder ausgeblendet – je nachdem, ob sie für den gewählten Tag relevant sind (z. B. bei Krankenstand keine Zeitbuchung möglich → Zielzeiten-Karte wird ausgeblendet).

**Weitere UI-Elemente:**

*   **Datumsnavigation:** Wechsel zwischen Tagen über Date-Picker und Pfeilbuttons.
*   **Seitentitel:** Zeigt die aktuell geleistete Arbeitszeit an. Ein Klick auf „ZE-Helper“ springt zum aktuellen Tag.
*   **Tooltips:** Bieten Kontextinformationen zu bestimmten Funktionen.
*   **Welcome-Screen:** Erscheint beim ersten Start, erklärt die wichtigsten Funktionen und ermöglicht Import von Backups oder Webdesk-Daten. Der Durchlauf wird im Cache gespeichert und erscheint daher nur einmal.

---

## 🗂 Funktionsübersicht nach Karten

### ⏰ Aktuelle Uhrzeit

Anzeige der aktuellen Uhrzeit:
*   **Grün** innerhalb der Normalarbeitszeit
*   **Rot** außerhalb der Normalarbeitszeit
Bei Rückblick auf vergangene Tage wird stattdessen der Wochentag oder Feiertag angezeigt.

### 📊 Durchschnittlicher Tag

Zitatartige Darstellung des durchschnittlichen Arbeitstages, z. B.:
> „Ich arbeite im Schnitt von 08:39 bis 17:58 (7h 23m) und mache dabei 115 Minuten Pause.“

### 📅 Diese Woche

Balkendiagramm der Arbeitsstunden der aktuellen Woche. Inklusive Sollzeit und Details per Hover.

### 📈 Zusammenfassung

Gesamtsummen für:
*   aktuelle Woche
*   Monat
*   Jahr
*   Gesamtarbeitszeit
Anzeige des Wochensaldos (konfigurierbar).

### 🕘 Zeitbuchungen

Manuelle Eingabe oder Import von Zeitbuchungen (Webdesk). Automatischer Sperrmechanismus für Sonderfälle wie Urlaub, Krankenstand etc. (Symbolanzeige statt Eingabefeld). Tagesbuchungen können komplett gelöscht werden.

### ⌛ Erfasste Zeiten

Anzeige aller Buchungsblöcke mit Dauer. Einzelne Buchungen können gelöscht werden.

### 📝 Notizen

Notizen zum gewählten Tag (z. B. für Korrekturen oder Kommentare).

### ☕ Pauseninfo

Details zur Pause:
*   Summe der konsumierten Pause
*   automatischer gesetzlicher Pausenabzug (sofern zutreffend)

### 🧮 Arbeitszeit

Anzeige der heutigen Arbeitszeit:
*   Summe
*   Anzahl Zeitblöcke
*   Differenz zur Sollarbeitszeit
Farbige Darstellung je nach Zielzeit-Status. Klick auf die Karte startet neue Zeitbuchung.

### 🎯 Zielzeiten

Anzeige von Zielzeiten (6h, 7h 45m, 10h, 12h). Fortschrittsbalken und voraussichtlicher Zeitpunkt der Erreichung. Browserbenachrichtigung bei (oder X Minuten vor) Erreichen möglich.

### 🌴 Freie Tage

Konfiguration eigener Urlaubstage. Übersicht über:
*   verwendete Urlaubstage
*   verbleibende Urlaubstage
*   Feiertage
Farbwechsel je nach verbleibender Anzahl.

### 📆 Durchschnitt pro Wochentag

Balkendiagramm mit durchschnittlicher Arbeitszeit je Wochentag.

### 📊 Statistik

Verschiedene Metriken zur Nutzung:
*   Anzahl Tage mit Buchungen (inkl. Jahres-Prozent)
*   Frühester Start / spätestes Ende (inkl. Datum)
*   Längste Pause, Tag über 9h, längster Tag/Woche/Streak
*   Durchschnittliche Buchungsanzahl pro Tag
*   Urlaubstage insgesamt

### 🕗 Außerhalb Normalarbeitszeit

Zeit außerhalb der Arbeitszeit pro Woche, Monat, Jahr und Gesamt. Prozentuale Darstellung + Anzahl betroffener Tage.

### 💾 Datenverwaltung

*   Export & Import aller Daten (JSON-Format) aus dem LocalStorage.
*   Webdesk XLSX Import: Mehrere Monatsjournale gleichzeitig möglich.
*   Funktion zum Löschen aller Daten.
*   Kartenverwaltung: Ein-/Ausblenden einzelner Karten.

### 🏠 Home-Office-Statistik

Übersicht zur Homeoffice-Nutzung:
*   Nutzung an Werktagen / Wochenenden
*   Reine Büro-/Hybridtage
*   Stunden innerhalb / außerhalb Normalarbeitszeit
*   Tagesbasierte und stundenbasierte Homeoffice-Anteile in %

### 💡 Tipp des Tages

Zufälliger Nutzungstipp bei jedem Laden der Seite aus einer Tipp-Liste.

### ℹ️ Info

*   Impressum & Datenschutz
*   Feedback-Link (E-Mail)
*   Verlinkung zum IT-Kollektivvertrag 2025

### 📆 Urlaubsplanung

Verlinkung zu fenstertage.com zur effizienten Urlaubsplanung mit Zwickeltagen.

---

## 👨‍💻 Entwickler

Entwickelt mit ❤️ von **sp23**.

---

## 🧠 Wissensgraph der Anwendungsarchitektur

Dieser Abschnitt bietet einen Überblick über die Architektur der Anwendung, dargestellt als Wissensgraph.

### Komponenten

*   **Dashboard**: Die Hauptkomponente, die das Layout für die Karten und Diagramme bereitstellt.
    *   Verwendet: `CardManager`, `useTimeCalculator`
*   **CardManager**: Verwaltet die Anzeige und das Layout der verschiedenen Informationskarten.
    *   Verwendet: `AverageDayCard`, `FreeDaysCard`, `HomeOfficeCard`, `InfoCard`, `NotesCard`, `OutsideRegularHoursCard`, `StatisticsCard`, `TipsCard`, `VacationPlanningCard`
*   **AverageWorkdayHoursChart**: Zeigt ein Diagramm der durchschnittlichen Arbeitsstunden an.
*   **InfoDialog**: Ein modales Dialogfeld zur Anzeige von Informationen.
*   **NotificationManager**: Verwaltet Browser-Benachrichtigungen.
*   **StatisticLine**: Zeigt eine einzelne Statistikzeile an.
*   **TargetTimeProgress**: Zeigt den Fortschritt zum Erreichen der Zielarbeitszeit an.
*   **WeeklyHoursChart**: Zeigt ein Diagramm der wöchentlichen Arbeitsstunden an.
*   **WelcomePopup**: Begrüßungs-Popup für neue Benutzer.

#### Karten-Komponenten (`src/components/cards`)

*   **AverageDayCard**: Zeigt die durchschnittliche tägliche Arbeitszeit an.
    *   Verwendet: `useTimeCalculator`
*   **FreeDaysCard**: Verwaltet und zeigt arbeitsfreie Tage an.
    *   Verwendet: `useFreeDays`
*   **HomeOfficeCard**: Zeigt Statistiken zur Home-Office-Nutzung an.
    *   Verwendet: `useHomeOfficeStats`
*   **InfoCard**: Zeigt allgemeine Informationen an.
*   **NotesCard**: Ermöglicht das Hinzufügen von Notizen für einen Tag.
*   **OutsideRegularHoursCard**: Zeigt die außerhalb der regulären Arbeitszeit geleisteten Stunden an.
*   **StatisticsCard**: Zeigt verschiedene Nutzungsstatistiken an.
    *   Verwendet: `useStatistics`
*   **TipsCard**: Zeigt zufällige Tipps an.
*   **VacationPlanningCard**: Hilft bei der Urlaubsplanung.

#### Zeitrechner-Komponenten (`src/components/time-calculator`)

*   **DataManagement**: Behandelt den Import und Export von Daten.
    *   Verwendet: `useDataManagement`
*   **DateNavigator**: Ermöglicht die Navigation zwischen verschiedenen Tagen.
    *   Verwendet: `useTimeCalculator`
*   **PersonalVacationDaysSetting**: Ermöglicht die Einstellung persönlicher Urlaubstage.
    *   Verwendet: `useTimeCalculator`
*   **ResultsSection**: Zeigt die Ergebnisse der Zeitberechnung an.
    *   Verwendet: `useTimeCalculator`
*   **SummarySection**: Zeigt eine Zusammenfassung der Zeitdaten an.
    *   Verwendet: `useSummary`
*   **TimeInputSection**: Ermöglicht die Eingabe von Arbeitszeiten.
    *   Verwendet: `useTimeCalculator`

### Hooks (`src/hooks`)

*   **useTimeCalculator**: Zentraler Hook für die meisten Zeitberechnungen.
    *   Verwendet: `usePersistentState`, `useYearData`, `useDailyEntry`, `timeUtils`
*   **useAppSettings**: Verwaltet die Anwendungseinstellungen.
*   **useAppSetup**: Behandelt die Ersteinrichtung der Anwendung.
*   **useDailyEntry**: Verwaltet die täglichen Zeiteinträge.
*   **useDataManagement**: Behandelt die Datenverwaltungslogik.
*   **useFreeDays**: Verwaltet arbeitsfreie Tage und Feiertage.
    *   Verwendet: `holidays`
*   **useHomeOfficeStats**: Berechnet Statistiken zur Home-Office-Nutzung.
*   **useNotifications**: Verwaltet Benachrichtigungen.
*   **usePersistentState**: Speichert den Zustand dauerhaft im LocalStorage.
*   **useStatistics**: Berechnet verschiedene Nutzungsstatistiken.
*   **useSummary**: Erstellt Zusammenfassungen der Zeitdaten.
*   **useYearData**: Verwaltet die Daten für ein ganzes Jahr.
*   **use-mobile**: Stellt fest, ob die Anwendung auf einem mobilen Gerät angezeigt wird.
*   **use-toast**: Zeigt Toast-Benachrichtigungen an.

### Bibliotheken (`src/lib`)

*   **gradients**: Stellt Farbverläufe für die Benutzeroberfläche bereit.
*   **holidays**: Enthält Logik zur Berechnung von Feiertagen.
*   **timeUtils**: Enthält Hilfsfunktionen für Zeitberechnungen.
*   **tips**: Enthält eine Liste von Nutzungstipps.
*   **utils**: Allgemeine Hilfsfunktionen.
*   **webdeskUtils**: Hilfsfunktionen für den Webdesk-Import.

### Seiten (`src/pages`)

*   **Index**: Die Hauptseite der Anwendung.
*   **NotFound**: Die Seite, die angezeigt wird, wenn eine Route nicht gefunden wird.
