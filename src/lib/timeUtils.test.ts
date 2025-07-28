import { describe, it, expect } from 'vitest';
import {
  parseTimeToMinutes,
  formatMinutesToTime,
  formatHoursMinutes,
  addMinutesToTime,
  calculateTimeDetails,
  calculateAverageDay,
  calculateOutsideRegularHours,
} from './timeUtils';

describe('timeUtils', () => {
  describe('parseTimeToMinutes', () => {
    it('sollte die Zeit korrekt in Minuten umwandeln', () => {
      expect(parseTimeToMinutes('08:30')).toBe(510);
      expect(parseTimeToMinutes('00:00')).toBe(0);
      expect(parseTimeToMinutes('23:59')).toBe(1439);
    });
  });

  describe('formatMinutesToTime', () => {
    it('sollte Minuten korrekt in das Zeitformat umwandeln', () => {
      expect(formatMinutesToTime(510)).toBe('08:30');
      expect(formatMinutesToTime(0)).toBe('00:00');
      expect(formatMinutesToTime(1439)).toBe('23:59');
    });

    it('sollte Zeiten über 23:59 auf 23:59 begrenzen', () => {
      expect(formatMinutesToTime(1440)).toBe('23:59');
      expect(formatMinutesToTime(1500)).toBe('23:59');
    });
  });

  describe('formatHoursMinutes', () => {
    it('sollte die Gesamtminuten korrekt in Stunden und Minuten formatieren', () => {
      expect(formatHoursMinutes(125)).toBe('2h 5m');
      expect(formatHoursMinutes(60)).toBe('1h 0m');
      expect(formatHoursMinutes(59)).toBe('0h 59m');
      expect(formatHoursMinutes(0)).toBe('0h 0m');
    });

    it('sollte negative Werte korrekt formatieren', () => {
      expect(formatHoursMinutes(-125)).toBe('-2h 5m');
    });
  });

  describe('addMinutesToTime', () => {
    it('sollte Minuten korrekt zu einer Zeitangabe addieren', () => {
      expect(addMinutesToTime('08:30', 90)).toBe('10:00');
      expect(addMinutesToTime('23:00', 120)).toBe('23:59'); // Begrenzt auf 23:59
    });
  });

  describe('calculateTimeDetails', () => {
    const currentTime = new Date('2025-07-28T10:00:00');

    it('sollte eine einzelne Zeitspanne korrekt berechnen', () => {
      const result = calculateTimeDetails('08:00 - 12:00', currentTime);
      expect(result.totalMinutes).toBe(240);
      expect(result.grossTotalMinutes).toBe(240);
      expect(result.totalBreak).toBe(0);
    });

    it('sollte mehrere Zeitspannen und Pausen korrekt berechnen', () => {
      const result = calculateTimeDetails('08:00 - 12:00\n13:00 - 17:00', currentTime);
      expect(result.totalMinutes).toBe(480);
      expect(result.grossTotalMinutes).toBe(480);
      expect(result.totalBreak).toBe(60);
    });

    it('sollte den Pausenabzug korrekt anwenden, wenn die Arbeitszeit >= 6 Stunden ist', () => {
      const result = calculateTimeDetails('08:00 - 14:30', currentTime);
      expect(result.grossTotalMinutes).toBe(390);
      expect(result.totalBreak).toBe(0);
      expect(result.breakDeduction).toBe(30);
      expect(result.totalMinutes).toBe(360);
    });

    it('sollte offene Zeiteinträge korrekt verarbeiten', () => {
      const result = calculateTimeDetails('09:00 - ', currentTime);
      expect(result.totalMinutes).toBe(60);
    });

    it('sollte spezielle Tage wie Urlaub korrekt verarbeiten', () => {
      const result = calculateTimeDetails('Urlaub', currentTime, 480);
      expect(result.specialDayType).toBe('vacation');
      expect(result.totalMinutes).toBe(480);
    });

    it('sollte Fehler bei ungültigem Format zurückgeben', () => {
      const result = calculateTimeDetails('abc', currentTime);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('sollte Fehler bei überlappenden Zeiträumen zurückgeben', () => {
      const result = calculateTimeDetails('08:00 - 10:00\n09:30 - 11:00', currentTime);
      expect(result.errors).toContainEqual({ line: 2, message: 'Zeitraum überlappt mit vorherigem Eintrag' });
    });

    it('sollte Fehler zurückgeben, wenn die Endzeit vor der Startzeit liegt', () => {
      const result = calculateTimeDetails('14:00 - 12:00', currentTime);
      expect(result.errors).toContainEqual({ line: 1, message: 'Endzeit muss nach Startzeit liegen' });
    });

    it('sollte keinen Pausenabzug vornehmen, wenn die Arbeitszeit unter 6 Stunden liegt', () => {
      const result = calculateTimeDetails('08:00 - 13:59', currentTime);
      expect(result.grossTotalMinutes).toBe(359);
      expect(result.breakDeduction).toBe(0);
      expect(result.totalMinutes).toBe(359);
    });

    it('sollte keinen Pausenabzug vornehmen, wenn bereits ausreichend Pause gemacht wurde', () => {
      const result = calculateTimeDetails('08:00 - 12:00\n12:30 - 14:30', currentTime);
      expect(result.grossTotalMinutes).toBe(360);
      expect(result.totalBreak).toBe(30);
      expect(result.breakDeduction).toBe(0);
      expect(result.totalMinutes).toBe(360);
    });

    it('sollte spezielle Tage unabhängig von der Groß-/Kleinschreibung erkennen', () => {
      const result = calculateTimeDetails('KRANKENSTAND', currentTime, 480);
      expect(result.specialDayType).toBe('sick');
      expect(result.totalMinutes).toBe(480);
    });

    it('sollte an einem Feiertag ohne Eingabe 0 Minuten zurückgeben', () => {
      const result = calculateTimeDetails('', currentTime, 480, true);
      expect(result.specialDayType).toBe('holiday');
      expect(result.totalMinutes).toBe(0);
    });
  });

  describe('calculateAverageDay', () => {
    const currentTime = new Date();
    it('sollte den Durchschnitt für mehrere Tage korrekt berechnen', () => {
      const data = ['08:00 - 16:30', '09:00 - 17:00']; // 8.5h (8h netto) und 8h (7.5h netto)
      const result = calculateAverageDay(data, currentTime, 480);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.avgStart).toBe('08:30');
        expect(result.avgEnd).toBe('16:45');
        expect(result.avgBreak).toBe(30);
        expect(result.avgHours).toBe('7h 45m');
      }
    });

    it('sollte null zurückgeben, wenn keine Daten vorhanden sind', () => {
      expect(calculateAverageDay([], currentTime)).toBeNull();
    });

    it('sollte Urlaubs- und Krankheitstage bei der Durchschnittsberechnung ignorieren', () => {
      const data = ['08:00 - 16:00', 'Urlaub', 'Krankenstand'];
      const result = calculateAverageDay(data, currentTime, 480);
      expect(result).not.toBeNull();
      if (result) {
        // Sollte nur den einen Arbeitstag berücksichtigen
        expect(result.avgStart).toBe('08:00');
        expect(result.avgEnd).toBe('16:00');
        expect(result.avgBreak).toBe(30);
        expect(result.avgHours).toBe('7h 30m');
      }
    });

    it('sollte andere spezielle Tage (z.B. Schulung) mit der Soll-Arbeitszeit berücksichtigen', () => {
      const data = ['08:00 - 16:00', 'Schulung']; // 7.5h Netto + 8h Soll
      const result = calculateAverageDay(data, currentTime, 480);
      expect(result).not.toBeNull();
      if (result) {
        // (450 + 480) / 2 = 465 Minuten -> 7h 45m
        expect(result.avgHours).toBe('7h 45m');
      }
    });
  });

  describe('calculateOutsideRegularHours', () => {
    it('sollte die Arbeitszeit außerhalb der Regelarbeitszeit an einem Wochentag korrekt berechnen', () => {
      const entries = [{ start: '05:30', end: '07:00', duration: 90 }, { start: '18:30', end: '20:00', duration: 90 }];
      const date = new Date('2025-07-28'); // Montag
      // 30 Minuten von 05:30-06:00 und 60 Minuten von 19:00-20:00
      expect(calculateOutsideRegularHours(entries, date, false)).toBe(90);
    });

    it('sollte die gesamte Arbeitszeit an einem Wochenende zurückgeben', () => {
      const entries = [{ start: '09:00', end: '12:00', duration: 180 }];
      const date = new Date('2025-07-27'); // Sonntag
      expect(calculateOutsideRegularHours(entries, date, false)).toBe(180);
    });

    it('sollte die gesamte Arbeitszeit an einem Feiertag zurückgeben', () => {
      const entries = [{ start: '10:00', end: '14:00', duration: 240 }];
      const date = new Date('2025-08-15'); // Montag, aber als Feiertag markiert
      expect(calculateOutsideRegularHours(entries, date, true)).toBe(240);
    });

    it('sollte Zeiträume, die die Regelarbeitszeit überspannen, korrekt berechnen', () => {
      const entries = [{ start: '05:00', end: '07:00', duration: 120 }];
      const date = new Date('2025-07-28'); // Montag
      // 60 Minuten von 05:00-06:00
      expect(calculateOutsideRegularHours(entries, date, false)).toBe(60);
    });

    it('sollte 0 zurückgeben für Arbeitszeit komplett innerhalb der Regelarbeitszeit', () => {
      const entries = [{ start: '09:00', end: '17:00', duration: 480 }];
      const date = new Date('2025-07-29'); // Dienstag
      expect(calculateOutsideRegularHours(entries, date, false)).toBe(0);
    });

    it('sollte die gesamte Arbeitszeit an einem Samstag zurückgeben', () => {
      const entries = [{ start: '09:00', end: '11:00', duration: 120 }];
      const date = new Date('2025-07-26'); // Samstag
      expect(calculateOutsideRegularHours(entries, date, false)).toBe(120);
    });
  });
});
