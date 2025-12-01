import { useMemo, useCallback } from 'react';
import type { AppConfig, ParentId, CalendarDay, MonthlyBreakdown, HolidayState, HolidayUserConfig, AssignmentType, InServiceDayConfig } from '../types';
import { PATTERNS } from '../data/patterns';
import { getHolidayDates, getHolidayById } from '../data/holidays';

/**
 * Date arithmetic utilities - CRITICAL: Use ISO 8601 strings to avoid DST issues.
 */

/**
 * Add days to a date string, returning a new date string.
 * Uses date-only arithmetic to avoid DST issues.
 * 
 * Note: We create a Date at midnight (T00:00:00), modify it using setDate(),
 * then extract just the date portion. This approach handles month/year
 * boundaries correctly (e.g., Jan 31 + 1 = Feb 1).
 */
export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Calculate the difference in days between two date strings.
 * Returns positive if date1 > date2, negative otherwise.
 */
export function calculateDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1 + 'T00:00:00');
  const d2 = new Date(date2 + 'T00:00:00');
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get the other parent ID (if parentA, return parentB and vice versa).
 */
export function getOtherParent(parent: ParentId): ParentId {
  return parent === 'parentA' ? 'parentB' : 'parentA';
}

/**
 * Format a date to YYYY-MM-DD string.
 */
export function formatDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Get the number of days in a month.
 * Month is 0-indexed (0 = January, 11 = December).
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Check if a date is today.
 */
export function isToday(dateStr: string): boolean {
  const today = new Date();
  const todayStr = formatDateString(today.getFullYear(), today.getMonth(), today.getDate());
  return dateStr === todayStr;
}

/**
 * Get owner for "same-weekends-monthly" pattern.
 * 1st, 3rd, and 5th weekends go to Parent B (the other parent).
 * Weekdays and 2nd/4th weekends go to Parent A (the starting parent).
 * 
 * Weekend number calculation:
 * - Days 1-7 = Weekend 1 (any Sat/Sun in this range is the "1st weekend")
 * - Days 8-14 = Weekend 2
 * - Days 15-21 = Weekend 3
 * - Days 22-28 = Weekend 4
 * - Days 29-31 = Weekend 5 (only occurs in months with 5 weekends)
 * 
 * Example for January 2025:
 * - Jan 4 (Sat), Jan 5 (Sun) -> Weekend 1 -> Parent B
 * - Jan 11 (Sat), Jan 12 (Sun) -> Weekend 2 -> Parent A
 * - Jan 18 (Sat), Jan 19 (Sun) -> Weekend 3 -> Parent B
 * - Jan 25 (Sat), Jan 26 (Sun) -> Weekend 4 -> Parent A
 */
export function getSameWeekendsOwner(date: string, startingParent: ParentId): ParentId {
  const d = new Date(date + 'T00:00:00');
  const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday
  const dayOfMonth = d.getDate();

  // Only weekends (Sat/Sun) are affected
  if (dayOfWeek !== 0 && dayOfWeek !== 6) {
    return startingParent; // Weekdays always go to the starting parent (Parent A)
  }

  // Calculate which weekend of the month (1st, 2nd, 3rd, 4th, or 5th)
  // Days 1-7 = week 1, 8-14 = week 2, etc.
  const weekendNumber = Math.ceil(dayOfMonth / 7);

  // 1st, 3rd, 5th weekends go to the other parent (Parent B)
  if (weekendNumber === 1 || weekendNumber === 3 || weekendNumber === 5) {
    return getOtherParent(startingParent);
  }

  return startingParent;
}

/**
 * Get owner for a date based on the pattern cycle.
 * 
 * The function handles dates both before and after the start date correctly.
 * For negative day differences (dates before start), we use double modulo
 * to ensure a positive index:
 * 
 * Example with 14-day cycle:
 * - Date is 3 days before start: daysDiff = -3
 * - Simple modulo: -3 % 14 = -3 (invalid index)
 * - Double modulo: ((-3 % 14) + 14) % 14 = (-3 + 14) % 14 = 11
 * - This correctly wraps to day 11 of the pattern (counting back from end)
 */
export function getPatternOwner(
  date: string,
  startDate: string,
  pattern: ('A' | 'B')[],
  cycleLength: number,
  startingParent: ParentId
): ParentId {
  const daysDiff = calculateDaysDifference(date, startDate);
  // Handle negative days diff by wrapping correctly using double modulo
  // This ensures we always get a positive index between 0 and cycleLength-1
  const index = ((daysDiff % cycleLength) + cycleLength) % cycleLength;
  const patternValue = pattern[index];
  
  return patternValue === 'A' ? startingParent : getOtherParent(startingParent);
}

/**
 * Get the custody owner for a specific date based on the app configuration.
 */
export function getOwnerForDate(date: string, config: AppConfig): ParentId {
  const pattern = PATTERNS.find((p) => p.type === config.selectedPattern);

  if (!pattern) {
    // Default to starting parent if pattern not found
    return config.startingParent;
  }

  // Special case: same-weekends-monthly requires dynamic calculation
  if (pattern.type === 'same-weekends-monthly') {
    return getSameWeekendsOwner(date, config.startingParent);
  }

  // Special case: all-to-one always returns starting parent
  if (pattern.type === 'all-to-one') {
    return config.startingParent;
  }

  // Special case: custom patterns (not implemented yet - return starting parent)
  if (pattern.type === 'custom' || pattern.cycleLength === 0) {
    return config.startingParent;
  }

  // Standard pattern-based calculation
  return getPatternOwner(
    date,
    config.startDate,
    pattern.pattern,
    pattern.cycleLength,
    config.startingParent
  );
}

/**
 * Get holiday information for a specific date.
 * Returns the holiday config and name if the date is a holiday, or null otherwise.
 */
export function getHolidayForDate(
  date: string,
  holidayConfigs: HolidayUserConfig[]
): { config: HolidayUserConfig; name: string } | null {
  const dateYear = parseInt(date.split('-')[0], 10);

  for (const config of holidayConfigs) {
    if (!config.enabled) continue;

    const holiday = getHolidayById(config.holidayId);
    if (!holiday) continue;

    const holidayDates = getHolidayDates(holiday, dateYear);
    if (holidayDates.includes(date)) {
      return { config, name: holiday.name };
    }
  }

  return null;
}

/**
 * Convert an assignment type to an actual parent ID for a given year.
 * 
 * For 'alternate-odd-even':
 * - Odd years (2025, 2027, etc.): Holiday goes to the starting parent (typically Parent A)
 * - Even years (2024, 2026, etc.): Holiday goes to the other parent (typically Parent B)
 * 
 * This follows the Nevada court holiday document convention where odd/even year
 * alternation is used for fair distribution of holidays over time.
 */
export function resolveAssignment(
  assignment: AssignmentType,
  year: number,
  startingParent: ParentId
): ParentId {
  switch (assignment) {
    case 'always-parent-a':
      return 'parentA';
    case 'always-parent-b':
      return 'parentB';
    case 'alternate-odd-even':
      // Odd years (2025, 2027) = starting parent
      // Even years (2024, 2026) = other parent
      return year % 2 === 1 ? startingParent : getOtherParent(startingParent);
    case 'split-period':
      // Split period is handled at a higher level
      return startingParent;
    case 'selection-priority':
      // Selection priority is handled at a higher level
      return startingParent;
    default:
      return startingParent;
  }
}

/**
 * Get the custody owner for a date with holiday override consideration.
 * Implements the 4-layer priority: Vacation > Holiday > Seasonal > Base
 */
export function getOwnerForDateWithHolidays(
  date: string,
  config: AppConfig,
  holidays?: HolidayState
): { owner: ParentId; holidayName?: string; isHolidayOverride: boolean } {
  // Layer 1: Base schedule
  const baseOwner = getOwnerForDate(date, config);

  // If no holidays configured, return base
  if (!holidays?.holidayConfigs || holidays.holidayConfigs.length === 0) {
    return { owner: baseOwner, isHolidayOverride: false };
  }

  // Layer 2: Holiday override
  const holidayInfo = getHolidayForDate(date, holidays.holidayConfigs);
  if (holidayInfo) {
    const year = parseInt(date.split('-')[0], 10);
    const holidayOwner = resolveAssignment(
      holidayInfo.config.assignment,
      year,
      config.startingParent
    );
    return {
      owner: holidayOwner,
      holidayName: holidayInfo.name,
      isHolidayOverride: true,
    };
  }

  // No holiday override, return base
  return { owner: baseOwner, isHolidayOverride: false };
}

// ============================================================================
// In-Service Day Logic
// ============================================================================

/**
 * Check if a date falls on a weekend (Saturday or Sunday).
 * Uses date-only arithmetic to avoid DST issues.
 */
export function isWeekend(dateStr: string): boolean {
  const date = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
}

/**
 * Check if a date is a holiday based on the holiday configurations.
 */
export function isHoliday(
  dateStr: string,
  holidayConfigs: HolidayUserConfig[]
): boolean {
  const year = parseInt(dateStr.split('-')[0], 10);
  for (const config of holidayConfigs) {
    if (!config.enabled) continue;
    const holiday = getHolidayById(config.holidayId);
    if (!holiday) continue;
    const holidayDates = getHolidayDates(holiday, year);
    if (holidayDates.includes(dateStr)) {
      return true;
    }
  }
  return false;
}

/**
 * Get the owner of an adjacent holiday or weekend.
 * Returns the owner if the date is a holiday or weekend, or null otherwise.
 * 
 * This is used for in-service day attachment logic - if an in-service day
 * is adjacent to a holiday/weekend, it can be assigned to the same parent.
 */
export function getAdjacentSpecialDayOwner(
  dateStr: string,
  config: AppConfig,
  holidays?: HolidayState
): ParentId | null {
  // Check if it's a holiday first (takes priority)
  if (holidays?.holidayConfigs && holidays.holidayConfigs.length > 0) {
    const holidayInfo = getHolidayForDate(dateStr, holidays.holidayConfigs);
    if (holidayInfo) {
      const year = parseInt(dateStr.split('-')[0], 10);
      return resolveAssignment(
        holidayInfo.config.assignment,
        year,
        config.startingParent
      );
    }
  }

  // Check if it's a weekend
  if (isWeekend(dateStr)) {
    return getOwnerForDate(dateStr, config);
  }

  return null;
}

/**
 * Resolve in-service day ownership based on the attachment rule.
 * 
 * In-service days (teacher workdays) can be configured to attach to adjacent
 * holidays/weekends, follow the base schedule, or always go to a specific parent.
 * 
 * The attachment rule 'attach-to-adjacent' checks if the previous or next day
 * is a holiday or weekend, and if so, assigns the in-service day to whichever
 * parent has that adjacent holiday/weekend.
 * 
 * @param date - The in-service day date (ISO 8601 string)
 * @param isInServiceDay - Whether this date is marked as an in-service day
 * @param inServiceConfig - Configuration for in-service day handling
 * @param config - The app configuration
 * @param holidays - Optional holiday state
 * @returns The resolved owner and whether attachment was used
 */
export function resolveInServiceDay(
  date: string,
  isInServiceDay: boolean,
  inServiceConfig: InServiceDayConfig | undefined,
  config: AppConfig,
  holidays?: HolidayState
): { owner: ParentId; isInServiceAttached: boolean } {
  // If not an in-service day or config is disabled, use base schedule
  if (!isInServiceDay || !inServiceConfig?.enabled) {
    const { owner } = getOwnerForDateWithHolidays(date, config, holidays);
    return { owner, isInServiceAttached: false };
  }

  // Handle different attachment rules
  switch (inServiceConfig.attachmentRule) {
    case 'attach-to-adjacent': {
      // Check if previous day is a holiday/weekend
      const prevDate = addDays(date, -1);
      const prevOwner = getAdjacentSpecialDayOwner(prevDate, config, holidays);
      if (prevOwner) {
        return { owner: prevOwner, isInServiceAttached: true };
      }

      // Check if next day is a holiday/weekend
      const nextDate = addDays(date, 1);
      const nextOwner = getAdjacentSpecialDayOwner(nextDate, config, holidays);
      if (nextOwner) {
        return { owner: nextOwner, isInServiceAttached: true };
      }

      // No adjacent special day, fall through to base schedule
      const { owner } = getOwnerForDateWithHolidays(date, config, holidays);
      return { owner, isInServiceAttached: false };
    }

    case 'always-parent-a':
      return { owner: 'parentA', isInServiceAttached: true };

    case 'always-parent-b':
      return { owner: 'parentB', isInServiceAttached: true };

    case 'follow-base-schedule':
    default: {
      const { owner } = getOwnerForDateWithHolidays(date, config, holidays);
      return { owner, isInServiceAttached: false };
    }
  }
}

/**
 * Get the full ownership result for a date, including in-service day consideration.
 * This is the main function that implements the full priority stack including in-service days.
 * 
 * Priority (highest to lowest):
 * 1. In-service day attachment (when adjacent to holiday/weekend)
 * 2. Holiday override
 * 3. Base schedule
 */
export function getOwnerForDateFull(
  date: string,
  config: AppConfig,
  holidays?: HolidayState,
  inServiceDays?: string[],
  inServiceConfig?: InServiceDayConfig
): {
  owner: ParentId;
  holidayName?: string;
  isHolidayOverride: boolean;
  isInServiceDay: boolean;
  isInServiceAttached: boolean;
} {
  const isInService = inServiceDays?.includes(date) ?? false;

  // If it's an in-service day and config is enabled, resolve using in-service logic
  if (isInService && inServiceConfig?.enabled) {
    const { owner, isInServiceAttached } = resolveInServiceDay(
      date,
      true,
      inServiceConfig,
      config,
      holidays
    );

    // Even if attached, we still want to check for holiday name for display
    const holidayInfo = holidays?.holidayConfigs
      ? getHolidayForDate(date, holidays.holidayConfigs)
      : null;

    return {
      owner,
      holidayName: holidayInfo?.name,
      // In-service attachment takes precedence over holiday assignment.
      // We mark isHolidayOverride as false because the ownership is determined
      // by the in-service attachment rule, not by the holiday's assignment.
      isHolidayOverride: false,
      isInServiceDay: true,
      isInServiceAttached,
    };
  }

  // Not an in-service day or in-service handling disabled, use standard logic
  const { owner, holidayName, isHolidayOverride } = getOwnerForDateWithHolidays(
    date,
    config,
    holidays
  );

  return {
    owner,
    holidayName,
    isHolidayOverride,
    isInServiceDay: isInService,
    isInServiceAttached: false,
  };
}

/**
 * Generate calendar days for a given month.
 * Returns 42 days (6 weeks) to fill a standard calendar grid.
 * 
 * @param year - The year (e.g., 2025)
 * @param month - The month (0-indexed, 0 = January)
 * @param config - The app configuration
 * @param weekStartsOnMonday - Whether the week starts on Monday (default: false, Sunday)
 * @param holidays - Optional holiday state
 * @param inServiceDays - Optional array of in-service day dates (ISO format)
 * @param inServiceConfig - Optional in-service day configuration
 */
export function generateMonthDays(
  year: number,
  month: number,
  config: AppConfig,
  weekStartsOnMonday: boolean = false,
  holidays?: HolidayState,
  inServiceDays?: string[],
  inServiceConfig?: InServiceDayConfig
): CalendarDay[] {
  const today = new Date();
  const todayStr = formatDateString(today.getFullYear(), today.getMonth(), today.getDate());

  // Get the first day of the current month
  const firstDayOfMonth = new Date(year, month, 1);

  // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
  let startDayOfWeek = firstDayOfMonth.getDay();

  // Adjust for Monday start: convert Sunday (0) to 6, and shift others by -1
  if (weekStartsOnMonday) {
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  }

  // Calculate the starting date (go back to fill the first row)
  const startDate = new Date(year, month, 1 - startDayOfWeek);

  const days: CalendarDay[] = [];

  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    const dateStr = formatDateString(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    const isCurrentMonth = currentDate.getMonth() === month;
    const isTodayDate = dateStr === todayStr;

    // Get owner with full consideration (holidays + in-service days)
    const {
      owner,
      holidayName,
      isHolidayOverride,
      isInServiceDay,
      isInServiceAttached,
    } = getOwnerForDateFull(
      dateStr,
      config,
      holidays,
      inServiceDays,
      inServiceConfig
    );

    days.push({
      date: dateStr,
      dayOfMonth: currentDate.getDate(),
      owner,
      isToday: isTodayDate,
      isCurrentMonth,
      holidayName,
      isHolidayOverride,
      isInServiceDay,
      isInServiceAttached,
    });
  }

  return days;
}

/**
 * Yearly stats result interface.
 */
export interface YearlyStats {
  /** Stats for parent A */
  parentA: { days: number; percentage: number };
  /** Stats for parent B */
  parentB: { days: number; percentage: number };
  /** Monthly breakdown for the year */
  monthlyBreakdown: MonthlyBreakdown[];
}

/**
 * Get the short month name for a given month index.
 */
function getMonthName(month: number): string {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return monthNames[month];
}

/**
 * Calculate yearly custody statistics for a given year.
 * Returns the total days, percentage split, and monthly breakdown for both parents.
 *
 * @param year - The year to calculate stats for
 * @param config - The app configuration
 * @param holidays - Optional holiday state for override consideration
 * @param inServiceDays - Optional array of in-service day dates (ISO format)
 * @param inServiceConfig - Optional in-service day configuration
 * @returns YearlyStats with day counts, percentages, and monthly breakdown
 */
export function calculateYearlyStats(
  year: number,
  config: AppConfig,
  holidays?: HolidayState,
  inServiceDays?: string[],
  inServiceConfig?: InServiceDayConfig
): YearlyStats {
  let parentADays = 0;
  let parentBDays = 0;
  const monthlyBreakdown: MonthlyBreakdown[] = [];

  // Iterate through each month
  for (let month = 0; month < 12; month++) {
    const daysInMonth = getDaysInMonth(year, month);
    let monthParentA = 0;
    let monthParentB = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateString(year, month, day);
      const { owner } = getOwnerForDateFull(dateStr, config, holidays, inServiceDays, inServiceConfig);

      if (owner === 'parentA') {
        parentADays++;
        monthParentA++;
      } else {
        parentBDays++;
        monthParentB++;
      }
    }

    monthlyBreakdown.push({
      month: getMonthName(month),
      parentADays: monthParentA,
      parentBDays: monthParentB,
    });
  }

  const totalDays = parentADays + parentBDays;
  
  // Calculate percentage with 2 decimal places precision
  // We multiply by 10000, round, then divide by 100 to get values like 50.14%
  // Example: (182 / 365) * 10000 = 4986.3... → round → 4986 → / 100 → 49.86
  return {
    parentA: {
      days: parentADays,
      percentage: Math.round((parentADays / totalDays) * 10000) / 100,
    },
    parentB: {
      days: parentBDays,
      percentage: Math.round((parentBDays / totalDays) * 10000) / 100,
    },
    monthlyBreakdown,
  };
}

/**
 * Hook return type for useCustodyEngine.
 */
export interface UseCustodyEngineReturn {
  /** Get the custody owner for a specific date */
  getOwnerForDate: (date: string) => ParentId;
  /** Get the custody owner for a specific date with holiday information */
  getOwnerForDateWithHolidays: (date: string) => { owner: ParentId; holidayName?: string; isHolidayOverride: boolean };
  /** Get the full ownership info for a date including in-service day handling */
  getOwnerForDateFull: (date: string) => {
    owner: ParentId;
    holidayName?: string;
    isHolidayOverride: boolean;
    isInServiceDay: boolean;
    isInServiceAttached: boolean;
  };
  /** Get calendar days for a specific month */
  getMonthDays: (year: number, month: number, weekStartsOnMonday?: boolean) => CalendarDay[];
  /** Get yearly stats including total days, percentage, and monthly breakdown */
  getYearlyStats: (year: number) => YearlyStats;
}

/**
 * Hook for calculating custody schedules.
 * Provides functions to determine custody ownership for any date and generate calendar data.
 *
 * @param config - The app configuration containing pattern, start date, and starting parent
 * @param holidays - Optional holiday state for override consideration
 * @param inServiceDays - Optional array of in-service day dates (ISO format)
 * @param inServiceConfig - Optional in-service day configuration
 * @returns Object with getOwnerForDate, getMonthDays, and getYearlyStats functions
 */
export function useCustodyEngine(
  config: AppConfig,
  holidays?: HolidayState,
  inServiceDays?: string[],
  inServiceConfig?: InServiceDayConfig
): UseCustodyEngineReturn {
  const getOwnerForDateFn = useCallback(
    (date: string): ParentId => {
      return getOwnerForDate(date, config);
    },
    [config]
  );

  const getOwnerForDateWithHolidaysFn = useCallback(
    (date: string): { owner: ParentId; holidayName?: string; isHolidayOverride: boolean } => {
      return getOwnerForDateWithHolidays(date, config, holidays);
    },
    [config, holidays]
  );

  const getOwnerForDateFullFn = useCallback(
    (date: string): {
      owner: ParentId;
      holidayName?: string;
      isHolidayOverride: boolean;
      isInServiceDay: boolean;
      isInServiceAttached: boolean;
    } => {
      return getOwnerForDateFull(date, config, holidays, inServiceDays, inServiceConfig);
    },
    [config, holidays, inServiceDays, inServiceConfig]
  );

  const getMonthDaysFn = useCallback(
    (year: number, month: number, weekStartsOnMonday: boolean = false): CalendarDay[] => {
      return generateMonthDays(year, month, config, weekStartsOnMonday, holidays, inServiceDays, inServiceConfig);
    },
    [config, holidays, inServiceDays, inServiceConfig]
  );

  const getYearlyStatsFn = useCallback(
    (year: number): YearlyStats => {
      return calculateYearlyStats(year, config, holidays, inServiceDays, inServiceConfig);
    },
    [config, holidays, inServiceDays, inServiceConfig]
  );

  return useMemo(
    () => ({
      getOwnerForDate: getOwnerForDateFn,
      getOwnerForDateWithHolidays: getOwnerForDateWithHolidaysFn,
      getOwnerForDateFull: getOwnerForDateFullFn,
      getMonthDays: getMonthDaysFn,
      getYearlyStats: getYearlyStatsFn,
    }),
    [getOwnerForDateFn, getOwnerForDateWithHolidaysFn, getOwnerForDateFullFn, getMonthDaysFn, getYearlyStatsFn]
  );
}
