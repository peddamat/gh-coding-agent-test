import { describe, test, expect } from 'vitest';
import {
  JEWISH_HOLIDAYS,
  CHRISTIAN_HOLIDAYS,
  ISLAMIC_HOLIDAYS,
  ALL_RELIGIOUS_HOLIDAYS,
  RELIGIOUS_HOLIDAYS,
  getReligiousHolidayById,
  getReligiousHolidaysByReligion,
  getReligiousHolidayDates,
  getReligiousHolidayDisplayDate,
  createDefaultReligiousHolidayConfigs,
  getReligionDisplayName,
  calculateReligiousHolidayDays,
} from '../religiousHolidays';

describe('Religious Holidays Data', () => {
  describe('Holiday Definitions', () => {
    test('Jewish holidays array has 6 holidays', () => {
      expect(JEWISH_HOLIDAYS).toHaveLength(6);
    });

    test('Christian holidays array has 3 holidays', () => {
      expect(CHRISTIAN_HOLIDAYS).toHaveLength(3);
    });

    test('Islamic holidays array has 2 holidays', () => {
      expect(ISLAMIC_HOLIDAYS).toHaveLength(2);
    });

    test('All religious holidays has 11 total holidays', () => {
      expect(ALL_RELIGIOUS_HOLIDAYS).toHaveLength(11);
    });

    test('Each holiday has required fields', () => {
      ALL_RELIGIOUS_HOLIDAYS.forEach((holiday) => {
        expect(holiday.id).toBeDefined();
        expect(holiday.name).toBeDefined();
        expect(holiday.religion).toBeDefined();
        expect(holiday.duration).toBeGreaterThan(0);
        expect(holiday.dates).toBeDefined();
        expect(Object.keys(holiday.dates).length).toBeGreaterThan(0);
      });
    });

    test('Each holiday has dates for years 2024-2030', () => {
      const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
      ALL_RELIGIOUS_HOLIDAYS.forEach((holiday) => {
        years.forEach((year) => {
          expect(holiday.dates[year]).toBeDefined();
          expect(holiday.dates[year]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
      });
    });
  });

  describe('Jewish Holidays', () => {
    test('Passover dates are correct for sample years', () => {
      const passover = JEWISH_HOLIDAYS.find((h) => h.id === 'passover');
      expect(passover).toBeDefined();
      expect(passover!.dates[2024]).toBe('2024-04-22');
      expect(passover!.dates[2025]).toBe('2025-04-12');
      expect(passover!.duration).toBe(2);
    });

    test('Rosh Hashanah dates are correct for sample years', () => {
      const roshHashanah = JEWISH_HOLIDAYS.find((h) => h.id === 'rosh-hashanah');
      expect(roshHashanah).toBeDefined();
      expect(roshHashanah!.dates[2024]).toBe('2024-10-02');
      expect(roshHashanah!.dates[2025]).toBe('2025-09-22');
      expect(roshHashanah!.duration).toBe(2);
    });

    test('Yom Kippur dates are correct for sample years', () => {
      const yomKippur = JEWISH_HOLIDAYS.find((h) => h.id === 'yom-kippur');
      expect(yomKippur).toBeDefined();
      expect(yomKippur!.dates[2024]).toBe('2024-10-11');
      expect(yomKippur!.dates[2025]).toBe('2025-10-01');
      expect(yomKippur!.duration).toBe(1);
    });

    test('Hanukkah dates are correct for sample years', () => {
      const hanukkah = JEWISH_HOLIDAYS.find((h) => h.id === 'hanukkah');
      expect(hanukkah).toBeDefined();
      expect(hanukkah!.dates[2024]).toBe('2024-12-25');
      expect(hanukkah!.dates[2025]).toBe('2025-12-14');
      expect(hanukkah!.duration).toBe(1);
    });

    test('Purim dates are correct for sample years', () => {
      const purim = JEWISH_HOLIDAYS.find((h) => h.id === 'purim');
      expect(purim).toBeDefined();
      expect(purim!.dates[2024]).toBe('2024-03-23');
      expect(purim!.dates[2025]).toBe('2025-03-13');
      expect(purim!.duration).toBe(1);
    });

    test('Sukkot dates are correct for sample years', () => {
      const sukkot = JEWISH_HOLIDAYS.find((h) => h.id === 'sukkot');
      expect(sukkot).toBeDefined();
      expect(sukkot!.dates[2024]).toBe('2024-10-16');
      expect(sukkot!.dates[2025]).toBe('2025-10-06');
      expect(sukkot!.duration).toBe(2);
    });
  });

  describe('Christian Holidays', () => {
    test('Good Friday dates are correct for sample years', () => {
      const goodFriday = CHRISTIAN_HOLIDAYS.find((h) => h.id === 'good-friday');
      expect(goodFriday).toBeDefined();
      expect(goodFriday!.dates[2024]).toBe('2024-03-29');
      expect(goodFriday!.dates[2025]).toBe('2025-04-18');
      expect(goodFriday!.duration).toBe(1);
    });

    test('Easter Sunday dates are correct for sample years', () => {
      const easter = CHRISTIAN_HOLIDAYS.find((h) => h.id === 'easter-sunday');
      expect(easter).toBeDefined();
      expect(easter!.dates[2024]).toBe('2024-03-31');
      expect(easter!.dates[2025]).toBe('2025-04-20');
      expect(easter!.duration).toBe(1);
    });

    test('Ash Wednesday dates are correct for sample years', () => {
      const ashWednesday = CHRISTIAN_HOLIDAYS.find((h) => h.id === 'ash-wednesday');
      expect(ashWednesday).toBeDefined();
      expect(ashWednesday!.dates[2024]).toBe('2024-02-14');
      expect(ashWednesday!.dates[2025]).toBe('2025-03-05');
      expect(ashWednesday!.duration).toBe(1);
    });

    test('Good Friday is 2 days before Easter', () => {
      const goodFriday = CHRISTIAN_HOLIDAYS.find((h) => h.id === 'good-friday');
      const easter = CHRISTIAN_HOLIDAYS.find((h) => h.id === 'easter-sunday');
      
      [2024, 2025, 2026, 2027, 2028, 2029, 2030].forEach((year) => {
        const gfDate = new Date(goodFriday!.dates[year] + 'T00:00:00');
        const easterDate = new Date(easter!.dates[year] + 'T00:00:00');
        const daysDiff = (easterDate.getTime() - gfDate.getTime()) / (1000 * 60 * 60 * 24);
        expect(daysDiff).toBe(2);
      });
    });

    test('Ash Wednesday is 46 days before Easter', () => {
      const ashWednesday = CHRISTIAN_HOLIDAYS.find((h) => h.id === 'ash-wednesday');
      const easter = CHRISTIAN_HOLIDAYS.find((h) => h.id === 'easter-sunday');
      
      [2024, 2025, 2026, 2027, 2028, 2029, 2030].forEach((year) => {
        const ashDate = new Date(ashWednesday!.dates[year] + 'T00:00:00');
        const easterDate = new Date(easter!.dates[year] + 'T00:00:00');
        const daysDiff = (easterDate.getTime() - ashDate.getTime()) / (1000 * 60 * 60 * 24);
        expect(daysDiff).toBe(46);
      });
    });
  });

  describe('Islamic Holidays', () => {
    test('Eid al-Fitr dates are correct for sample years', () => {
      const eidFitr = ISLAMIC_HOLIDAYS.find((h) => h.id === 'eid-al-fitr');
      expect(eidFitr).toBeDefined();
      expect(eidFitr!.dates[2024]).toBe('2024-04-09');
      expect(eidFitr!.dates[2025]).toBe('2025-03-30');
      expect(eidFitr!.duration).toBe(3);
    });

    test('Eid al-Adha dates are correct for sample years', () => {
      const eidAdha = ISLAMIC_HOLIDAYS.find((h) => h.id === 'eid-al-adha');
      expect(eidAdha).toBeDefined();
      expect(eidAdha!.dates[2024]).toBe('2024-06-16');
      expect(eidAdha!.dates[2025]).toBe('2025-06-06');
      expect(eidAdha!.duration).toBe(4);
    });

    test('Islamic holidays shift earlier each year (lunar calendar)', () => {
      const eidFitr = ISLAMIC_HOLIDAYS.find((h) => h.id === 'eid-al-fitr');
      
      // Islamic calendar is about 11 days shorter than Gregorian,
      // so holidays move earlier each year (within same calendar year position)
      // Eid al-Fitr 2024: Apr 9 (month 4, day 9)
      // Eid al-Fitr 2025: Mar 30 (month 3, day 30)
      // The date should move earlier (smaller month/day) when comparing within year
      const date2024 = new Date(eidFitr!.dates[2024] + 'T00:00:00');
      const date2025 = new Date(eidFitr!.dates[2025] + 'T00:00:00');
      
      // Convert to day-of-year to compare position within their respective years
      const dayOfYear2024 = Math.floor((date2024.getTime() - new Date(2024, 0, 1).getTime()) / 86400000);
      const dayOfYear2025 = Math.floor((date2025.getTime() - new Date(2025, 0, 1).getTime()) / 86400000);
      
      // 2025's Eid should fall earlier in its year than 2024's Eid
      expect(dayOfYear2025).toBeLessThan(dayOfYear2024);
    });
  });

  describe('getReligiousHolidayById', () => {
    test('returns holiday by ID', () => {
      const passover = getReligiousHolidayById('passover');
      expect(passover).toBeDefined();
      expect(passover!.name).toBe('Passover (First Seder)');
    });

    test('returns undefined for unknown ID', () => {
      const unknown = getReligiousHolidayById('unknown-holiday');
      expect(unknown).toBeUndefined();
    });
  });

  describe('getReligiousHolidaysByReligion', () => {
    test('returns Jewish holidays', () => {
      const holidays = getReligiousHolidaysByReligion('jewish');
      expect(holidays).toHaveLength(6);
      holidays.forEach((h) => {
        expect(h.religion).toBe('jewish');
      });
    });

    test('returns Christian holidays', () => {
      const holidays = getReligiousHolidaysByReligion('christian');
      expect(holidays).toHaveLength(3);
      holidays.forEach((h) => {
        expect(h.religion).toBe('christian');
      });
    });

    test('returns Islamic holidays', () => {
      const holidays = getReligiousHolidaysByReligion('islamic');
      expect(holidays).toHaveLength(2);
      holidays.forEach((h) => {
        expect(h.religion).toBe('islamic');
      });
    });

    test('returns empty array for other', () => {
      const holidays = getReligiousHolidaysByReligion('other');
      expect(holidays).toHaveLength(0);
    });
  });

  describe('getReligiousHolidayDates', () => {
    test('returns correct dates for single-day holiday', () => {
      const yomKippur = getReligiousHolidayById('yom-kippur')!;
      const dates = getReligiousHolidayDates(yomKippur, 2024);
      expect(dates).toEqual(['2024-10-11']);
    });

    test('returns correct dates for multi-day holiday', () => {
      const passover = getReligiousHolidayById('passover')!;
      const dates = getReligiousHolidayDates(passover, 2024);
      expect(dates).toEqual(['2024-04-22', '2024-04-23']);
    });

    test('returns correct dates for Eid al-Fitr (3 days)', () => {
      const eidFitr = getReligiousHolidayById('eid-al-fitr')!;
      const dates = getReligiousHolidayDates(eidFitr, 2024);
      expect(dates).toEqual(['2024-04-09', '2024-04-10', '2024-04-11']);
    });

    test('returns correct dates for Eid al-Adha (4 days)', () => {
      const eidAdha = getReligiousHolidayById('eid-al-adha')!;
      const dates = getReligiousHolidayDates(eidAdha, 2024);
      expect(dates).toEqual(['2024-06-16', '2024-06-17', '2024-06-18', '2024-06-19']);
    });

    test('returns empty array for year without data', () => {
      const passover = getReligiousHolidayById('passover')!;
      const dates = getReligiousHolidayDates(passover, 2020);
      expect(dates).toEqual([]);
    });
  });

  describe('getReligiousHolidayDisplayDate', () => {
    test('formats single-day holiday correctly', () => {
      const yomKippur = getReligiousHolidayById('yom-kippur')!;
      const display = getReligiousHolidayDisplayDate(yomKippur, 2024);
      expect(display).toBe('Oct 11');
    });

    test('formats multi-day holiday correctly', () => {
      const passover = getReligiousHolidayById('passover')!;
      const display = getReligiousHolidayDisplayDate(passover, 2024);
      expect(display).toBe('Apr 22 - Apr 23');
    });

    test('returns "Date varies" for year without data', () => {
      const passover = getReligiousHolidayById('passover')!;
      const display = getReligiousHolidayDisplayDate(passover, 2020);
      expect(display).toBe('Date varies');
    });
  });

  describe('createDefaultReligiousHolidayConfigs', () => {
    test('creates configs for all holidays', () => {
      const configs = createDefaultReligiousHolidayConfigs();
      expect(configs).toHaveLength(11);
    });

    test('all holidays are disabled by default', () => {
      const configs = createDefaultReligiousHolidayConfigs();
      configs.forEach((config) => {
        expect(config.enabled).toBe(false);
      });
    });

    test('all holidays use alternate-odd-even by default', () => {
      const configs = createDefaultReligiousHolidayConfigs();
      configs.forEach((config) => {
        expect(config.assignment).toBe('alternate-odd-even');
      });
    });
  });

  describe('getReligionDisplayName', () => {
    test('returns correct display names', () => {
      expect(getReligionDisplayName('jewish')).toBe('Jewish Holidays');
      expect(getReligionDisplayName('christian')).toBe('Christian Holidays');
      expect(getReligionDisplayName('islamic')).toBe('Islamic Holidays');
      expect(getReligionDisplayName('other')).toBe('Other Religious Holidays');
    });
  });

  describe('calculateReligiousHolidayDays', () => {
    test('returns 0 when no holidays enabled', () => {
      const configs = createDefaultReligiousHolidayConfigs();
      expect(calculateReligiousHolidayDays(configs)).toBe(0);
    });

    test('calculates correct days for enabled holidays', () => {
      const configs = createDefaultReligiousHolidayConfigs().map((c) =>
        c.holidayId === 'passover' || c.holidayId === 'yom-kippur'
          ? { ...c, enabled: true }
          : c
      );
      // Passover = 2 days, Yom Kippur = 1 day
      expect(calculateReligiousHolidayDays(configs)).toBe(3);
    });

    test('calculates correct total for all enabled', () => {
      const configs = createDefaultReligiousHolidayConfigs().map((c) => ({
        ...c,
        enabled: true,
      }));
      // Jewish: 2+2+1+2+1+1 = 9
      // Christian: 1+1+1 = 3
      // Islamic: 3+4 = 7
      // Total: 19
      expect(calculateReligiousHolidayDays(configs)).toBe(19);
    });
  });

  describe('RELIGIOUS_HOLIDAYS grouping', () => {
    test('groups holidays correctly by religion', () => {
      expect(RELIGIOUS_HOLIDAYS.jewish).toHaveLength(6);
      expect(RELIGIOUS_HOLIDAYS.christian).toHaveLength(3);
      expect(RELIGIOUS_HOLIDAYS.islamic).toHaveLength(2);
      expect(RELIGIOUS_HOLIDAYS.other).toHaveLength(0);
    });
  });
});
