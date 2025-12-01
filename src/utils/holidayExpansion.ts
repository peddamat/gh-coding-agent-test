/**
 * Holiday Expansion Rules
 *
 * This module provides a generic rule engine for conditional holiday expansion.
 * Some holidays (like July 4th or Veterans Day) expand to include adjacent
 * weekend days depending on what day of the week they fall on.
 *
 * Examples:
 * - July 4 on Friday → Fri-Sun (full weekend)
 * - July 4 on Tuesday → Just July 4 (single day)
 * - Veterans Day on Friday → Fri-Sun (includes weekend)
 * - Halloween → Always single day (Oct 31 evening only)
 */

/**
 * Expansion rule types:
 * - 'always': Always expand to a fixed number of days
 * - 'weekend-adjacent': Expand based on proximity to weekend
 * - 'day-of-week-conditional': Expand based on which day of week the holiday falls on
 */
export type ExpansionRule =
  | { type: 'always'; days: number }
  | { type: 'weekend-adjacent'; expandTo: 'full-weekend' | 'include-friday' | 'include-monday' }
  | { type: 'day-of-week-conditional'; rules: DayOfWeekRule[] };

/**
 * Rule for conditional expansion based on day of week.
 * @property dayOfWeek - Array of day numbers (0=Sun, 1=Mon, ..., 6=Sat)
 * @property expansion - How to expand when holiday falls on these days
 */
export interface DayOfWeekRule {
  dayOfWeek: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  expansion: 'none' | 'include-friday' | 'include-monday' | 'full-weekend';
}

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
 * Get the day of week for a date string.
 * @param dateStr - ISO date string (YYYY-MM-DD)
 * @returns Day of week (0=Sunday, 6=Saturday)
 */
function getDayOfWeek(dateStr: string): number {
  const date = new Date(dateStr + 'T00:00:00');
  return date.getDay();
}

/**
 * July 4th (Independence Day) expansion rule.
 *
 * If July 4 falls on:
 * - Friday → Fri-Sun (full weekend)
 * - Saturday → Sat-Sun (full weekend)
 * - Sunday → Fri-Sun (include Friday to make full weekend)
 * - Monday → Sat-Mon (full weekend including Monday)
 * - Tue/Wed/Thu → Single day only
 */
export const JULY_4_EXPANSION: ExpansionRule = {
  type: 'day-of-week-conditional',
  rules: [
    { dayOfWeek: [5], expansion: 'full-weekend' },     // Friday → Fri-Sun
    { dayOfWeek: [6], expansion: 'full-weekend' },     // Saturday → Sat-Sun
    { dayOfWeek: [0], expansion: 'include-friday' },   // Sunday → Fri-Sun
    { dayOfWeek: [1], expansion: 'full-weekend' },     // Monday → Sat-Mon
    { dayOfWeek: [2, 3, 4], expansion: 'none' },       // Tue/Wed/Thu → single day
  ],
};

/**
 * Veterans Day (November 11) expansion rule.
 *
 * Veterans Day includes the weekend only if it's attached to a weekend:
 * - Friday → Fri-Sun (includes weekend)
 * - Saturday → Sat-Sun (includes Sunday)
 * - Sunday → Sat-Sun (includes Saturday)
 * - Monday → Sat-Mon (includes weekend before)
 * - Tue/Wed/Thu → Single day only
 */
export const VETERANS_DAY_EXPANSION: ExpansionRule = {
  type: 'day-of-week-conditional',
  rules: [
    { dayOfWeek: [5], expansion: 'full-weekend' },     // Friday → Fri-Sun
    { dayOfWeek: [6], expansion: 'full-weekend' },     // Saturday → Sat-Sun
    { dayOfWeek: [0], expansion: 'include-friday' },   // Sunday → Fri-Sun (Fri + Sat + Sun)
    { dayOfWeek: [1], expansion: 'full-weekend' },     // Monday → Sat-Mon
    { dayOfWeek: [2, 3, 4], expansion: 'none' },       // Tue/Wed/Thu → single day
  ],
};

/**
 * Halloween expansion rule.
 * Halloween is always a single day (October 31 evening only).
 */
export const HALLOWEEN_EXPANSION: ExpansionRule = {
  type: 'always',
  days: 1,
};

/**
 * Predefined expansion rules for known holidays.
 * Use holiday IDs from src/data/holidays.ts as keys.
 */
export const HOLIDAY_EXPANSION_RULES: Record<string, ExpansionRule> = {
  'independence-day': JULY_4_EXPANSION,
  'veterans-day': VETERANS_DAY_EXPANSION,
  'halloween': HALLOWEEN_EXPANSION,
};

/**
 * Get all dates covered by a holiday after applying expansion rules.
 *
 * @param baseDate - The base date of the holiday (ISO string YYYY-MM-DD)
 * @param rule - The expansion rule to apply
 * @returns Array of all dates covered by this holiday (ISO strings)
 *
 * @example
 * // July 4, 2025 (Friday) → July 4-6 (Fri-Sun)
 * getExpandedHolidayDates('2025-07-04', JULY_4_EXPANSION)
 * // Returns: ['2025-07-04', '2025-07-05', '2025-07-06']
 *
 * @example
 * // July 4, 2028 (Tuesday) → July 4 only
 * getExpandedHolidayDates('2028-07-04', JULY_4_EXPANSION)
 * // Returns: ['2028-07-04']
 */
export function getExpandedHolidayDates(
  baseDate: string,
  rule: ExpansionRule
): string[] {
  const dayOfWeek = getDayOfWeek(baseDate);

  switch (rule.type) {
    case 'always':
      return getAlwaysExpansion(baseDate, rule.days);

    case 'weekend-adjacent':
      return getWeekendAdjacentExpansion(baseDate, rule.expandTo, dayOfWeek);

    case 'day-of-week-conditional':
      return getDayOfWeekConditionalExpansion(baseDate, rule.rules, dayOfWeek);
  }
}

/**
 * Handle 'always' expansion type - always expand to fixed number of days.
 */
function getAlwaysExpansion(baseDate: string, days: number): string[] {
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    dates.push(addDays(baseDate, i));
  }
  return dates;
}

/**
 * Handle 'weekend-adjacent' expansion type.
 * Expands based on proximity to weekend.
 */
function getWeekendAdjacentExpansion(
  baseDate: string,
  expandTo: 'full-weekend' | 'include-friday' | 'include-monday',
  dayOfWeek: number
): string[] {
  switch (expandTo) {
    case 'full-weekend':
      return getFullWeekendDates(baseDate, dayOfWeek);
    case 'include-friday':
      return getIncludeFridayDates(baseDate, dayOfWeek);
    case 'include-monday':
      return getIncludeMondayDates(baseDate, dayOfWeek);
  }
}

/**
 * Handle 'day-of-week-conditional' expansion type.
 * Applies different expansion based on what day of week the holiday falls on.
 */
function getDayOfWeekConditionalExpansion(
  baseDate: string,
  rules: DayOfWeekRule[],
  dayOfWeek: number
): string[] {
  // Find the rule that matches the current day of week
  const matchingRule = rules.find((r) => r.dayOfWeek.includes(dayOfWeek));

  if (!matchingRule) {
    // No matching rule found, return just the base date
    return [baseDate];
  }

  switch (matchingRule.expansion) {
    case 'none':
      return [baseDate];
    case 'include-friday':
      return getIncludeFridayDates(baseDate, dayOfWeek);
    case 'include-monday':
      return getIncludeMondayDates(baseDate, dayOfWeek);
    case 'full-weekend':
      return getFullWeekendDates(baseDate, dayOfWeek);
  }
}

/**
 * Get full weekend dates (Fri-Sun or Sat-Mon depending on holiday position).
 *
 * Logic:
 * - If holiday is Friday: Fri, Sat, Sun
 * - If holiday is Saturday: Sat, Sun
 * - If holiday is Sunday: Sat, Sun
 * - If holiday is Monday: Sat, Sun, Mon
 * - Otherwise: just the holiday date
 */
function getFullWeekendDates(baseDate: string, dayOfWeek: number): string[] {
  const dates: string[] = [];

  switch (dayOfWeek) {
    case 5: // Friday
      // Fri, Sat, Sun
      dates.push(baseDate);
      dates.push(addDays(baseDate, 1)); // Saturday
      dates.push(addDays(baseDate, 2)); // Sunday
      break;
    case 6: // Saturday
      // Sat, Sun
      dates.push(baseDate);
      dates.push(addDays(baseDate, 1)); // Sunday
      break;
    case 0: // Sunday
      // Sat, Sun (include Saturday before)
      dates.push(addDays(baseDate, -1)); // Saturday
      dates.push(baseDate);
      break;
    case 1: // Monday
      // Sat, Sun, Mon
      dates.push(addDays(baseDate, -2)); // Saturday
      dates.push(addDays(baseDate, -1)); // Sunday
      dates.push(baseDate);
      break;
    default:
      // Mid-week: just the holiday
      dates.push(baseDate);
  }

  return dates.sort(); // Ensure dates are in chronological order
}

/**
 * Get dates including Friday (for Sunday holidays to create Fri-Sun).
 *
 * For a Sunday holiday, we want to include Friday and Saturday
 * to create a full Fri-Sun weekend.
 */
function getIncludeFridayDates(baseDate: string, dayOfWeek: number): string[] {
  const dates: string[] = [];

  if (dayOfWeek === 0) {
    // Sunday: include Fri, Sat, Sun
    dates.push(addDays(baseDate, -2)); // Friday
    dates.push(addDays(baseDate, -1)); // Saturday
    dates.push(baseDate);              // Sunday
  } else if (dayOfWeek === 6) {
    // Saturday: include Fri, Sat
    dates.push(addDays(baseDate, -1)); // Friday
    dates.push(baseDate);              // Saturday
  } else {
    // Other days: just the base date
    dates.push(baseDate);
  }

  return dates.sort();
}

/**
 * Get dates including Monday (for weekend holidays to extend to Monday).
 *
 * For a Saturday holiday, extend to include Sunday and Monday.
 * For a Sunday holiday, extend to include Monday.
 */
function getIncludeMondayDates(baseDate: string, dayOfWeek: number): string[] {
  const dates: string[] = [];

  if (dayOfWeek === 6) {
    // Saturday: Sat, Sun, Mon
    dates.push(baseDate);
    dates.push(addDays(baseDate, 1)); // Sunday
    dates.push(addDays(baseDate, 2)); // Monday
  } else if (dayOfWeek === 0) {
    // Sunday: Sun, Mon
    dates.push(baseDate);
    dates.push(addDays(baseDate, 1)); // Monday
  } else {
    // Other days: just the base date
    dates.push(baseDate);
  }

  return dates.sort();
}

/**
 * Get the expansion rule for a specific holiday by ID.
 * Returns undefined if no special expansion rule exists for this holiday.
 *
 * @param holidayId - The holiday ID from src/data/holidays.ts
 * @returns The expansion rule, or undefined if no rule exists
 */
export function getExpansionRuleForHoliday(holidayId: string): ExpansionRule | undefined {
  return HOLIDAY_EXPANSION_RULES[holidayId];
}

/**
 * Check if a holiday has a custom expansion rule.
 *
 * @param holidayId - The holiday ID from src/data/holidays.ts
 * @returns true if the holiday has a custom expansion rule
 */
export function hasCustomExpansionRule(holidayId: string): boolean {
  return holidayId in HOLIDAY_EXPANSION_RULES;
}
