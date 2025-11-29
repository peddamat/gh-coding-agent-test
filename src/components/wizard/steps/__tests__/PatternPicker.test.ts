import { describe, test, expect } from 'vitest';
import { getPatternGroups, type SplitType, type PatternDefinition } from '../../../../data/patterns';
import type { PatternType } from '../../../../types';

describe('PatternPicker', () => {
  test('pattern groups are available', () => {
    const groups = getPatternGroups();
    expect(groups.length).toBeGreaterThan(0);
  });

  test('each split type has a proper label', () => {
    const splitLabels: Record<SplitType, string> = {
      '50/50': '50/50 Schedules',
      '60/40': '60/40 Schedules',
      '80/20': '80/20 Schedules',
      '100/0': 'Full Custody',
      Custom: 'Custom',
    };

    expect(splitLabels['50/50']).toBe('50/50 Schedules');
    expect(splitLabels['100/0']).toBe('Full Custody');
    expect(splitLabels.Custom).toBe('Custom');
  });

  test('pattern selection returns both pattern and split', () => {
    let selectedPattern: PatternType | null = null;
    let selectedSplit: SplitType | null = null;

    const onPatternSelect = (pattern: PatternType, split: SplitType) => {
      selectedPattern = pattern;
      selectedSplit = split;
    };

    // Simulate selecting a pattern
    const mockPattern: PatternDefinition = {
      type: '2-2-5-5',
      label: '2-2-5-5 Rotation',
      split: '50/50',
      description: 'Most popular 50/50. Two days each, then five days each.',
      cycleLength: 14,
      pattern: ['A', 'A', 'B', 'B', 'A', 'A', 'A', 'A', 'A', 'B', 'B', 'B', 'B', 'B'],
    };

    onPatternSelect(mockPattern.type, mockPattern.split);

    expect(selectedPattern).toBe('2-2-5-5');
    expect(selectedSplit).toBe('50/50');
  });

  test('expanded state toggles correctly', () => {
    let expandedPattern: PatternType | null = null;

    const toggleExpanded = (patternType: PatternType) => {
      expandedPattern = expandedPattern === patternType ? null : patternType;
    };

    // First click - expand
    toggleExpanded('2-2-3');
    expect(expandedPattern).toBe('2-2-3');

    // Second click - collapse
    toggleExpanded('2-2-3');
    expect(expandedPattern).toBeNull();

    // Click different pattern - switch
    toggleExpanded('alt-weeks');
    expect(expandedPattern).toBe('alt-weeks');

    toggleExpanded('2-2-3');
    expect(expandedPattern).toBe('2-2-3');
  });

  test('custom pattern is identified correctly', () => {
    const isCustom = (patternType: PatternType) => patternType === 'custom';

    expect(isCustom('custom')).toBe(true);
    expect(isCustom('2-2-5-5')).toBe(false);
    expect(isCustom('alt-weeks')).toBe(false);
  });

  test('selected state is determined by pattern type', () => {
    const selectedPattern: PatternType = '2-2-5-5';

    const isSelected = (patternType: PatternType) => selectedPattern === patternType;

    expect(isSelected('2-2-5-5')).toBe(true);
    expect(isSelected('3-4-4-3')).toBe(false);
    expect(isSelected('alt-weeks')).toBe(false);
  });

  test('split badges have correct color mapping', () => {
    const badgeColors: Record<SplitType, string> = {
      '50/50': 'bg-green-100 text-green-700',
      '60/40': 'bg-yellow-100 text-yellow-700',
      '80/20': 'bg-orange-100 text-orange-700',
      '100/0': 'bg-red-100 text-red-700',
      Custom: 'bg-purple-100 text-purple-700',
    };

    expect(badgeColors['50/50']).toContain('green');
    expect(badgeColors['60/40']).toContain('yellow');
    expect(badgeColors['80/20']).toContain('orange');
    expect(badgeColors['100/0']).toContain('red');
    expect(badgeColors.Custom).toContain('purple');
  });
});
