# ZE-Helper - Dein smarter Zeitstempel-Assistent

![ZE-Helper Screenshot](https://sp23.online/images/ze-helper-screenshot.png)

**Live: [ze-helper.sp23.online](https://ze-helper.sp23.online)**

---

## 🚀 Überblick

ZE-Helper ist eine moderne, intuitive Webanwendung, die entwickelt wurde, um die tägliche Arbeitszeiterfassung zu vereinfachen und zu visualisieren. Anstatt sich mit umständlichen Tabellenkalkulationen oder unübersichtlichen Notizen herumzuschlagen, bietet ZE-Helper eine saubere Oberfläche, um Zeitbuchungen schnell einzugeben und sofort eine Auswertung zu erhalten.

Die Anwendung ist ideal für Angestellte, Freiberufler und jeden, der seine Arbeitszeit präzise und unkompliziert erfassen möchte.

---

## ✨ Funktionen

*   **Flexible Zeiteingabe:** Gib deine Arbeitszeiten im einfachen `HH:MM - HH:MM` Format ein.
*   **Live-Tracking:** Gib nur eine Startzeit (`HH:MM`) ein und die App berechnet die Dauer bis zur aktuellen Uhrzeit – perfekt für den laufenden Arbeitstag.
*   **Automatische Pausenregelung:** Nach 6 Stunden Arbeitszeit wird automatisch die gesetzliche Pause von 30 Minuten abgezogen.
*   **Zielzeit-Prognose:** Sieh auf einen Blick, wann du deine Tagesziele (6h, 7.7h, 10h) erreichen wirst.
*   **Visuelle Fortschrittsbalken:** Verfolge deinen Fortschritt in Echtzeit mit ansprechenden Fortschrittsanzeigen.
*   **Intelligente Validierung:** Die App warnt dich bei ungültigen Formaten, überlappenden Zeiträumen oder unlogischen Eingaben.
*   **Farbliche Kennzeichnung:** Die Gesamtarbeitszeit wird farblich hervorgehoben, um dir schnell einen Status zu geben (z.B. Grün bei erreichter Sollzeit).
*   **Lokaler Speicher:** Deine Eingaben werden sicher im Browser gespeichert. Kein Datenverlust beim Neuladen der Seite.
*   **Modernes Design:** Eine aufgeräumte, ansprechende Oberfläche mit Dark Mode für angenehmes Arbeiten zu jeder Tageszeit.
*   **Einfaches Löschen:** Mit einem Klick kannst du alle Einträge für einen neuen Tag zurücksetzen.

---

## ❓ FAQ - Häufig gestellte Fragen

**F: Wie funktioniert die Berechnung der Arbeitszeit?**
**A:** Die Anwendung summiert die Dauer aller erfassten Zeiträume. Ein Zeitraum wird entweder durch eine Start- und Endzeit (`08:00 - 12:00`) oder durch eine einzelne Startzeit (`13:00`) definiert. Bei einer einzelnen Startzeit wird die Dauer bis zur aktuellen Browser-Uhrzeit berechnet und live aktualisiert.

**F: Wie wird die Pause berechnet?**
**A:** Sobald die Gesamtsumme deiner Arbeitszeit 6 Stunden (360 Minuten) erreicht oder überschreitet, zieht die Anwendung automatisch 30 Minuten von der Gesamtzeit ab. Dies geschieht nur einmal.

**F: Was bedeuten die verschiedenen Farben bei der Gesamtanzeige?**
**A:** Die Farben geben dir einen schnellen visuellen Hinweis auf deinen aktuellen Arbeitsstatus:
*   **Rot (< 6h):** Du hast die Mindeststundenzahl für den Pausenabzug noch nicht erreicht.
*   **Lila (6h - 7.7h):** Du hast die 6-Stunden-Marke überschritten.
*   **Grün (7.7h - 9.5h):** Du hast deine Sollarbeitszeit von 7 Stunden und 42 Minuten erreicht.
*   **Gelb (9.5h - 10h):** Du näherst dich der gesetzlichen Höchstarbeitszeit.
*   **Rot (> 10h):** Achtung, du hast die gesetzliche Höchstarbeitszeit von 10 Stunden überschritten!

**F: Werden meine Daten irgendwo gespeichert?**
**A:** Deine Eingaben werden ausschließlich in deinem eigenen Webbrowser im `localStorage` gespeichert. Sie werden niemals an einen Server gesendet. Deine Daten bleiben privat und unter deiner Kontrolle.

---

## 🛠️ Technologie-Stack

*   **Frontend:** [React](https://reactjs.org/) (mit [TypeScript](https://www.typescriptlang.org/))
*   **Build-Tool:** [Vite](https://vitejs.dev/)
*   **UI-Komponenten:** [shadcn/ui](https://ui.shadcn.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Animationen:** [Framer Motion](https://www.framer.com/motion/)
*   **Icons:** [Lucide React](https://lucide.dev/)

---

## 👨‍💻 Entwickler

Entwickelt mit ❤️ von **sp23**.
