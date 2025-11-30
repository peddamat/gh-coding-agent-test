import { describe, test, expect } from 'vitest';
import {
  getExpandedHolidayDates,
  getExpansionRuleForHoliday,
  hasCustomExpansionRule,
  JULY_4_EXPANSION,
  VETERANS_DAY_EXPANSION,
  HALLOWEEN_EXPANSION,
  type ExpansionRule,
} from '../holidayExpansion';

describe('Holiday Expansion Rules', () => {
  describe('July 4th Expansion', () => {
    // July 4, 2025 (Friday) → July 4-6 (Fri-Sun)
    test('July 4, 2025 (Friday) expands to Fri-Sun', () => {
      const result = getExpandedHolidayDates('2025-07-04', JULY_4_EXPANSION);
      expect(result).toEqual(['2025-07-04', '2025-07-05', '2025-07-06']);
    });

    // July 4, 2026 (Saturday) → July 4-5 (Sat-Sun)
    test('July 4, 2026 (Saturday) expands to Sat-Sun', () => {
      const result = getExpandedHolidayDates('2026-07-04', JULY_4_EXPANSION);
      expect(result).toEqual(['2026-07-04', '2026-07-05']);
    });

    // July 4, 2027 (Sunday) → July 2-4 (Fri-Sun)
    test('July 4, 2027 (Sunday) expands to Fri-Sun', () => {
      const result = getExpandedHolidayDates('2027-07-04', JULY_4_EXPANSION);
      expect(result).toEqual(['2027-07-02', '2027-07-03', '2027-07-04']);
    });

    // July 4, 2028 (Tuesday) → July 4 only
    test('July 4, 2028 (Tuesday) is single day', () => {
      const result = getExpandedHolidayDates('2028-07-04', JULY_4_EXPANSION);
      expect(result).toEqual(['2028-07-04']);
    });

    // July 4, 2029 (Wednesday) → July 4 only
    test('July 4, 2029 (Wednesday) is single day', () => {
      const result = getExpandedHolidayDates('2029-07-04', JULY_4_EXPANSION);
      expect(result).toEqual(['2029-07-04']);
    });

    // July 4, 2030 (Thursday) → July 4 only
    test('July 4, 2030 (Thursday) is single day', () => {
      const result = getExpandedHolidayDates('2030-07-04', JULY_4_EXPANSION);
      expect(result).toEqual(['2030-07-04']);
    });

    // July 4, 2033 (Monday) → July 2-4 (Sat-Mon)
    test('July 4, 2033 (Monday) expands to Sat-Mon', () => {
      const result = getExpandedHolidayDates('2033-07-04', JULY_4_EXPANSION);
      expect(result).toEqual(['2033-07-02', '2033-07-03', '2033-07-04']);
    });
  });

  describe('Veterans Day Expansion', () => {
    // Veterans Day 2024 (Monday, Nov 11) → Sat-Mon
    test('Veterans Day on Monday expands to Sat-Mon', () => {
      const result = getExpandedHolidayDates('2024-11-11', VETERANS_DAY_EXPANSION);
      expect(result).toEqual(['2024-11-09', '2024-11-10', '2024-11-11']);
    });

    // Veterans Day 2025 (Tuesday, Nov 11) → single day
    test('Veterans Day on Tuesday is single day', () => {
      const result = getExpandedHolidayDates('2025-11-11', VETERANS_DAY_EXPANSION);
      expect(result).toEqual(['2025-11-11']);
    });

    // Veterans Day 2026 (Wednesday, Nov 11) → single day
    test('Veterans Day on Wednesday is single day', () => {
      const result = getExpandedHolidayDates('2026-11-11', VETERANS_DAY_EXPANSION);
      expect(result).toEqual(['2026-11-11']);
    });

    // Veterans Day 2027 (Thursday, Nov 11) → single day
    test('Veterans Day on Thursday is single day', () => {
      const result = getExpandedHolidayDates('2027-11-11', VETERANS_DAY_EXPANSION);
      expect(result).toEqual(['2027-11-11']);
    });

    // Veterans Day 2028 (Saturday, Nov 11) → Sat-Sun
    test('Veterans Day on Saturday expands to Sat-Sun', () => {
      const result = getExpandedHolidayDates('2028-11-11', VETERANS_DAY_EXPANSION);
      expect(result).toEqual(['2028-11-11', '2028-11-12']);
    });

    // Veterans Day 2029 (Sunday, Nov 11) → Fri-Sun (includes Saturday)
    test('Veterans Day on Sunday expands to Fri-Sun', () => {
      const result = getExpandedHolidayDates('2029-11-11', VETERANS_DAY_EXPANSION);
      expect(result).toEqual(['2029-11-09', '2029-11-10', '2029-11-11']);
    });

    // Veterans Day 2031 (Friday, Nov 11) → Fri-Sun
    test('Veterans Day on Friday expands to Fri-Sun', () => {
      // Nov 11, 2031 is a Tuesday, so we need to find a year where it's Friday
      // Nov 11, 2022 was Friday
      const result = getExpandedHolidayDates('2022-11-11', VETERANS_DAY_EXPANSION);
      expect(result).toEqual(['2022-11-11', '2022-11-12', '2022-11-13']);
    });
  });

  describe('Halloween Expansion', () => {
    // Halloween always single day regardless of day of week
    test('Halloween is always single day (Monday)', () => {
      // Oct 31, 2022 was Monday
      const result = getExpandedHolidayDates('2022-10-31', HALLOWEEN_EXPANSION);
      expect(result).toEqual(['2022-10-31']);
    });

    test('Halloween is always single day (Tuesday)', () => {
      // Oct 31, 2023 was Tuesday
      const result = getExpandedHolidayDates('2023-10-31', HALLOWEEN_EXPANSION);
      expect(result).toEqual(['2023-10-31']);
    });

    test('Halloween is always single day (Thursday)', () => {
      // Oct 31, 2024 is Thursday
      const result = getExpandedHolidayDates('2024-10-31', HALLOWEEN_EXPANSION);
      expect(result).toEqual(['2024-10-31']);
    });

    test('Halloween is always single day (Friday)', () => {
      // Oct 31, 2025 is Friday
      const result = getExpandedHolidayDates('2025-10-31', HALLOWEEN_EXPANSION);
      expect(result).toEqual(['2025-10-31']);
    });

    test('Halloween is always single day (Saturday)', () => {
      // Oct 31, 2026 is Saturday
      const result = getExpandedHolidayDates('2026-10-31', HALLOWEEN_EXPANSION);
      expect(result).toEqual(['2026-10-31']);
    });

    test('Halloween is always single day (Sunday)', () => {
      // Oct 31, 2027 is Sunday
      const result = getExpandedHolidayDates('2027-10-31', HALLOWEEN_EXPANSION);
      expect(result).toEqual(['2027-10-31']);
    });
  });

  describe('Always Expansion Rule', () => {
    test('expands to 1 day', () => {
      const rule: ExpansionRule = { type: 'always', days: 1 };
      const result = getExpandedHolidayDates('2025-01-01', rule);
      expect(result).toEqual(['2025-01-01']);
    });

    test('expands to 3 days', () => {
      const rule: ExpansionRule = { type: 'always', days: 3 };
      const result = getExpandedHolidayDates('2025-01-01', rule);
      expect(result).toEqual(['2025-01-01', '2025-01-02', '2025-01-03']);
    });

    test('expands to 7 days', () => {
      const rule: ExpansionRule = { type: 'always', days: 7 };
      const result = getExpandedHolidayDates('2025-01-01', rule);
      expect(result).toEqual([
        '2025-01-01',
        '2025-01-02',
        '2025-01-03',
        '2025-01-04',
        '2025-01-05',
        '2025-01-06',
        '2025-01-07',
      ]);
    });
  });

  describe('Weekend Adjacent Expansion Rule', () => {
    test('full-weekend on Friday expands to Fri-Sun', () => {
      const rule: ExpansionRule = { type: 'weekend-adjacent', expandTo: 'full-weekend' };
      // 2025-01-03 is Friday
      const result = getExpandedHolidayDates('2025-01-03', rule);
      expect(result).toEqual(['2025-01-03', '2025-01-04', '2025-01-05']);
    });

    test('full-weekend on Saturday expands to Sat-Sun', () => {
      const rule: ExpansionRule = { type: 'weekend-adjacent', expandTo: 'full-weekend' };
      // 2025-01-04 is Saturday
      const result = getExpandedHolidayDates('2025-01-04', rule);
      expect(result).toEqual(['2025-01-04', '2025-01-05']);
    });

    test('full-weekend on Sunday expands to Sat-Sun', () => {
      const rule: ExpansionRule = { type: 'weekend-adjacent', expandTo: 'full-weekend' };
      // 2025-01-05 is Sunday
      const result = getExpandedHolidayDates('2025-01-05', rule);
      expect(result).toEqual(['2025-01-04', '2025-01-05']);
    });

    test('full-weekend on Monday expands to Sat-Mon', () => {
      const rule: ExpansionRule = { type: 'weekend-adjacent', expandTo: 'full-weekend' };
      // 2025-01-06 is Monday
      const result = getExpandedHolidayDates('2025-01-06', rule);
      expect(result).toEqual(['2025-01-04', '2025-01-05', '2025-01-06']);
    });

    test('full-weekend on Wednesday returns single day', () => {
      const rule: ExpansionRule = { type: 'weekend-adjacent', expandTo: 'full-weekend' };
      // 2025-01-08 is Wednesday
      const result = getExpandedHolidayDates('2025-01-08', rule);
      expect(result).toEqual(['2025-01-08']);
    });

    test('include-friday on Sunday expands to Fri-Sun', () => {
      const rule: ExpansionRule = { type: 'weekend-adjacent', expandTo: 'include-friday' };
      // 2025-01-05 is Sunday
      const result = getExpandedHolidayDates('2025-01-05', rule);
      expect(result).toEqual(['2025-01-03', '2025-01-04', '2025-01-05']);
    });

    test('include-friday on Saturday expands to Fri-Sat', () => {
      const rule: ExpansionRule = { type: 'weekend-adjacent', expandTo: 'include-friday' };
      // 2025-01-04 is Saturday
      const result = getExpandedHolidayDates('2025-01-04', rule);
      expect(result).toEqual(['2025-01-03', '2025-01-04']);
    });

    test('include-friday on Wednesday returns single day', () => {
      const rule: ExpansionRule = { type: 'weekend-adjacent', expandTo: 'include-friday' };
      // 2025-01-08 is Wednesday
      const result = getExpandedHolidayDates('2025-01-08', rule);
      expect(result).toEqual(['2025-01-08']);
    });

    test('include-monday on Saturday expands to Sat-Mon', () => {
      const rule: ExpansionRule = { type: 'weekend-adjacent', expandTo: 'include-monday' };
      // 2025-01-04 is Saturday
      const result = getExpandedHolidayDates('2025-01-04', rule);
      expect(result).toEqual(['2025-01-04', '2025-01-05', '2025-01-06']);
    });

    test('include-monday on Sunday expands to Sun-Mon', () => {
      const rule: ExpansionRule = { type: 'weekend-adjacent', expandTo: 'include-monday' };
      // 2025-01-05 is Sunday
      const result = getExpandedHolidayDates('2025-01-05', rule);
      expect(result).toEqual(['2025-01-05', '2025-01-06']);
    });

    test('include-monday on Wednesday returns single day', () => {
      const rule: ExpansionRule = { type: 'weekend-adjacent', expandTo: 'include-monday' };
      // 2025-01-08 is Wednesday
      const result = getExpandedHolidayDates('2025-01-08', rule);
      expect(result).toEqual(['2025-01-08']);
    });
  });

  describe('Day of Week Conditional Rule (custom rules)', () => {
    test('handles rule with no matching day of week', () => {
      const rule: ExpansionRule = {
        type: 'day-of-week-conditional',
        rules: [
          { dayOfWeek: [5], expansion: 'full-weekend' }, // Only Friday
        ],
      };
      // 2025-01-08 is Wednesday (day 3)
      const result = getExpandedHolidayDates('2025-01-08', rule);
      // No rule for Wednesday, should return just the base date
      expect(result).toEqual(['2025-01-08']);
    });

    test('applies correct rule when multiple rules exist', () => {
      const rule: ExpansionRule = {
        type: 'day-of-week-conditional',
        rules: [
          { dayOfWeek: [5], expansion: 'full-weekend' },
          { dayOfWeek: [1, 2, 3, 4], expansion: 'none' },
        ],
      };
      // 2025-01-07 is Tuesday (day 2)
      const result = getExpandedHolidayDates('2025-01-07', rule);
      expect(result).toEqual(['2025-01-07']);
    });
  });

  describe('getExpansionRuleForHoliday', () => {
    test('returns expansion rule for independence-day', () => {
      const rule = getExpansionRuleForHoliday('independence-day');
      expect(rule).toBeDefined();
      expect(rule?.type).toBe('day-of-week-conditional');
    });

    test('returns expansion rule for veterans-day', () => {
      const rule = getExpansionRuleForHoliday('veterans-day');
      expect(rule).toBeDefined();
      expect(rule?.type).toBe('day-of-week-conditional');
    });

    test('returns expansion rule for halloween', () => {
      const rule = getExpansionRuleForHoliday('halloween');
      expect(rule).toBeDefined();
      expect(rule?.type).toBe('always');
    });

    test('returns undefined for unknown holiday', () => {
      const rule = getExpansionRuleForHoliday('unknown-holiday');
      expect(rule).toBeUndefined();
    });

    test('returns undefined for mlk-day (no expansion rule)', () => {
      const rule = getExpansionRuleForHoliday('mlk-day');
      expect(rule).toBeUndefined();
    });
  });

  describe('hasCustomExpansionRule', () => {
    test('returns true for independence-day', () => {
      expect(hasCustomExpansionRule('independence-day')).toBe(true);
    });

    test('returns true for veterans-day', () => {
      expect(hasCustomExpansionRule('veterans-day')).toBe(true);
    });

    test('returns true for halloween', () => {
      expect(hasCustomExpansionRule('halloween')).toBe(true);
    });

    test('returns false for mlk-day', () => {
      expect(hasCustomExpansionRule('mlk-day')).toBe(false);
    });

    test('returns false for thanksgiving', () => {
      expect(hasCustomExpansionRule('thanksgiving')).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('handles year boundary (Dec 31 Friday expanding to Jan)', () => {
      const rule: ExpansionRule = { type: 'weekend-adjacent', expandTo: 'full-weekend' };
      // Need to find a year where Dec 31 is Friday
      // Dec 31, 2021 was Friday
      const result = getExpandedHolidayDates('2021-12-31', rule);
      expect(result).toEqual(['2021-12-31', '2022-01-01', '2022-01-02']);
    });

    test('handles leap year Feb 29', () => {
      const rule: ExpansionRule = { type: 'always', days: 3 };
      // Feb 29, 2024 (leap year)
      const result = getExpandedHolidayDates('2024-02-29', rule);
      expect(result).toEqual(['2024-02-29', '2024-03-01', '2024-03-02']);
    });

    test('handles month boundary expansion', () => {
      const rule: ExpansionRule = { type: 'always', days: 3 };
      // Jan 31 expanding into Feb
      const result = getExpandedHolidayDates('2025-01-31', rule);
      expect(result).toEqual(['2025-01-31', '2025-02-01', '2025-02-02']);
    });
  });

  describe('5-Year Drift Test', () => {
    // Ensure July 4 expansion is consistent over 5 years
    test('July 4 expansion is consistent over 5 years', () => {
      const years = [2025, 2026, 2027, 2028, 2029];
      const results = years.map((year) => ({
        year,
        dates: getExpandedHolidayDates(`${year}-07-04`, JULY_4_EXPANSION),
      }));

      // Each result should be a non-empty array
      results.forEach((r) => {
        expect(r.dates.length).toBeGreaterThan(0);
        // All dates should contain the base date (July 4)
        expect(r.dates.some((d) => d.includes('-07-04'))).toBe(true);
      });

      // Verify specific years
      // 2025: Friday
      expect(results[0].dates).toEqual(['2025-07-04', '2025-07-05', '2025-07-06']);
      // 2026: Saturday
      expect(results[1].dates).toEqual(['2026-07-04', '2026-07-05']);
      // 2027: Sunday
      expect(results[2].dates).toEqual(['2027-07-02', '2027-07-03', '2027-07-04']);
      // 2028: Tuesday
      expect(results[3].dates).toEqual(['2028-07-04']);
      // 2029: Wednesday
      expect(results[4].dates).toEqual(['2029-07-04']);
    });
  });
});
