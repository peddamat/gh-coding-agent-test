import { describe, test, expect } from 'vitest';
import { getHolidayDates, getHolidayById, WEEKEND_HOLIDAYS } from '../holidays';

describe('Holiday Date Calculations with Expansion Rules', () => {
  describe('Independence Day (July 4th) Expansion', () => {
    const holiday = getHolidayById('independence-day')!;

    // July 4, 2025 (Friday) → July 4-6 (Fri-Sun)
    test('July 4, 2025 (Friday) expands to 3 days (Fri-Sun)', () => {
      const dates = getHolidayDates(holiday, 2025);
      expect(dates).toEqual(['2025-07-04', '2025-07-05', '2025-07-06']);
    });

    // July 4, 2026 (Saturday) → July 4-5 (Sat-Sun)
    test('July 4, 2026 (Saturday) expands to 2 days (Sat-Sun)', () => {
      const dates = getHolidayDates(holiday, 2026);
      expect(dates).toEqual(['2026-07-04', '2026-07-05']);
    });

    // July 4, 2027 (Sunday) → July 2-4 (Fri-Sun)
    test('July 4, 2027 (Sunday) expands to 3 days (Fri-Sun)', () => {
      const dates = getHolidayDates(holiday, 2027);
      expect(dates).toEqual(['2027-07-02', '2027-07-03', '2027-07-04']);
    });

    // July 4, 2028 (Tuesday) → July 4 only
    test('July 4, 2028 (Tuesday) is single day', () => {
      const dates = getHolidayDates(holiday, 2028);
      expect(dates).toEqual(['2028-07-04']);
    });

    // July 4, 2029 (Wednesday) → July 4 only
    test('July 4, 2029 (Wednesday) is single day', () => {
      const dates = getHolidayDates(holiday, 2029);
      expect(dates).toEqual(['2029-07-04']);
    });

    // July 4, 2030 (Thursday) → July 4 only
    test('July 4, 2030 (Thursday) is single day', () => {
      const dates = getHolidayDates(holiday, 2030);
      expect(dates).toEqual(['2030-07-04']);
    });

    // July 4, 2033 (Monday) → July 2-4 (Sat-Mon)
    test('July 4, 2033 (Monday) expands to 3 days (Sat-Mon)', () => {
      const dates = getHolidayDates(holiday, 2033);
      expect(dates).toEqual(['2033-07-02', '2033-07-03', '2033-07-04']);
    });
  });

  describe('Veterans Day (November 11) Expansion', () => {
    const holiday = getHolidayById('veterans-day')!;

    // Veterans Day 2024 (Monday, Nov 11) → Sat-Mon
    test('Veterans Day 2024 (Monday) expands to 3 days (Sat-Mon)', () => {
      const dates = getHolidayDates(holiday, 2024);
      expect(dates).toEqual(['2024-11-09', '2024-11-10', '2024-11-11']);
    });

    // Veterans Day 2025 (Tuesday, Nov 11) → single day
    test('Veterans Day 2025 (Tuesday) is single day', () => {
      const dates = getHolidayDates(holiday, 2025);
      expect(dates).toEqual(['2025-11-11']);
    });

    // Veterans Day 2026 (Wednesday, Nov 11) → single day
    test('Veterans Day 2026 (Wednesday) is single day', () => {
      const dates = getHolidayDates(holiday, 2026);
      expect(dates).toEqual(['2026-11-11']);
    });

    // Veterans Day 2028 (Saturday, Nov 11) → Sat-Sun
    test('Veterans Day 2028 (Saturday) expands to 2 days (Sat-Sun)', () => {
      const dates = getHolidayDates(holiday, 2028);
      expect(dates).toEqual(['2028-11-11', '2028-11-12']);
    });

    // Veterans Day 2029 (Sunday, Nov 11) → Fri-Sun
    test('Veterans Day 2029 (Sunday) expands to 3 days (Fri-Sun)', () => {
      const dates = getHolidayDates(holiday, 2029);
      expect(dates).toEqual(['2029-11-09', '2029-11-10', '2029-11-11']);
    });

    // Veterans Day 2022 (Friday, Nov 11) → Fri-Sun
    test('Veterans Day 2022 (Friday) expands to 3 days (Fri-Sun)', () => {
      const dates = getHolidayDates(holiday, 2022);
      expect(dates).toEqual(['2022-11-11', '2022-11-12', '2022-11-13']);
    });
  });

  describe('Halloween Expansion', () => {
    const holiday = getHolidayById('halloween')!;

    // Halloween is always single day regardless of day of week
    test('Halloween 2024 (Thursday) is always single day', () => {
      const dates = getHolidayDates(holiday, 2024);
      expect(dates).toEqual(['2024-10-31']);
    });

    test('Halloween 2025 (Friday) is always single day', () => {
      const dates = getHolidayDates(holiday, 2025);
      expect(dates).toEqual(['2025-10-31']);
    });

    test('Halloween 2026 (Saturday) is always single day', () => {
      const dates = getHolidayDates(holiday, 2026);
      expect(dates).toEqual(['2026-10-31']);
    });

    test('Halloween 2027 (Sunday) is always single day', () => {
      const dates = getHolidayDates(holiday, 2027);
      expect(dates).toEqual(['2027-10-31']);
    });
  });

  describe('Holidays without Expansion Rules', () => {
    // MLK Day should still work normally (always Monday)
    test('MLK Day uses standard duration calculation', () => {
      const holiday = getHolidayById('mlk-day')!;
      const dates = getHolidayDates(holiday, 2025);
      // MLK Day 2025 is Jan 20 (Monday), with 3-day duration
      expect(dates).toEqual(['2025-01-20', '2025-01-21', '2025-01-22']);
      expect(dates.length).toBe(holiday.durationDays);
    });

    // Memorial Day should still work normally (always Monday)
    test('Memorial Day uses standard duration calculation', () => {
      const holiday = getHolidayById('memorial-day')!;
      const dates = getHolidayDates(holiday, 2025);
      // Memorial Day 2025 is May 26 (Monday), with 3-day duration
      expect(dates).toEqual(['2025-05-26', '2025-05-27', '2025-05-28']);
      expect(dates.length).toBe(holiday.durationDays);
    });

    // Labor Day should still work normally (always Monday)
    test('Labor Day uses standard duration calculation', () => {
      const holiday = getHolidayById('labor-day')!;
      const dates = getHolidayDates(holiday, 2025);
      // Labor Day 2025 is Sept 1 (Monday), with 3-day duration
      expect(dates).toEqual(['2025-09-01', '2025-09-02', '2025-09-03']);
      expect(dates.length).toBe(holiday.durationDays);
    });
  });

  describe('getHolidayById', () => {
    test('independence-day exists and is configured correctly', () => {
      const holiday = getHolidayById('independence-day');
      expect(holiday).toBeDefined();
      expect(holiday?.name).toBe('Independence Day');
      expect(holiday?.dateCalculation).toEqual({ type: 'fixed', month: 7, day: 4 });
    });

    test('veterans-day exists and is configured correctly', () => {
      const holiday = getHolidayById('veterans-day');
      expect(holiday).toBeDefined();
      expect(holiday?.name).toBe('Veterans Day');
      expect(holiday?.dateCalculation).toEqual({ type: 'fixed', month: 11, day: 11 });
    });

    test('halloween exists and is configured correctly', () => {
      const holiday = getHolidayById('halloween');
      expect(holiday).toBeDefined();
      expect(holiday?.name).toBe('Halloween');
      expect(holiday?.dateCalculation).toEqual({ type: 'fixed', month: 10, day: 31 });
    });
  });

  describe('WEEKEND_HOLIDAYS array', () => {
    test('includes independence-day', () => {
      const july4 = WEEKEND_HOLIDAYS.find(h => h.id === 'independence-day');
      expect(july4).toBeDefined();
    });

    test('includes veterans-day', () => {
      const veteransDay = WEEKEND_HOLIDAYS.find(h => h.id === 'veterans-day');
      expect(veteransDay).toBeDefined();
    });

    test('includes halloween', () => {
      const halloween = WEEKEND_HOLIDAYS.find(h => h.id === 'halloween');
      expect(halloween).toBeDefined();
    });
  });
});
