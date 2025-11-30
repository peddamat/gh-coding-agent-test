import type {
  HolidayState,
} from './holidays';

export type ParentId = 'parentA' | 'parentB';
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

// Re-export holiday types for convenience
export * from './holidays';
