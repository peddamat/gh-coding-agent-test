import { describe, test, expect } from 'vitest';
import { PATTERNS, getPatternGroups, getPatternByType } from '../patterns';

describe('patterns data', () => {
  test('PATTERNS contains all 9 supported patterns', () => {
    expect(PATTERNS.length).toBe(9);
  });

  test('all patterns have required properties', () => {
    PATTERNS.forEach((pattern) => {
      expect(pattern.type).toBeDefined();
      expect(pattern.label).toBeDefined();
      expect(pattern.split).toBeDefined();
      expect(pattern.description).toBeDefined();
      expect(pattern.cycleLength).toBeDefined();
      expect(pattern.pattern).toBeDefined();
      expect(Array.isArray(pattern.pattern)).toBe(true);
    });
  });

  test('pattern cycle lengths match pattern array lengths (except custom)', () => {
    PATTERNS.forEach((pattern) => {
      if (pattern.type !== 'custom') {
        expect(pattern.pattern.length).toBe(pattern.cycleLength);
      }
    });
  });

  test('pattern arrays only contain A or B values', () => {
    PATTERNS.forEach((pattern) => {
      pattern.pattern.forEach((day) => {
        expect(['A', 'B']).toContain(day);
      });
    });
  });

  test('50/50 patterns have 4 entries', () => {
    const fiftyFifty = PATTERNS.filter((p) => p.split === '50/50');
    expect(fiftyFifty.length).toBe(4);
  });

  test('80/20 patterns have 2 entries', () => {
    const eightyTwenty = PATTERNS.filter((p) => p.split === '80/20');
    expect(eightyTwenty.length).toBe(2);
  });

  test('60/40 patterns have 1 entry', () => {
    const sixtyForty = PATTERNS.filter((p) => p.split === '60/40');
    expect(sixtyForty.length).toBe(1);
  });

  test('100/0 patterns have 1 entry', () => {
    const fullCustody = PATTERNS.filter((p) => p.split === '100/0');
    expect(fullCustody.length).toBe(1);
  });

  test('custom pattern has empty pattern array and 0 cycle length', () => {
    const custom = PATTERNS.find((p) => p.type === 'custom');
    expect(custom).toBeDefined();
    expect(custom?.pattern.length).toBe(0);
    expect(custom?.cycleLength).toBe(0);
  });
});

describe('getPatternGroups', () => {
  test('returns 5 groups', () => {
    const groups = getPatternGroups();
    expect(groups.length).toBe(5);
  });

  test('groups are in correct order', () => {
    const groups = getPatternGroups();
    expect(groups[0].split).toBe('50/50');
    expect(groups[1].split).toBe('60/40');
    expect(groups[2].split).toBe('80/20');
    expect(groups[3].split).toBe('100/0');
    expect(groups[4].split).toBe('Custom');
  });

  test('each group contains correct patterns', () => {
    const groups = getPatternGroups();
    
    const fiftyFifty = groups.find((g) => g.split === '50/50');
    expect(fiftyFifty?.patterns.length).toBe(4);
    
    const custom = groups.find((g) => g.split === 'Custom');
    expect(custom?.patterns.length).toBe(1);
  });
});

describe('getPatternByType', () => {
  test('finds alt-weeks pattern', () => {
    const pattern = getPatternByType('alt-weeks');
    expect(pattern).toBeDefined();
    expect(pattern?.label).toBe('Every Other Week');
  });

  test('finds 2-2-5-5 pattern', () => {
    const pattern = getPatternByType('2-2-5-5');
    expect(pattern).toBeDefined();
    expect(pattern?.split).toBe('50/50');
  });

  test('finds custom pattern', () => {
    const pattern = getPatternByType('custom');
    expect(pattern).toBeDefined();
    expect(pattern?.split).toBe('Custom');
  });
});
