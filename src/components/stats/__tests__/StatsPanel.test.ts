import { describe, test, expect } from 'vitest';
import type { StatsPanelProps } from '../StatsPanel';
import type { TimeshareStats, ParentConfig, MonthlyBreakdown } from '../../../types';

describe('StatsPanel', () => {
  const mockStats: TimeshareStats = {
    parentA: { days: 182, percentage: 50 },
    parentB: { days: 183, percentage: 50 },
  };

  const mockParentA: ParentConfig = {
    name: 'Mom',
    colorClass: 'bg-blue-500',
  };

  const mockParentB: ParentConfig = {
    name: 'Dad',
    colorClass: 'bg-pink-500',
  };

  const mockMonthlyData: MonthlyBreakdown[] = [
    { month: 'Jan', parentADays: 16, parentBDays: 15 },
    { month: 'Feb', parentADays: 14, parentBDays: 14 },
    { month: 'Mar', parentADays: 16, parentBDays: 15 },
    { month: 'Apr', parentADays: 15, parentBDays: 15 },
    { month: 'May', parentADays: 16, parentBDays: 15 },
    { month: 'Jun', parentADays: 15, parentBDays: 15 },
    { month: 'Jul', parentADays: 16, parentBDays: 15 },
    { month: 'Aug', parentADays: 16, parentBDays: 15 },
    { month: 'Sep', parentADays: 15, parentBDays: 15 },
    { month: 'Oct', parentADays: 16, parentBDays: 15 },
    { month: 'Nov', parentADays: 15, parentBDays: 15 },
    { month: 'Dec', parentADays: 16, parentBDays: 15 },
  ];

  const mockStatsPanelProps: StatsPanelProps = {
    stats: mockStats,
    parentA: mockParentA,
    parentB: mockParentB,
    monthlyData: mockMonthlyData,
    parentAColor: '#3b82f6',
    parentBColor: '#ec4899',
  };

  test('props interface accepts valid stats', () => {
    expect(mockStatsPanelProps.stats.parentA.days).toBe(182);
    expect(mockStatsPanelProps.stats.parentA.percentage).toBe(50);
    expect(mockStatsPanelProps.stats.parentB.days).toBe(183);
    expect(mockStatsPanelProps.stats.parentB.percentage).toBe(50);
  });

  test('props interface accepts parent configurations', () => {
    expect(mockStatsPanelProps.parentA.name).toBe('Mom');
    expect(mockStatsPanelProps.parentA.colorClass).toBe('bg-blue-500');
    expect(mockStatsPanelProps.parentB.name).toBe('Dad');
    expect(mockStatsPanelProps.parentB.colorClass).toBe('bg-pink-500');
  });

  test('props interface accepts monthly breakdown data', () => {
    expect(mockStatsPanelProps.monthlyData).toHaveLength(12);
    expect(mockStatsPanelProps.monthlyData[0].month).toBe('Jan');
    expect(mockStatsPanelProps.monthlyData[0].parentADays).toBe(16);
    expect(mockStatsPanelProps.monthlyData[0].parentBDays).toBe(15);
  });

  test('props interface accepts hex color values', () => {
    expect(mockStatsPanelProps.parentAColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(mockStatsPanelProps.parentBColor).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  test('props have all required fields', () => {
    expect(mockStatsPanelProps.stats).toBeDefined();
    expect(mockStatsPanelProps.parentA).toBeDefined();
    expect(mockStatsPanelProps.parentB).toBeDefined();
    expect(mockStatsPanelProps.monthlyData).toBeDefined();
    expect(mockStatsPanelProps.parentAColor).toBeDefined();
    expect(mockStatsPanelProps.parentBColor).toBeDefined();
  });

  test('supports different custody splits', () => {
    const majorityAStats: TimeshareStats = {
      parentA: { days: 260, percentage: 71 },
      parentB: { days: 105, percentage: 29 },
    };

    const majorityAProps: StatsPanelProps = {
      ...mockStatsPanelProps,
      stats: majorityAStats,
    };

    expect(majorityAProps.stats.parentA.percentage).toBe(71);
    expect(majorityAProps.stats.parentB.percentage).toBe(29);
    expect(majorityAProps.stats.parentA.days + majorityAProps.stats.parentB.days).toBe(365);
  });

  test('supports custom parent names', () => {
    const customParentA: ParentConfig = {
      name: 'Mother',
      colorClass: 'bg-green-500',
    };

    const customParentB: ParentConfig = {
      name: 'Father',
      colorClass: 'bg-purple-500',
    };

    const customProps: StatsPanelProps = {
      ...mockStatsPanelProps,
      parentA: customParentA,
      parentB: customParentB,
    };

    expect(customProps.parentA.name).toBe('Mother');
    expect(customProps.parentB.name).toBe('Father');
  });

  test('monthly data contains all 12 months', () => {
    const expectedMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const actualMonths = mockMonthlyData.map((d) => d.month);
    expect(actualMonths).toEqual(expectedMonths);
  });

  test('total monthly days approximately equals 365', () => {
    const totalDays = mockMonthlyData.reduce(
      (sum, d) => sum + d.parentADays + d.parentBDays,
      0
    );
    // Allow for slight variations due to rounding
    expect(totalDays).toBeGreaterThanOrEqual(360);
    expect(totalDays).toBeLessThanOrEqual(370);
  });
});
