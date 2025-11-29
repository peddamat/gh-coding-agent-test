import { describe, test, expect } from 'vitest';
import type { TimeshareDonutChartProps } from '../TimeshareDonutChart';
import { determinePrimaryParent } from '../utils';

// We test the component's props interface
// Since this is a presentational component using Chart.js, we verify the props are correctly typed
describe('TimeshareDonutChart', () => {
  const mockEqualSplit: TimeshareDonutChartProps = {
    parentAName: 'Mom',
    parentAPercent: 50,
    parentAColor: '#3b82f6', // blue-500
    parentBName: 'Dad',
    parentBPercent: 50,
    parentBColor: '#ec4899', // pink-500
  };

  const mockParentAMajority: TimeshareDonutChartProps = {
    parentAName: 'Mother',
    parentAPercent: 60,
    parentAColor: '#3b82f6',
    parentBName: 'Father',
    parentBPercent: 40,
    parentBColor: '#ec4899',
  };

  const mockParentBMajority: TimeshareDonutChartProps = {
    parentAName: 'Parent A',
    parentAPercent: 20,
    parentAColor: '#22c55e', // green-500
    parentBName: 'Parent B',
    parentBPercent: 80,
    parentBColor: '#f97316', // orange-500
  };

  const mockCustomColors: TimeshareDonutChartProps = {
    parentAName: 'Guardian 1',
    parentAPercent: 45,
    parentAColor: '#8b5cf6', // violet-500
    parentBName: 'Guardian 2',
    parentBPercent: 55,
    parentBColor: '#06b6d4', // cyan-500
  };

  test('props interface accepts equal 50/50 split', () => {
    expect(mockEqualSplit.parentAPercent).toBe(50);
    expect(mockEqualSplit.parentBPercent).toBe(50);
    expect(mockEqualSplit.parentAPercent + mockEqualSplit.parentBPercent).toBe(100);
  });

  test('props interface accepts 60/40 split with Parent A majority', () => {
    expect(mockParentAMajority.parentAPercent).toBe(60);
    expect(mockParentAMajority.parentBPercent).toBe(40);
    expect(mockParentAMajority.parentAPercent + mockParentAMajority.parentBPercent).toBe(100);
  });

  test('props interface accepts 80/20 split with Parent B majority', () => {
    expect(mockParentBMajority.parentAPercent).toBe(20);
    expect(mockParentBMajority.parentBPercent).toBe(80);
    expect(mockParentBMajority.parentAPercent + mockParentBMajority.parentBPercent).toBe(100);
  });

  test('props interface accepts custom parent names', () => {
    expect(mockEqualSplit.parentAName).toBe('Mom');
    expect(mockEqualSplit.parentBName).toBe('Dad');
    expect(mockParentAMajority.parentAName).toBe('Mother');
    expect(mockParentAMajority.parentBName).toBe('Father');
  });

  test('props interface accepts hex color values', () => {
    expect(mockEqualSplit.parentAColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(mockEqualSplit.parentBColor).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  test('props interface accepts custom colors', () => {
    expect(mockCustomColors.parentAColor).toBe('#8b5cf6');
    expect(mockCustomColors.parentBColor).toBe('#06b6d4');
  });

  test('props have all required fields', () => {
    // Verify all props are defined for each mock
    const allMocks = [mockEqualSplit, mockParentAMajority, mockParentBMajority, mockCustomColors];
    
    allMocks.forEach((mock) => {
      expect(mock.parentAName).toBeDefined();
      expect(mock.parentAPercent).toBeDefined();
      expect(mock.parentAColor).toBeDefined();
      expect(mock.parentBName).toBeDefined();
      expect(mock.parentBPercent).toBeDefined();
      expect(mock.parentBColor).toBeDefined();
    });
  });
});

describe('determinePrimaryParent', () => {
  test('determines Parent A as primary when percentages are equal', () => {
    const result = determinePrimaryParent('Mom', 50, 'Dad', 50);
    expect(result.primaryName).toBe('Mom');
    expect(result.primaryPercent).toBe(50);
  });

  test('determines Parent A as primary when they have higher percentage', () => {
    const result = determinePrimaryParent('Mother', 60, 'Father', 40);
    expect(result.primaryName).toBe('Mother');
    expect(result.primaryPercent).toBe(60);
  });

  test('determines Parent B as primary when they have higher percentage', () => {
    const result = determinePrimaryParent('Parent A', 20, 'Parent B', 80);
    expect(result.primaryName).toBe('Parent B');
    expect(result.primaryPercent).toBe(80);
  });

  test('handles close percentages correctly', () => {
    const result = determinePrimaryParent('Guardian 1', 49, 'Guardian 2', 51);
    expect(result.primaryName).toBe('Guardian 2');
    expect(result.primaryPercent).toBe(51);
  });

  test('handles extreme split 100/0', () => {
    const result = determinePrimaryParent('Custodial', 100, 'Non-custodial', 0);
    expect(result.primaryName).toBe('Custodial');
    expect(result.primaryPercent).toBe(100);
  });
});
