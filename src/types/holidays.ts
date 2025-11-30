import type { ParentId } from './index';

/**
 * Category of holiday for grouping and display purposes.
 * - 'major-break': Extended time periods like Spring Break, Thanksgiving, Winter Break, Summer
 * - 'weekend': 3-day weekend holidays like Memorial Day, Labor Day
 * - 'birthday': Children's and parents' birthdays
 * - 'religious': Religious observances (Easter, Hanukkah, etc.)
 */
export type HolidayCategory = 'major-break' | 'weekend' | 'birthday' | 'religious';

/**
 * How custody is assigned for a holiday.
 * - 'alternate-odd-even': Alternate by year (odd years = Parent A, even years = Parent B)
 * - 'always-parent-a': Always assigned to Parent A
 * - 'always-parent-b': Always assigned to Parent B
 * - 'split-period': Split the holiday period (e.g., Christmas/New Year)
 * - 'selection-priority': Parents take turns choosing (e.g., Summer vacation weeks)
 */
export type AssignmentType =
  | 'alternate-odd-even'
  | 'always-parent-a'
  | 'always-parent-b'
  | 'split-period'
  | 'selection-priority';

/**
 * Date calculation method for determining when a holiday falls.
 */
export type DateCalculationType =
  | 'fixed'           // Fixed date like July 4
  | 'nth-weekday'     // Nth weekday of month (e.g., 3rd Monday)
  | 'last-weekday'    // Last weekday of month (e.g., last Monday)
  | 'relative'        // Relative to another date
  | 'date-range'      // Start and end dates
  | 'custom';         // User-defined dates

/**
 * Configuration for fixed date holidays (e.g., July 4, Christmas).
 */
export interface FixedDateCalculation {
  type: 'fixed';
  month: number;  // 1-12
  day: number;    // 1-31
}

/**
 * Configuration for Nth weekday holidays (e.g., 3rd Monday of January = MLK Day).
 */
export interface NthWeekdayCalculation {
  type: 'nth-weekday';
  month: number;     // 1-12
  weekday: number;   // 0 = Sunday, 6 = Saturday
  nth: number;       // 1 = first, 2 = second, etc.
}

/**
 * Configuration for last weekday holidays (e.g., last Monday of May = Memorial Day).
 */
export interface LastWeekdayCalculation {
  type: 'last-weekday';
  month: number;     // 1-12
  weekday: number;   // 0 = Sunday, 6 = Saturday
}

/**
 * Configuration for relative date holidays (e.g., day after Thanksgiving).
 */
export interface RelativeDateCalculation {
  type: 'relative';
  baseHolidayId: string;
  offsetDays: number;
}

/**
 * Configuration for date range holidays (e.g., Spring Break).
 */
export interface DateRangeCalculation {
  type: 'date-range';
  startMonth: number;   // 1-12
  startDay: number;     // 1-31
  endMonth: number;     // 1-12
  endDay: number;       // 1-31
}

/**
 * Configuration for custom/user-defined date holidays.
 */
export interface CustomDateCalculation {
  type: 'custom';
  dates?: string[];  // Array of ISO date strings
}

/**
 * Union type for all date calculation methods.
 */
export type DateCalculation =
  | FixedDateCalculation
  | NthWeekdayCalculation
  | LastWeekdayCalculation
  | RelativeDateCalculation
  | DateRangeCalculation
  | CustomDateCalculation;

/**
 * Definition of a holiday with all its configuration.
 */
export interface HolidayDefinition {
  /** Unique identifier for the holiday */
  id: string;
  /** Display name */
  name: string;
  /** Category for grouping */
  category: HolidayCategory;
  /** Default custody assignment method */
  defaultAssignment: AssignmentType;
  /** How to calculate the date(s) */
  dateCalculation: DateCalculation;
  /** Number of days this holiday spans */
  durationDays: number;
  /** Priority for override resolution (higher = overrides lower) */
  priority: number;
  /** Description for display purposes */
  description?: string;
  /** Whether this holiday is enabled by default */
  enabledByDefault?: boolean;
}

/**
 * Configuration for split-period holidays like Winter Break.
 * Splits a holiday into two segments with different assignments.
 */
export interface SplitPeriodConfig {
  /** ID of the holiday this config applies to */
  holidayId: string;
  /** Description of when the split occurs (e.g., "Dec 26 12:00 PM") */
  splitPoint: string;
  /** ISO date string for the split point */
  splitDate: string;
  /** Name of the first segment */
  segment1Name: string;
  /** Name of the second segment */
  segment2Name: string;
  /** Assignment type for first segment */
  segment1Assignment: AssignmentType;
  /** Assignment type for second segment */
  segment2Assignment: AssignmentType;
}

/**
 * Configuration for selection-priority holidays like Summer Vacation.
 * Parents take turns selecting their preferred weeks.
 */
export interface SelectionPriorityConfig {
  /** ID of the holiday this config applies to */
  holidayId: string;
  /** Number of weeks each parent can select */
  weeksPerParent: number;
  /** Number of selection blocks per parent */
  blocksPerParent: number;
  /** Deadline for making selections (ISO date or description) */
  selectionDeadline: string;
  /** Which parent picks first in odd years */
  firstPickOddYears: ParentId;
  /** Maximum consecutive weeks allowed */
  maxConsecutiveWeeks?: number;
}

/**
 * User's selection/configuration for a specific holiday.
 */
export interface HolidayUserConfig {
  /** Holiday ID */
  holidayId: string;
  /** Whether this holiday is enabled */
  enabled: boolean;
  /** User-selected assignment type (overrides default) */
  assignment: AssignmentType;
  /** Split period config if applicable */
  splitConfig?: SplitPeriodConfig;
  /** Selection priority config if applicable */
  selectionConfig?: SelectionPriorityConfig;
  /** Custom dates if applicable (for birthdays, etc.) */
  customDates?: string[];
}

/**
 * Birthday configuration for a specific person.
 */
export interface BirthdayConfig {
  /** Unique identifier */
  id: string;
  /** Name of the person */
  name: string;
  /** Type of birthday */
  type: 'child' | 'parent-a' | 'parent-b';
  /** Month (1-12) */
  month: number;
  /** Day (1-31) */
  day: number;
  /** Default assignment */
  defaultAssignment: AssignmentType;
}

/**
 * Complete holiday configuration state for the application.
 */
export interface HolidayState {
  /** User configurations for standard holidays */
  holidayConfigs: HolidayUserConfig[];
  /** Birthday configurations */
  birthdays: BirthdayConfig[];
  /** Selected preset (if any) */
  selectedPreset?: HolidayPresetType;
  /** Winter break split configuration */
  winterBreakSplit?: SplitPeriodConfig;
  /** Summer vacation configuration */
  summerVacationConfig?: SelectionPriorityConfig;
}

/**
 * Available preset types for quick holiday configuration.
 */
export type HolidayPresetType = 'traditional' | '50-50-split' | 'one-parent-all';

/**
 * Preset definition for quick holiday configuration.
 */
export interface HolidayPreset {
  /** Preset type identifier */
  type: HolidayPresetType;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Default assignments for each holiday ID */
  assignments: Record<string, AssignmentType>;
}

/**
 * Result of calculating holiday impact on custody percentages.
 */
export interface HolidayImpact {
  /** Days added to Parent A */
  parentADays: number;
  /** Days added to Parent B */
  parentBDays: number;
}

/**
 * Breakdown of holiday impact by category.
 */
export interface HolidayImpactBreakdown {
  majorBreaks: HolidayImpact;
  weekendHolidays: HolidayImpact;
  birthdays: HolidayImpact;
  total: HolidayImpact;
}
