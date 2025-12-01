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

// ============================================================================
// In-Service Day Configuration
// ============================================================================

/**
 * Attachment rule for in-service days.
 * - 'attach-to-adjacent': Attach to whichever parent has the adjacent holiday/weekend
 * - 'follow-base-schedule': Follow the base custody schedule (no special handling)
 * - 'always-parent-a': Always assign to Parent A
 * - 'always-parent-b': Always assign to Parent B
 */
export type InServiceAttachmentRule =
  | 'attach-to-adjacent'
  | 'follow-base-schedule'
  | 'always-parent-a'
  | 'always-parent-b';

/**
 * Configuration for in-service day handling.
 * In-service days (teacher workdays) that are adjacent to holidays/weekends
 * can be configured to automatically attach to the parent who has that holiday/weekend.
 */
export interface InServiceDayConfig {
  /** Whether in-service day attachment logic is enabled */
  enabled: boolean;
  /** How to assign in-service days */
  attachmentRule: InServiceAttachmentRule;
}

// ============================================================================
// Year-Round School & Track Break Types
// ============================================================================

/**
 * School type for determining how breaks are handled.
 * - 'traditional': Standard school calendar with summer break
 * - 'year-round': Year-round school with track breaks instead of summer
 */
export type SchoolType = 'traditional' | 'year-round';

/**
 * Represents a track break period in a year-round school calendar.
 * Track breaks are shorter breaks distributed throughout the year.
 */
export interface TrackBreak {
  /** Unique identifier for the track break */
  id: string;
  /** Display name (e.g., "Fall Track Break", "Winter Track Break") */
  name: string;
  /** Start date of the track break in ISO format (YYYY-MM-DD) */
  startDate: string;
  /** End date of the track break in ISO format (YYYY-MM-DD) */
  endDate: string;
  /** Vacation claim information if a parent has claimed this break */
  vacationClaimed?: {
    /** Which parent claimed the vacation */
    claimedBy: ParentId;
    /** When the claim was made (YYYY-MM-DD) */
    claimDate: string;
    /** Number of weeks claimed (typically the entire break) */
    weeks: number;
  };
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
  /** Array of in-service day dates in ISO format (YYYY-MM-DD) */
  inServiceDays?: string[];
  /** Configuration for in-service day handling */
  inServiceConfig?: InServiceDayConfig;
  /** School type: 'traditional' or 'year-round' */
  schoolType?: SchoolType;
  /** Array of track breaks for year-round school */
  trackBreaks?: TrackBreak[];
  /** Days before track break that vacation must be claimed (default 30) */
  trackVacationNoticeDeadline?: number;
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
  /** Whether this day is an in-service day (teacher workday) */
  isInServiceDay?: boolean;
  /** Whether this day's ownership is due to in-service attachment rule */
  isInServiceAttached?: boolean;
  /** Whether this day is part of a track break period */
  isTrackBreak?: boolean;
  /** Name of the track break if this day is part of one */
  trackBreakName?: string;
  /** Whether this track break has a vacation claimed on it */
  isTrackBreakVacationClaimed?: boolean;
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
