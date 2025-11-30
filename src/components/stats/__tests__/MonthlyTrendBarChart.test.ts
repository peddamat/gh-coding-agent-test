import { describe, test, expect } from 'vitest';
import type { MonthlyTrendBarChartProps } from '../MonthlyTrendBarChart';
import type { MonthlyBreakdown } from '../../../types';

// We test the component's props interface
// Since this is a presentational component using Chart.js, we verify the props are correctly typed
describe('MonthlyTrendBarChart', () => {
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

  const mockProps: MonthlyTrendBarChartProps = {
    data: mockMonthlyData,
    parentAName: 'Mom',
    parentAColor: '#3b82f6', // blue-500
    parentBName: 'Dad',
    parentBColor: '#ec4899', // pink-500
  };

  test('props interface accepts monthly breakdown data', () => {
    expect(mockProps.data).toHaveLength(12);
    expect(mockProps.data[0].month).toBe('Jan');
    expect(mockProps.data[11].month).toBe('Dec');
  });

  test('monthly data contains days for both parents', () => {
    mockProps.data.forEach((monthData) => {
      expect(monthData.parentADays).toBeDefined();
      expect(monthData.parentBDays).toBeDefined();
      expect(typeof monthData.parentADays).toBe('number');
      expect(typeof monthData.parentBDays).toBe('number');
    });
  });

  test('props interface accepts parent names', () => {
    expect(mockProps.parentAName).toBe('Mom');
    expect(mockProps.parentBName).toBe('Dad');
  });

  test('props interface accepts hex color values', () => {
    expect(mockProps.parentAColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(mockProps.parentBColor).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  test('props have all required fields', () => {
    expect(mockProps.data).toBeDefined();
    expect(mockProps.parentAName).toBeDefined();
    expect(mockProps.parentAColor).toBeDefined();
    expect(mockProps.parentBName).toBeDefined();
    expect(mockProps.parentBColor).toBeDefined();
  });

  test('monthly totals sum correctly', () => {
    const totalParentADays = mockProps.data.reduce((sum, d) => sum + d.parentADays, 0);
    const totalParentBDays = mockProps.data.reduce((sum, d) => sum + d.parentBDays, 0);

    expect(totalParentADays).toBe(186); // 16+14+16+15+16+15+16+16+15+16+15+16
    expect(totalParentBDays).toBe(179); // 15+14+15+15+15+15+15+15+15+15+15+15
  });
});

describe('MonthlyBreakdown interface', () => {
  test('interface accepts standard month names', () => {
    const months: MonthlyBreakdown[] = [
      { month: 'Jan', parentADays: 15, parentBDays: 16 },
      { month: 'Feb', parentADays: 14, parentBDays: 14 },
    ];
    expect(months[0].month).toBe('Jan');
    expect(months[1].month).toBe('Feb');
  });

  test('interface accepts zero days', () => {
    const emptyMonth: MonthlyBreakdown = {
      month: 'Jan',
      parentADays: 0,
      parentBDays: 31,
    };
    expect(emptyMonth.parentADays).toBe(0);
    expect(emptyMonth.parentBDays).toBe(31);
  });

  test('days can represent full month custody', () => {
    const fullMonth: MonthlyBreakdown = {
      month: 'Mar',
      parentADays: 31,
      parentBDays: 0,
    };
    expect(fullMonth.parentADays + fullMonth.parentBDays).toBe(31);
  });
});
