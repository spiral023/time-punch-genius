/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTimeCalculator } from './useTimeCalculator';
import * as holidays from '@/lib/holidays';
import { Holiday } from '@/types';

// We will use vi.spyOn instead of vi.mock to avoid hoisting issues.

const mockedHolidays: Holiday[] = [
  {
    date: '2025-08-15',
    localName: 'Mariä Himmelfahrt',
    name: 'Assumption Day',
    countryCode: 'AT',
    fixed: true,
    global: true,
    counties: null,
    launchYear: null,
    types: ['Public'],
  },
  {
    date: '2025-10-26',
    localName: 'Nationalfeiertag',
    name: 'National Day',
    countryCode: 'AT',
    fixed: true,
    global: true,
    counties: null,
    launchYear: null,
    types: ['Public'],
  },
];

describe('useTimeCalculator', () => {
  beforeEach(() => {
    vi.spyOn(holidays, 'getHolidays').mockResolvedValue(mockedHolidays);
    // We need to mock isHoliday as well, since the original implementation is not available
    vi.spyOn(holidays, 'isHoliday').mockImplementation((date, holidayList) => {
      if (!holidayList || holidayList.length === 0) return false;
      const dateString = date.toISOString().split('T')[0];
      return holidayList.some(h => h.date === dateString);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sollte die Zeitdetails für einen normalen Arbeitstag korrekt berechnen', async () => {
    const currentTime = new Date('2025-07-28T10:00:00'); // Ein Montag, kein Feiertag
    const input = '08:00 - 12:00';
    const dailyTargetMinutes = 480;

    const { result } = renderHook(() => useTimeCalculator(input, currentTime, dailyTargetMinutes));

    // Warten, bis die Feiertage geladen sind und der Hook neu gerendert wird
    await waitFor(() => {
      expect(result.current.totalMinutes).toBe(240);
      expect(result.current.specialDayType).toBeNull();
    });
  });

  it('sollte einen Feiertag korrekt erkennen und die Soll-Arbeitszeit zurückgeben', async () => {
    const currentTime = new Date('2025-08-15T10:00:00'); // Mariä Himmelfahrt
    const input = ''; // Leere Eingabe an einem Feiertag
    const dailyTargetMinutes = 480;

    const { result } = renderHook(() => useTimeCalculator(input, currentTime, dailyTargetMinutes));

    await waitFor(() => {
      // An einem Feiertag mit leerer Eingabe sollte die totalMinutes 0 sein
      // und der specialDayType 'holiday'
      expect(result.current.totalMinutes).toBe(0);
      expect(result.current.specialDayType).toBe('holiday');
    });
  });

  it('sollte die Berechnung neu durchführen, wenn sich die Eingabe ändert', async () => {
    const currentTime = new Date('2025-07-28T12:00:00');
    const dailyTargetMinutes = 480;

    const { result, rerender } = renderHook(
      ({ input }) => useTimeCalculator(input, currentTime, dailyTargetMinutes),
      { initialProps: { input: '08:00 - 10:00' } }
    );

    await waitFor(() => {
      expect(result.current.totalMinutes).toBe(120);
    });

    // Eingabe ändern
    rerender({ input: '08:00 - 12:00' });

    await waitFor(() => {
      expect(result.current.totalMinutes).toBe(240);
    });
  });

  it('sollte die Feiertage für ein neues Jahr abrufen, wenn sich das Datum ändert', async () => {
    const initialTime = new Date('2025-12-31T10:00:00');
    const { rerender } = renderHook(
      ({ currentTime }) => useTimeCalculator('', currentTime, 480),
      { initialProps: { currentTime: initialTime } }
    );

    // Warten auf den ersten Aufruf
    await waitFor(() => {
      expect(holidays.getHolidays).toHaveBeenCalledWith(2025, 'AT');
    });

    // Datum auf das nächste Jahr ändern
    const newTime = new Date('2026-01-01T10:00:00');
    rerender({ currentTime: newTime });

    // Prüfen, ob getHolidays erneut mit dem neuen Jahr aufgerufen wurde
    await waitFor(() => {
      expect(holidays.getHolidays).toHaveBeenCalledWith(2026, 'AT');
    });
  });
});
