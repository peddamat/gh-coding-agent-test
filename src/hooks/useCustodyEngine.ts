import { useMemo, useCallback } from 'react';
import type { AppConfig, ParentId, CalendarDay } from '../types';
import { PATTERNS } from '../data/patterns';

/**
 * Date arithmetic utilities - CRITICAL: Use ISO 8601 strings to avoid DST issues.
 */

/**
 * Add days to a date string, returning a new date string.
 * Uses date-only arithmetic to avoid DST issues.
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
 * 1st, 3rd, and 5th weekends go to Parent B.
 * Weekdays and 2nd/4th weekends go to Parent A.
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
  const weekendNumber = Math.ceil(dayOfMonth / 7);

  // 1st, 3rd, 5th weekends go to the other parent (Parent B)
  if (weekendNumber === 1 || weekendNumber === 3 || weekendNumber === 5) {
    return getOtherParent(startingParent);
  }

  return startingParent;
}

/**
 * Get owner for a date based on the pattern cycle.
 */
export function getPatternOwner(
  date: string,
  startDate: string,
  pattern: ('A' | 'B')[],
  cycleLength: number,
  startingParent: ParentId
): ParentId {
  const daysDiff = calculateDaysDifference(date, startDate);
  // Handle negative days diff by wrapping correctly
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
 * Generate calendar days for a given month.
 * Returns 42 days (6 weeks) to fill a standard calendar grid.
 */
export function generateMonthDays(
  year: number,
  month: number,
  config: AppConfig,
  weekStartsOnMonday: boolean = false
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

    const owner = getOwnerForDate(dateStr, config);

    days.push({
      date: dateStr,
      dayOfMonth: currentDate.getDate(),
      owner,
      isToday: isTodayDate,
      isCurrentMonth,
    });
  }

  return days;
}

/**
 * Hook return type for useCustodyEngine.
 */
export interface UseCustodyEngineReturn {
  /** Get the custody owner for a specific date */
  getOwnerForDate: (date: string) => ParentId;
  /** Get calendar days for a specific month */
  getMonthDays: (year: number, month: number, weekStartsOnMonday?: boolean) => CalendarDay[];
}

/**
 * Hook for calculating custody schedules.
 * Provides functions to determine custody ownership for any date and generate calendar data.
 *
 * @param config - The app configuration containing pattern, start date, and starting parent
 * @returns Object with getOwnerForDate and getMonthDays functions
 */
export function useCustodyEngine(config: AppConfig): UseCustodyEngineReturn {
  const getOwnerForDateFn = useCallback(
    (date: string): ParentId => {
      return getOwnerForDate(date, config);
    },
    [config]
  );

  const getMonthDaysFn = useCallback(
    (year: number, month: number, weekStartsOnMonday: boolean = false): CalendarDay[] => {
      return generateMonthDays(year, month, config, weekStartsOnMonday);
    },
    [config]
  );

  return useMemo(
    () => ({
      getOwnerForDate: getOwnerForDateFn,
      getMonthDays: getMonthDaysFn,
    }),
    [getOwnerForDateFn, getMonthDaysFn]
  );
}
