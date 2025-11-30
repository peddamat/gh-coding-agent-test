import type { PatternType } from '../types';

/**
 * Parent indicator for pattern cycles.
 * 'A' represents the starting parent (mapped to startingParent in config).
 * 'B' represents the other parent.
 */
export type PatternParent = 'A' | 'B';

/**
 * Split type for pattern grouping.
 */
export type SplitType = '50/50' | '60/40' | '80/20' | '100/0' | 'Custom';

/**
 * Definition for a custody schedule pattern.
 */
export interface PatternDefinition {
  /** Pattern type code */
  type: PatternType;
  /** Display label for the pattern */
  label: string;
  /** Custody split percentage */
  split: SplitType;
  /** Brief description of the pattern */
  description: string;
  /** Number of days in one complete cycle */
  cycleLength: number;
  /** Array of parent assignments for each day in the cycle */
  pattern: PatternParent[];
}

/**
 * All supported custody schedule patterns.
 * Patterns are defined with 'A' and 'B' markers that map to the starting parent.
 */
export const PATTERNS: PatternDefinition[] = [
  // 50/50 Schedules
  {
    type: 'alt-weeks',
    label: 'Every Other Week',
    split: '50/50',
    description: 'Simplest 50/50. Full week with each parent, alternating.',
    cycleLength: 14,
    pattern: ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
  },
  {
    type: '2-2-3',
    label: '2-2-3 Rotation',
    split: '50/50',
    description: 'Parent A: Mon-Tue, Parent B: Wed-Thu, Alternating Fri-Sun.',
    cycleLength: 14,
    pattern: ['A', 'A', 'B', 'B', 'A', 'A', 'A', 'B', 'B', 'A', 'A', 'B', 'B', 'B'],
  },
  {
    type: '2-2-5-5',
    label: '2-2-5-5 Rotation',
    split: '50/50',
    description: 'Most popular 50/50. Two days each, then five days each.',
    cycleLength: 14,
    pattern: ['A', 'A', 'B', 'B', 'A', 'A', 'A', 'A', 'A', 'B', 'B', 'B', 'B', 'B'],
  },
  {
    type: '3-4-4-3',
    label: '3-4-4-3 Rotation',
    split: '50/50',
    description: 'Three days, then four days, swapping the next week.',
    cycleLength: 14,
    pattern: ['A', 'A', 'A', 'B', 'B', 'B', 'B', 'A', 'A', 'A', 'A', 'B', 'B', 'B'],
  },
  // 60/40 Schedule
  {
    type: 'every-weekend',
    label: 'Every Weekend',
    split: '60/40',
    description: 'Primary parent has weekdays. Other parent has every weekend.',
    cycleLength: 7,
    pattern: ['A', 'A', 'A', 'A', 'A', 'B', 'B'],
  },
  // 80/20 Schedules
  {
    type: 'every-other-weekend',
    label: 'Every Other Weekend',
    split: '80/20',
    description: 'Primary custody with alternating weekend visitation.',
    cycleLength: 14,
    pattern: ['A', 'A', 'A', 'A', 'A', 'B', 'B', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
  },
  {
    type: 'same-weekends-monthly',
    label: 'Same Weekends Each Month',
    split: '80/20',
    description: '1st, 3rd, and 5th weekends to non-custodial parent.',
    cycleLength: 7, // Special handling required for 1st/3rd/5th logic
    pattern: ['A', 'A', 'A', 'A', 'A', 'A', 'A'], // Base pattern, weekends calculated dynamically
  },
  // 100/0 Schedule
  {
    type: 'all-to-one',
    label: 'All to One Parent',
    split: '100/0',
    description: 'Full custody to one parent. No scheduled visitation.',
    cycleLength: 1,
    pattern: ['A'],
  },
  // Custom
  {
    type: 'custom',
    label: 'Custom Repeating Rate',
    split: 'Custom',
    description: 'Define your own repeating pattern.',
    cycleLength: 0, // User-defined
    pattern: [],
  },
];

/**
 * Group patterns by their split type for display purposes.
 */
export interface PatternGroup {
  split: SplitType;
  label: string;
  patterns: PatternDefinition[];
}

/**
 * Get patterns grouped by custody split for UI display.
 */
export function getPatternGroups(): PatternGroup[] {
  const groups: { split: SplitType; label: string }[] = [
    { split: '50/50', label: '50/50 Schedules' },
    { split: '60/40', label: '60/40 Schedules' },
    { split: '80/20', label: '80/20 Schedules' },
    { split: '100/0', label: 'Full Custody' },
    { split: 'Custom', label: 'Custom' },
  ];

  return groups.map((group) => ({
    ...group,
    patterns: PATTERNS.filter((p) => p.split === group.split),
  }));
}

/**
 * Find a pattern definition by its type code.
 */
export function getPatternByType(type: PatternType): PatternDefinition | undefined {
  return PATTERNS.find((p) => p.type === type);
}

/**
 * Map of split types to parent percentages.
 */
export const SPLIT_PERCENTAGES: Record<SplitType, { parentA: number; parentB: number }> = {
  '50/50': { parentA: 50, parentB: 50 },
  '60/40': { parentA: 60, parentB: 40 },
  '80/20': { parentA: 80, parentB: 20 },
  '100/0': { parentA: 100, parentB: 0 },
  'Custom': { parentA: 50, parentB: 50 }, // Default for custom patterns
};

/**
 * Get the percentage split for a given split type.
 * Defaults to 50/50 if the split type is not recognized.
 */
export function getSplitPercentages(split: SplitType | null | undefined): { parentA: number; parentB: number } {
  if (!split || !(split in SPLIT_PERCENTAGES)) {
    return SPLIT_PERCENTAGES['50/50'];
  }
  return SPLIT_PERCENTAGES[split];
}
