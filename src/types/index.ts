import type {
  HolidayState,
} from './holidays';

export type ParentId = 'parentA' | 'parentB';

// ============================================================================
// Parent Relationship Type
// ============================================================================

/**
 * Relationship type for each parent in the custody arrangement.
 */
export type ParentRelationship = 'mom' | 'dad' | 'guardian' | 'other';

/**
 * Options for parent relationship dropdown.
 */
export const RELATIONSHIP_OPTIONS: { value: ParentRelationship; label: string }[] = [
  { value: 'mom', label: 'Mom' },
  { value: 'dad', label: 'Dad' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'other', label: 'Other' },
];

// ============================================================================
// Child & Family Types
// ============================================================================

/**
 * Represents a child in the custody arrangement.
 * Used for birthday automation and plan expiration calculation.
 */
export interface Child {
  /** Unique identifier for the child */
  id: string;
  /** Child's name */
  name: string;
  /** Child's birthdate in ISO format (YYYY-MM-DD) */
  birthdate: string;
  /** Age at which custody arrangement ends (default 18, can be 19 in some jurisdictions) */
  custodyEndAge: number;
}

/**
 * Family information including children and plan dates.
 * Plan expiration is typically calculated based on when the youngest child
 * reaches the custody end age.
 */
export interface FamilyInfo {
  /** List of children in the custody arrangement */
  children: Child[];
  /** When the custody plan starts (YYYY-MM-DD) */
  planStartDate: string;
  /** When the custody plan ends - auto-calculated or manual override (YYYY-MM-DD) */
  planEndDate?: string;
}
export type PatternType =
  | 'alt-weeks'              // 50/50 - Alternating weeks (7-7)
  | '2-2-3'                  // 50/50 - 2-2-3 rotation
  | '2-2-5-5'                // 50/50 - 2-2-5-5 rotation
  | '3-4-4-3'                // 50/50 - 3-4-4-3 rotation
  | 'every-weekend'          // 60/40 - Non-custodial parent gets every weekend
  | 'every-other-weekend'    // 80/20 - Non-custodial parent gets alternating weekends
  | 'same-weekends-monthly'  // 80/20 - Non-custodial parent gets 1st/3rd/5th weekends
  | 'all-to-one'             // 100/0 - Full custody to one parent
  | 'custom';                // Custom repeating rate

export interface ParentConfig {
  name: string;
  colorClass: string; // Tailwind bg class e.g., "bg-blue-500"
  relationship?: ParentRelationship;
}

export interface AppConfig {
  startDate: string; // ISO "YYYY-MM-DD"
  selectedPattern: PatternType;
  startingParent: ParentId;
  exchangeTime: string; // "HH:MM" format
}

export interface AppState {
  config: AppConfig;
  parents: {
    parentA: ParentConfig;
    parentB: ParentConfig;
  };
  holidays?: HolidayState;
  /** Family information including children and plan dates */
  familyInfo: FamilyInfo;
}

export interface CalendarDay {
  date: string; // "YYYY-MM-DD"
  dayOfMonth: number;
  owner: ParentId;
  isToday: boolean;
  isCurrentMonth: boolean;
  /** Holiday name if this day is a holiday */
  holidayName?: string;
  /** Whether this day's owner is due to a holiday override */
  isHolidayOverride?: boolean;
}

export interface TimeshareStats {
  parentA: { days: number; percentage: number };
  parentB: { days: number; percentage: number };
}

export interface MonthlyBreakdown {
  month: string;
  parentADays: number;
  parentBDays: number;
}

// ============================================================================
// Court Template Types
// ============================================================================

/**
 * Holiday assignment rule for court templates.
 * Defines which parent gets custody during a specific holiday and how it's assigned.
 */
export interface HolidayAssignment {
  /** Holiday identifier (matches HolidayDefinition.id) */
  holidayId: string;
  /** How custody is assigned for this holiday */
  assignment: import('./holidays').AssignmentType;
  /** Which parent has custody in odd years (if alternate-odd-even) */
  oddYearParent?: ParentId;
  /** Exchange time override for this holiday (HH:MM format) */
  exchangeTime?: string;
  /** Description of the timing (e.g., "6 PM Dec 31 - 6 PM Jan 1") */
  timingDescription?: string;
  /** Whether this holiday is enabled in the template */
  enabled?: boolean;
}

/**
 * Configuration for major breaks (summer, winter, spring).
 * These are extended custody periods with special selection rules.
 */
export interface MajorBreakConfig {
  /** Break identifier (e.g., 'summer-vacation', 'winter-break') */
  breakId: string;
  /** Display name for the break */
  name: string;
  /** Start month (1-12) */
  startMonth: number;
  /** Start day (1-31, approximate) */
  startDay: number;
  /** End month (1-12) */
  endMonth: number;
  /** End day (1-31, approximate) */
  endDay: number;
  /** Number of weeks each parent receives (for selection-based breaks) */
  weeksPerParent?: number;
  /** Deadline for making selections (e.g., "April 1") */
  selectionDeadline?: string;
  /** Which parent picks first in odd years */
  firstPickOddYears?: ParentId;
  /** Maximum consecutive weeks allowed */
  maxConsecutiveWeeks?: number;
  /** Whether this break is split between segments */
  isSplit?: boolean;
  /** Split point date (for split breaks like Winter Break) */
  splitDate?: string;
  /** Description of how the break is divided */
  splitDescription?: string;
}

/**
 * Court-standard custody template that pre-configures the entire app state.
 * Designed to minimize user input by providing jurisdiction-specific defaults.
 */
export interface CourtTemplate {
  /** Unique identifier (e.g., "nevada-8th-district-standard") */
  id: string;
  /** Display name (e.g., "Nevada 8th District Court - Standard") */
  name: string;
  /** Court jurisdiction (e.g., "Nevada 8th District Court") */
  jurisdiction: string;
  /** Version for template updates (semver format) */
  version: string;
  /** Brief description of the template */
  description: string;
  /** Pre-configured pattern type */
  defaultPattern: PatternType;
  /** Default exchange time (HH:MM format) */
  defaultExchangeTime: string;
  /** Pre-configured holiday assignments */
  holidays: HolidayAssignment[];
  /** Major break configurations (summer, winter, spring) */
  majorBreaks: MajorBreakConfig[];
  /** Whether template requires child info for age-based rules */
  requiresChildAge: boolean;
  /** Optional notes about this template for display */
  notes?: string;
  /** Source document reference (e.g., PDF file name) */
  sourceDocument?: string;
  /** Last updated timestamp */
  lastUpdated?: string;
}

/**
 * Registry of available court templates.
 * Key is the template ID for quick lookup.
 */
export type TemplateRegistry = Record<string, CourtTemplate>;

// Re-export holiday types for convenience
export * from './holidays';
