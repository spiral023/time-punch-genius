import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getHolidays, isHoliday, Holiday, clearHolidayCache } from './holidays';

const mockHolidays: Holiday[] = [
  {
    date: '2025-01-01',
    localName: 'Neujahr',
    name: 'New Year\'s Day',
    countryCode: 'AT',
    fixed: true,
    global: true,
    counties: null,
    launchYear: null,
    types: ['Public'],
  },
  {
    date: '2025-12-25',
    localName: 'Weihnachten',
    name: 'Christmas Day',
    countryCode: 'AT',
    fixed: true,
    global: true,
    counties: null,
    launchYear: null,
    types: ['Public'],
  },
];

describe('holidays', () => {
  describe('isHoliday', () => {
    it('sollte true zurückgeben, wenn das Datum ein Feiertag ist', () => {
      const date = new Date('2025-01-01T12:00:00');
      expect(isHoliday(date, mockHolidays)).toBe(true);
    });

    it('sollte false zurückgeben, wenn das Datum kein Feiertag ist', () => {
      const date = new Date('2025-01-02T12:00:00');
      expect(isHoliday(date, mockHolidays)).toBe(false);
    });

    it('sollte false zurückgeben, wenn die Feiertagsliste leer ist', () => {
      const date = new Date('2025-01-01T12:00:00');
      expect(isHoliday(date, [])).toBe(false);
    });

    it('sollte die Zeitzone korrekt behandeln (z.B. kurz vor Mitternacht UTC)', () => {
      // Dieser Test stellt sicher, dass auch bei unterschiedlichen Zeitzonen der lokale Kalendertag zählt.
      // 2025-01-01 00:30 in Wien (UTC+1 im Winter) ist 2024-12-31 23:30 UTC.
      const date = new Date('2025-01-01T00:30:00');
      expect(isHoliday(date, mockHolidays)).toBe(true);
    });
  });

  describe('getHolidays', () => {
    beforeEach(() => {
      clearHolidayCache();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('sollte Feiertage von der API abrufen und zurückgeben', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockHolidays),
      } as Response);

      const holidays = await getHolidays(2025, 'AT');
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('https://date.nager.at/api/v3/PublicHolidays/2025/AT');
      expect(holidays).toEqual(mockHolidays);
    });

    it('sollte bei einem API-Fehler ein leeres Array zurückgeben', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('API is down'));
      const holidays = await getHolidays(2025, 'AT');
      expect(holidays).toEqual([]);
    });

    it('sollte bei einer nicht-ok-Antwort ein leeres Array zurückgeben', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false } as Response);
      const holidays = await getHolidays(2025, 'AT');
      expect(holidays).toEqual([]);
    });
  });
});
