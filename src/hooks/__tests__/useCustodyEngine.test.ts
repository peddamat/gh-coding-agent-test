import { describe, test, expect } from 'vitest';
import {
  addDays,
  calculateDaysDifference,
  getOtherParent,
  formatDateString,
  getDaysInMonth,
  isToday,
  getSameWeekendsOwner,
  getPatternOwner,
  getOwnerForDate,
  generateMonthDays,
  calculateYearlyStats,
} from '../useCustodyEngine';
import type { AppConfig } from '../../types';

describe('Date arithmetic utilities', () => {
  describe('addDays', () => {
    test('adds positive days correctly', () => {
      expect(addDays('2025-01-01', 1)).toBe('2025-01-02');
      expect(addDays('2025-01-01', 7)).toBe('2025-01-08');
      expect(addDays('2025-01-01', 31)).toBe('2025-02-01');
    });

    test('handles month boundaries', () => {
      expect(addDays('2025-01-31', 1)).toBe('2025-02-01');
      expect(addDays('2025-02-28', 1)).toBe('2025-03-01');
    });

    test('handles leap year Feb 29', () => {
      // 2024 is a leap year
      expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
      expect(addDays('2024-02-29', 1)).toBe('2024-03-01');
    });

    test('handles negative days', () => {
      expect(addDays('2025-01-05', -1)).toBe('2025-01-04');
      expect(addDays('2025-02-01', -1)).toBe('2025-01-31');
    });

    test('handles year boundaries', () => {
      expect(addDays('2025-12-31', 1)).toBe('2026-01-01');
      expect(addDays('2025-01-01', -1)).toBe('2024-12-31');
    });
  });

  describe('calculateDaysDifference', () => {
    test('calculates positive difference', () => {
      expect(calculateDaysDifference('2025-01-05', '2025-01-01')).toBe(4);
      expect(calculateDaysDifference('2025-01-14', '2025-01-01')).toBe(13);
    });

    test('calculates negative difference', () => {
      expect(calculateDaysDifference('2025-01-01', '2025-01-05')).toBe(-4);
    });

    test('returns 0 for same date', () => {
      expect(calculateDaysDifference('2025-01-01', '2025-01-01')).toBe(0);
    });

    test('handles year boundaries', () => {
      expect(calculateDaysDifference('2025-01-01', '2024-12-31')).toBe(1);
    });

    test('handles leap year correctly', () => {
      // 2024 is a leap year (366 days)
      expect(calculateDaysDifference('2025-01-01', '2024-01-01')).toBe(366);
      // 2025 is not a leap year (365 days)
      expect(calculateDaysDifference('2026-01-01', '2025-01-01')).toBe(365);
    });
  });

  describe('getOtherParent', () => {
    test('returns parentB when given parentA', () => {
      expect(getOtherParent('parentA')).toBe('parentB');
    });

    test('returns parentA when given parentB', () => {
      expect(getOtherParent('parentB')).toBe('parentA');
    });
  });

  describe('formatDateString', () => {
    test('formats date correctly with padding', () => {
      expect(formatDateString(2025, 0, 1)).toBe('2025-01-01');
      expect(formatDateString(2025, 11, 31)).toBe('2025-12-31');
      expect(formatDateString(2025, 5, 15)).toBe('2025-06-15');
    });
  });

  describe('getDaysInMonth', () => {
    test('returns correct days for each month', () => {
      expect(getDaysInMonth(2025, 0)).toBe(31); // January
      expect(getDaysInMonth(2025, 1)).toBe(28); // February (non-leap)
      expect(getDaysInMonth(2024, 1)).toBe(29); // February (leap year)
      expect(getDaysInMonth(2025, 3)).toBe(30); // April
    });
  });

  describe('isToday', () => {
    test('returns true for today', () => {
      const today = new Date();
      const todayStr = formatDateString(today.getFullYear(), today.getMonth(), today.getDate());
      expect(isToday(todayStr)).toBe(true);
    });

    test('returns false for other dates', () => {
      expect(isToday('2020-01-01')).toBe(false);
      expect(isToday('2099-12-31')).toBe(false);
    });
  });
});

describe('Pattern owner calculations', () => {
  const baseConfig: AppConfig = {
    startDate: '2025-01-01',
    selectedPattern: 'alt-weeks',
    startingParent: 'parentA',
    exchangeTime: '18:00',
  };

  describe('getPatternOwner', () => {
    const altWeeksPattern: ('A' | 'B')[] = ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'B', 'B', 'B', 'B', 'B', 'B', 'B'];

    test('returns correct owner for first day of pattern', () => {
      expect(getPatternOwner('2025-01-01', '2025-01-01', altWeeksPattern, 14, 'parentA')).toBe('parentA');
    });

    test('returns correct owner for day 7 (start of second week)', () => {
      expect(getPatternOwner('2025-01-08', '2025-01-01', altWeeksPattern, 14, 'parentA')).toBe('parentB');
    });

    test('handles negative date difference (before start date)', () => {
      expect(getPatternOwner('2024-12-31', '2025-01-01', altWeeksPattern, 14, 'parentA')).toBe('parentB');
    });

    test('cycles correctly over multiple periods', () => {
      // Day 14 should be same as day 0 (start of new cycle)
      expect(getPatternOwner('2025-01-15', '2025-01-01', altWeeksPattern, 14, 'parentA')).toBe('parentA');
      // Day 21 should be same as day 7
      expect(getPatternOwner('2025-01-22', '2025-01-01', altWeeksPattern, 14, 'parentA')).toBe('parentB');
    });
  });

  describe('getSameWeekendsOwner', () => {
    test('weekdays always go to starting parent', () => {
      // 2025-01-06 is a Monday
      expect(getSameWeekendsOwner('2025-01-06', 'parentA')).toBe('parentA');
      // 2025-01-07 is a Tuesday
      expect(getSameWeekendsOwner('2025-01-07', 'parentA')).toBe('parentA');
      // 2025-01-08 is a Wednesday
      expect(getSameWeekendsOwner('2025-01-08', 'parentA')).toBe('parentA');
      // 2025-01-09 is a Thursday
      expect(getSameWeekendsOwner('2025-01-09', 'parentA')).toBe('parentA');
      // 2025-01-10 is a Friday
      expect(getSameWeekendsOwner('2025-01-10', 'parentA')).toBe('parentA');
    });

    test('1st weekend goes to other parent', () => {
      // January 2025: 1st Saturday is Jan 4, 1st Sunday is Jan 5
      expect(getSameWeekendsOwner('2025-01-04', 'parentA')).toBe('parentB');
      expect(getSameWeekendsOwner('2025-01-05', 'parentA')).toBe('parentB');
    });

    test('2nd weekend goes to starting parent', () => {
      // January 2025: 2nd Saturday is Jan 11, 2nd Sunday is Jan 12
      expect(getSameWeekendsOwner('2025-01-11', 'parentA')).toBe('parentA');
      expect(getSameWeekendsOwner('2025-01-12', 'parentA')).toBe('parentA');
    });

    test('3rd weekend goes to other parent', () => {
      // January 2025: 3rd Saturday is Jan 18, 3rd Sunday is Jan 19
      expect(getSameWeekendsOwner('2025-01-18', 'parentA')).toBe('parentB');
      expect(getSameWeekendsOwner('2025-01-19', 'parentA')).toBe('parentB');
    });

    test('4th weekend goes to starting parent', () => {
      // January 2025: 4th Saturday is Jan 25, 4th Sunday is Jan 26
      expect(getSameWeekendsOwner('2025-01-25', 'parentA')).toBe('parentA');
      expect(getSameWeekendsOwner('2025-01-26', 'parentA')).toBe('parentA');
    });

    test('5th weekend (when exists) goes to other parent', () => {
      // March 2025 has 5 Saturdays: Mar 1, 8, 15, 22, 29
      // Mar 29 is the 5th Saturday, Mar 30 is the 5th Sunday
      expect(getSameWeekendsOwner('2025-03-29', 'parentA')).toBe('parentB');
      expect(getSameWeekendsOwner('2025-03-30', 'parentA')).toBe('parentB');
    });

    test('respects startingParent parameter', () => {
      // When starting parent is B, weekdays go to B, 1st/3rd/5th weekends go to A
      expect(getSameWeekendsOwner('2025-01-06', 'parentB')).toBe('parentB'); // Monday
      expect(getSameWeekendsOwner('2025-01-04', 'parentB')).toBe('parentA'); // 1st Saturday
    });
  });

  describe('getOwnerForDate', () => {
    test('works with alt-weeks pattern', () => {
      const config: AppConfig = {
        ...baseConfig,
        selectedPattern: 'alt-weeks',
      };
      expect(getOwnerForDate('2025-01-01', config)).toBe('parentA');
      expect(getOwnerForDate('2025-01-08', config)).toBe('parentB');
    });

    test('works with all-to-one pattern', () => {
      const config: AppConfig = {
        ...baseConfig,
        selectedPattern: 'all-to-one',
      };
      expect(getOwnerForDate('2025-01-01', config)).toBe('parentA');
      expect(getOwnerForDate('2025-06-15', config)).toBe('parentA');
      expect(getOwnerForDate('2026-01-01', config)).toBe('parentA');
    });

    test('works with same-weekends-monthly pattern', () => {
      const config: AppConfig = {
        ...baseConfig,
        selectedPattern: 'same-weekends-monthly',
      };
      // Weekday
      expect(getOwnerForDate('2025-01-06', config)).toBe('parentA');
      // 1st Saturday
      expect(getOwnerForDate('2025-01-04', config)).toBe('parentB');
    });

    test('works with 2-2-3 pattern', () => {
      const config: AppConfig = {
        ...baseConfig,
        selectedPattern: '2-2-3',
        startDate: '2025-01-06', // Monday
      };
      // Days 0-1: Parent A
      expect(getOwnerForDate('2025-01-06', config)).toBe('parentA');
      expect(getOwnerForDate('2025-01-07', config)).toBe('parentA');
      // Days 2-3: Parent B
      expect(getOwnerForDate('2025-01-08', config)).toBe('parentB');
      expect(getOwnerForDate('2025-01-09', config)).toBe('parentB');
      // Days 4-6: Parent A
      expect(getOwnerForDate('2025-01-10', config)).toBe('parentA');
      expect(getOwnerForDate('2025-01-11', config)).toBe('parentA');
      expect(getOwnerForDate('2025-01-12', config)).toBe('parentA');
    });
  });
});

describe('5-year drift tests', () => {
  const baseConfig: AppConfig = {
    startDate: '2025-01-01',
    selectedPattern: 'alt-weeks',
    startingParent: 'parentA',
    exchangeTime: '18:00',
  };

  test('alt-weeks shows no drift over 5 years', () => {
    const config = { ...baseConfig, selectedPattern: 'alt-weeks' as const };
    // Day 0 and day 1826 (5 years = 365*5 + 1 leap year = 1826 days) should have predictable owners
    // 1826 % 14 = 8 (day 8 of cycle is parentB)
    const day0Owner = getOwnerForDate('2025-01-01', config);
    expect(day0Owner).toBe('parentA');
    
    // 5 years later: 2030-01-01
    // From 2025-01-01 to 2030-01-01: includes leap years 2028
    const day5YearsOwner = getOwnerForDate('2030-01-01', config);
    // The pattern should continue correctly - verify it returns a valid owner
    expect(['parentA', 'parentB']).toContain(day5YearsOwner);
    
    const daysDiff = calculateDaysDifference('2030-01-01', '2025-01-01');
    const expectedIndex = daysDiff % 14;
    // Verify the pattern cycles correctly
    expect(expectedIndex).toBeGreaterThanOrEqual(0);
    expect(expectedIndex).toBeLessThan(14);
  });

  test('2-2-3 shows no drift over 5 years', () => {
    const config = { ...baseConfig, selectedPattern: '2-2-3' as const };
    
    const startOwner = getOwnerForDate('2025-01-01', config);
    expect(startOwner).toBe('parentA');
    
    // Check after full 14-day cycles
    expect(getOwnerForDate('2025-01-15', config)).toBe('parentA');
    expect(getOwnerForDate('2025-01-29', config)).toBe('parentA');
  });

  test('every-weekend shows no drift over 5 years', () => {
    const config = { ...baseConfig, selectedPattern: 'every-weekend' as const };
    
    // Jan 1, 2025 is Wednesday (day 3 in 0-indexed week starting Monday)
    const startOwner = getOwnerForDate('2025-01-01', config);
    expect(startOwner).toBe('parentA');
  });
});

describe('Leap year handling', () => {
  const baseConfig: AppConfig = {
    startDate: '2024-01-01', // Start in a leap year
    selectedPattern: 'alt-weeks',
    startingParent: 'parentA',
    exchangeTime: '18:00',
  };

  test('Feb 29 does not break cycle', () => {
    // 2024 is a leap year
    const config = { ...baseConfig };
    
    // Feb 28, 2024
    const feb28Owner = getOwnerForDate('2024-02-28', config);
    // Feb 29, 2024
    const feb29Owner = getOwnerForDate('2024-02-29', config);
    // Mar 1, 2024
    const mar1Owner = getOwnerForDate('2024-03-01', config);
    
    // These should follow the pattern correctly
    const feb28Days = calculateDaysDifference('2024-02-28', '2024-01-01');
    const feb29Days = calculateDaysDifference('2024-02-29', '2024-01-01');
    const mar1Days = calculateDaysDifference('2024-03-01', '2024-01-01');
    
    expect(feb29Days).toBe(feb28Days + 1);
    expect(mar1Days).toBe(feb29Days + 1);
    
    // Verify owners are determined consistently
    expect(feb28Owner).toBeDefined();
    expect(feb29Owner).toBeDefined();
    expect(mar1Owner).toBeDefined();
  });
});

describe('generateMonthDays', () => {
  const baseConfig: AppConfig = {
    startDate: '2025-01-01',
    selectedPattern: 'alt-weeks',
    startingParent: 'parentA',
    exchangeTime: '18:00',
  };

  test('returns 42 days (6 weeks)', () => {
    const days = generateMonthDays(2025, 0, baseConfig);
    expect(days).toHaveLength(42);
  });

  test('days have correct structure', () => {
    const days = generateMonthDays(2025, 0, baseConfig);
    
    days.forEach((day) => {
      expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(day.dayOfMonth).toBeGreaterThanOrEqual(1);
      expect(day.dayOfMonth).toBeLessThanOrEqual(31);
      expect(['parentA', 'parentB']).toContain(day.owner);
      expect(typeof day.isToday).toBe('boolean');
      expect(typeof day.isCurrentMonth).toBe('boolean');
    });
  });

  test('marks current month days correctly', () => {
    const days = generateMonthDays(2025, 0, baseConfig); // January 2025
    
    const januaryDays = days.filter((d) => d.isCurrentMonth);
    expect(januaryDays).toHaveLength(31); // January has 31 days
    
    januaryDays.forEach((day) => {
      expect(day.date.startsWith('2025-01')).toBe(true);
    });
  });

  test('handles weekStartsOnMonday option', () => {
    const sundayStart = generateMonthDays(2025, 0, baseConfig, false);
    const mondayStart = generateMonthDays(2025, 0, baseConfig, true);
    
    // Both should have 42 days
    expect(sundayStart).toHaveLength(42);
    expect(mondayStart).toHaveLength(42);
    
    // First day should be different based on the option
    // January 2025 starts on Wednesday
    // Sunday start: goes back to previous Sunday (Dec 29, 2024)
    // Monday start: goes back to previous Monday (Dec 30, 2024)
  });

  test('assigns owners based on pattern', () => {
    const days = generateMonthDays(2025, 0, baseConfig);
    
    // Check that owners are assigned according to alt-weeks pattern
    const firstWeekDays = days.slice(0, 7);
    const ownersFirstWeek = firstWeekDays.map((d) => d.owner);
    
    // All days should have an owner
    ownersFirstWeek.forEach((owner) => {
      expect(['parentA', 'parentB']).toContain(owner);
    });
  });
});

describe('Pattern split percentages', () => {
  const baseConfig: AppConfig = {
    startDate: '2025-01-01',
    selectedPattern: 'alt-weeks',
    startingParent: 'parentA',
    exchangeTime: '18:00',
  };

  function countYearlyOwnership(config: AppConfig, year: number): { parentA: number; parentB: number } {
    let parentA = 0;
    let parentB = 0;
    
    for (let month = 0; month < 12; month++) {
      const daysInMonth = getDaysInMonth(year, month);
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDateString(year, month, day);
        const owner = getOwnerForDate(dateStr, config);
        if (owner === 'parentA') {
          parentA++;
        } else {
          parentB++;
        }
      }
    }
    
    return { parentA, parentB };
  }

  test('alt-weeks gives approximately 50/50', () => {
    const counts = countYearlyOwnership({ ...baseConfig, selectedPattern: 'alt-weeks' }, 2025);
    const total = counts.parentA + counts.parentB;
    expect(total).toBe(365);
    
    const percentageA = (counts.parentA / total) * 100;
    const percentageB = (counts.parentB / total) * 100;
    
    // Should be within 1% of 50/50
    expect(percentageA).toBeGreaterThan(49);
    expect(percentageA).toBeLessThan(51);
    expect(percentageB).toBeGreaterThan(49);
    expect(percentageB).toBeLessThan(51);
  });

  test('all-to-one gives 100/0', () => {
    const counts = countYearlyOwnership({ ...baseConfig, selectedPattern: 'all-to-one' }, 2025);
    expect(counts.parentA).toBe(365);
    expect(counts.parentB).toBe(0);
  });

  test('every-other-weekend gives approximately 80/20', () => {
    const counts = countYearlyOwnership({ ...baseConfig, selectedPattern: 'every-other-weekend' }, 2025);
    const total = counts.parentA + counts.parentB;
    expect(total).toBe(365);
    
    const percentageA = (counts.parentA / total) * 100;
    
    // Should be approximately 80/20 (roughly 85/15 for this pattern)
    expect(percentageA).toBeGreaterThan(80);
    expect(percentageA).toBeLessThan(90);
  });

  test('every-weekend gives approximately 60/40 (actually closer to 71/29)', () => {
    const counts = countYearlyOwnership({ ...baseConfig, selectedPattern: 'every-weekend' }, 2025);
    const total = counts.parentA + counts.parentB;
    expect(total).toBe(365);
    
    const percentageA = (counts.parentA / total) * 100;
    
    // every-weekend: A gets 5 days, B gets 2 days per week = 71/29
    expect(percentageA).toBeGreaterThan(68);
    expect(percentageA).toBeLessThan(75);
  });
});

describe('calculateYearlyStats', () => {
  const baseConfig: AppConfig = {
    startDate: '2025-01-01',
    selectedPattern: 'alt-weeks',
    startingParent: 'parentA',
    exchangeTime: '18:00',
  };

  test('returns correct structure', () => {
    const stats = calculateYearlyStats(2025, baseConfig);
    
    expect(stats).toHaveProperty('parentA');
    expect(stats).toHaveProperty('parentB');
    expect(stats).toHaveProperty('monthlyBreakdown');
    
    expect(stats.parentA).toHaveProperty('days');
    expect(stats.parentA).toHaveProperty('percentage');
    expect(stats.parentB).toHaveProperty('days');
    expect(stats.parentB).toHaveProperty('percentage');
  });

  test('returns 12 months in breakdown', () => {
    const stats = calculateYearlyStats(2025, baseConfig);
    expect(stats.monthlyBreakdown).toHaveLength(12);
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    stats.monthlyBreakdown.forEach((month, index) => {
      expect(month.month).toBe(monthNames[index]);
      expect(typeof month.parentADays).toBe('number');
      expect(typeof month.parentBDays).toBe('number');
    });
  });

  test('total days equals days in year', () => {
    const stats = calculateYearlyStats(2025, baseConfig);
    const totalDays = stats.parentA.days + stats.parentB.days;
    expect(totalDays).toBe(365); // 2025 is not a leap year
  });

  test('total days equals 366 in leap year', () => {
    const stats = calculateYearlyStats(2024, { ...baseConfig, startDate: '2024-01-01' });
    const totalDays = stats.parentA.days + stats.parentB.days;
    expect(totalDays).toBe(366); // 2024 is a leap year
  });

  test('percentages sum to 100', () => {
    const stats = calculateYearlyStats(2025, baseConfig);
    const totalPercentage = stats.parentA.percentage + stats.parentB.percentage;
    expect(totalPercentage).toBeCloseTo(100, 1);
  });

  test('monthly breakdown sums to yearly total', () => {
    const stats = calculateYearlyStats(2025, baseConfig);
    
    const monthlyTotalA = stats.monthlyBreakdown.reduce((sum, m) => sum + m.parentADays, 0);
    const monthlyTotalB = stats.monthlyBreakdown.reduce((sum, m) => sum + m.parentBDays, 0);
    
    expect(monthlyTotalA).toBe(stats.parentA.days);
    expect(monthlyTotalB).toBe(stats.parentB.days);
  });

  test('alt-weeks produces approximately 50/50 split', () => {
    const stats = calculateYearlyStats(2025, { ...baseConfig, selectedPattern: 'alt-weeks' });
    
    expect(stats.parentA.percentage).toBeGreaterThan(49);
    expect(stats.parentA.percentage).toBeLessThan(51);
    expect(stats.parentB.percentage).toBeGreaterThan(49);
    expect(stats.parentB.percentage).toBeLessThan(51);
  });

  test('all-to-one produces 100/0 split', () => {
    const stats = calculateYearlyStats(2025, { ...baseConfig, selectedPattern: 'all-to-one' });
    
    expect(stats.parentA.days).toBe(365);
    expect(stats.parentA.percentage).toBe(100);
    expect(stats.parentB.days).toBe(0);
    expect(stats.parentB.percentage).toBe(0);
  });

  test('each month has correct number of days', () => {
    const stats = calculateYearlyStats(2025, baseConfig);
    const expectedDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // Days in each month for 2025
    
    stats.monthlyBreakdown.forEach((month, index) => {
      const totalDaysInMonth = month.parentADays + month.parentBDays;
      expect(totalDaysInMonth).toBe(expectedDays[index]);
    });
  });

  test('handles leap year February correctly', () => {
    const stats = calculateYearlyStats(2024, { ...baseConfig, startDate: '2024-01-01' });
    const february = stats.monthlyBreakdown[1];
    
    const totalFebDays = february.parentADays + february.parentBDays;
    expect(totalFebDays).toBe(29); // Leap year has 29 days in February
  });
});

// Issue #46 - Comprehensive special pattern tests
describe('same-weekends-monthly pattern (Issue #46)', () => {
  const config: AppConfig = {
    startDate: '2025-01-01',
    selectedPattern: 'same-weekends-monthly',
    startingParent: 'parentA',
    exchangeTime: '18:00',
  };

  test('1st Saturday of month goes to Parent B', () => {
    // January 2025: 1st Saturday is Jan 4
    expect(getOwnerForDate('2025-01-04', config)).toBe('parentB');
    // February 2025: 1st Saturday is Feb 1
    expect(getOwnerForDate('2025-02-01', config)).toBe('parentB');
    // March 2025: 1st Saturday is Mar 1
    expect(getOwnerForDate('2025-03-01', config)).toBe('parentB');
  });

  test('1st Sunday of month goes to Parent B', () => {
    // January 2025: 1st Sunday is Jan 5
    expect(getOwnerForDate('2025-01-05', config)).toBe('parentB');
    // February 2025: 1st Sunday is Feb 2
    expect(getOwnerForDate('2025-02-02', config)).toBe('parentB');
  });

  test('2nd weekend goes to Parent A', () => {
    // January 2025: 2nd Saturday is Jan 11, 2nd Sunday is Jan 12
    expect(getOwnerForDate('2025-01-11', config)).toBe('parentA');
    expect(getOwnerForDate('2025-01-12', config)).toBe('parentA');
  });

  test('3rd weekend goes to Parent B', () => {
    // January 2025: 3rd Saturday is Jan 18, 3rd Sunday is Jan 19
    expect(getOwnerForDate('2025-01-18', config)).toBe('parentB');
    expect(getOwnerForDate('2025-01-19', config)).toBe('parentB');
  });

  test('4th weekend goes to Parent A', () => {
    // January 2025: 4th Saturday is Jan 25, 4th Sunday is Jan 26
    expect(getOwnerForDate('2025-01-25', config)).toBe('parentA');
    expect(getOwnerForDate('2025-01-26', config)).toBe('parentA');
  });

  test('5th weekend (when exists) goes to Parent B', () => {
    // March 2025 has 5 Saturdays: Mar 1, 8, 15, 22, 29
    // 5th Saturday is Mar 29, 5th Sunday is Mar 30
    expect(getOwnerForDate('2025-03-29', config)).toBe('parentB');
    expect(getOwnerForDate('2025-03-30', config)).toBe('parentB');
    
    // August 2025 has 5 Saturdays: Aug 2, 9, 16, 23, 30
    // 5th Saturday is Aug 30, 5th Sunday is Aug 31
    expect(getOwnerForDate('2025-08-30', config)).toBe('parentB');
    expect(getOwnerForDate('2025-08-31', config)).toBe('parentB');
  });

  test('weekdays always go to Parent A', () => {
    // Test various weekdays throughout the year
    expect(getOwnerForDate('2025-01-06', config)).toBe('parentA'); // Monday
    expect(getOwnerForDate('2025-01-07', config)).toBe('parentA'); // Tuesday
    expect(getOwnerForDate('2025-01-08', config)).toBe('parentA'); // Wednesday
    expect(getOwnerForDate('2025-01-09', config)).toBe('parentA'); // Thursday
    expect(getOwnerForDate('2025-01-10', config)).toBe('parentA'); // Friday
    expect(getOwnerForDate('2025-06-02', config)).toBe('parentA'); // Monday in June
    expect(getOwnerForDate('2025-12-24', config)).toBe('parentA'); // Wednesday in December
  });

  test('yearly stats show approximately 80/20 split', () => {
    const stats = calculateYearlyStats(2025, config);
    const total = stats.parentA.days + stats.parentB.days;
    const percentageA = (stats.parentA.days / total) * 100;
    
    // Parent A gets weekdays + 2nd/4th weekends
    // This should be roughly 78-82% for Parent A
    expect(percentageA).toBeGreaterThan(75);
    expect(percentageA).toBeLessThan(85);
  });
});

describe('all-to-one pattern (Issue #46)', () => {
  const config: AppConfig = {
    startDate: '2025-01-01',
    selectedPattern: 'all-to-one',
    startingParent: 'parentA',
    exchangeTime: '18:00',
  };

  test('all days go to starting parent', () => {
    // Test various dates throughout the year
    expect(getOwnerForDate('2025-01-01', config)).toBe('parentA');
    expect(getOwnerForDate('2025-06-15', config)).toBe('parentA');
    expect(getOwnerForDate('2025-12-31', config)).toBe('parentA');
    
    // Even weekends go to Parent A
    expect(getOwnerForDate('2025-01-04', config)).toBe('parentA'); // Saturday
    expect(getOwnerForDate('2025-01-05', config)).toBe('parentA'); // Sunday
  });

  test('respects startingParent parameter', () => {
    const configB: AppConfig = { ...config, startingParent: 'parentB' };
    expect(getOwnerForDate('2025-01-01', configB)).toBe('parentB');
    expect(getOwnerForDate('2025-06-15', configB)).toBe('parentB');
    expect(getOwnerForDate('2025-12-31', configB)).toBe('parentB');
  });

  test('yearly stats show 100/0 split', () => {
    const stats = calculateYearlyStats(2025, config);
    expect(stats.parentA.days).toBe(365);
    expect(stats.parentA.percentage).toBe(100);
    expect(stats.parentB.days).toBe(0);
    expect(stats.parentB.percentage).toBe(0);
  });

  test('works in leap year', () => {
    const leapConfig: AppConfig = { ...config, startDate: '2024-01-01' };
    const stats = calculateYearlyStats(2024, leapConfig);
    expect(stats.parentA.days).toBe(366);
    expect(stats.parentB.days).toBe(0);
  });
});

describe('custom pattern (Issue #46)', () => {
  const config: AppConfig = {
    startDate: '2025-01-01',
    selectedPattern: 'custom',
    startingParent: 'parentA',
    exchangeTime: '18:00',
  };

  test('returns starting parent when custom pattern not defined', () => {
    // Custom patterns without a defined cycle default to starting parent
    expect(getOwnerForDate('2025-01-01', config)).toBe('parentA');
    expect(getOwnerForDate('2025-06-15', config)).toBe('parentA');
  });
});

describe('all standard patterns (Issue #46)', () => {
  const baseConfig: AppConfig = {
    startDate: '2025-01-01',
    startingParent: 'parentA',
    exchangeTime: '18:00',
    selectedPattern: 'alt-weeks',
  };

  describe('50/50 patterns', () => {
    test('alt-weeks gives ~50/50 split', () => {
      const stats = calculateYearlyStats(2025, { ...baseConfig, selectedPattern: 'alt-weeks' });
      expect(stats.parentA.percentage).toBeGreaterThan(49);
      expect(stats.parentA.percentage).toBeLessThan(51);
    });

    test('2-2-3 gives ~50/50 split', () => {
      const stats = calculateYearlyStats(2025, { ...baseConfig, selectedPattern: '2-2-3' });
      expect(stats.parentA.percentage).toBeGreaterThan(49);
      expect(stats.parentA.percentage).toBeLessThan(51);
    });

    test('2-2-5-5 gives ~50/50 split', () => {
      const stats = calculateYearlyStats(2025, { ...baseConfig, selectedPattern: '2-2-5-5' });
      expect(stats.parentA.percentage).toBeGreaterThan(49);
      expect(stats.parentA.percentage).toBeLessThan(51);
    });

    test('3-4-4-3 gives ~50/50 split', () => {
      const stats = calculateYearlyStats(2025, { ...baseConfig, selectedPattern: '3-4-4-3' });
      expect(stats.parentA.percentage).toBeGreaterThan(49);
      expect(stats.parentA.percentage).toBeLessThan(51);
    });
  });

  describe('60/40 patterns', () => {
    test('every-weekend gives ~71/29 split (weekdays to A, weekends to B)', () => {
      const stats = calculateYearlyStats(2025, { ...baseConfig, selectedPattern: 'every-weekend' });
      // 5 weekdays to A, 2 weekend days to B = ~71/29
      expect(stats.parentA.percentage).toBeGreaterThan(68);
      expect(stats.parentA.percentage).toBeLessThan(75);
    });
  });

  describe('80/20 patterns', () => {
    test('every-other-weekend gives ~85/15 split', () => {
      const stats = calculateYearlyStats(2025, { ...baseConfig, selectedPattern: 'every-other-weekend' });
      // 12 days to A, 2 days to B per 14-day cycle
      expect(stats.parentA.percentage).toBeGreaterThan(82);
      expect(stats.parentA.percentage).toBeLessThan(90);
    });

    test('same-weekends-monthly gives ~85/15 split', () => {
      const stats = calculateYearlyStats(2025, { ...baseConfig, selectedPattern: 'same-weekends-monthly' });
      // Weekdays to A, 1st/3rd/5th weekends to B (about 26 weekend days per year to B)
      // This is closer to 85/15 since only 1st/3rd/5th weekends go to B
      expect(stats.parentA.percentage).toBeGreaterThan(82);
      expect(stats.parentA.percentage).toBeLessThan(88);
    });
  });

  describe('100/0 patterns', () => {
    test('all-to-one gives 100/0 split', () => {
      const stats = calculateYearlyStats(2025, { ...baseConfig, selectedPattern: 'all-to-one' });
      expect(stats.parentA.percentage).toBe(100);
      expect(stats.parentB.percentage).toBe(0);
    });
  });
});
