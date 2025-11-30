import type {
  HolidayDefinition,
  SplitPeriodConfig,
  SelectionPriorityConfig,
  HolidayPreset,
  HolidayPresetType,
  HolidayUserConfig,
  BirthdayConfig,
} from '../types/holidays';
import { getExpandedHolidayDates, getExpansionRuleForHoliday } from '../utils/holidayExpansion';

/**
 * All 11 Weekend Holidays defined with correct date calculations.
 * These are typically 3-day weekends (Friday-Sunday or Saturday-Monday).
 */
export const WEEKEND_HOLIDAYS: HolidayDefinition[] = [
  {
    id: 'mlk-day',
    name: 'Martin Luther King Jr. Day',
    category: 'weekend',
    defaultAssignment: 'alternate-odd-even',
    dateCalculation: {
      type: 'nth-weekday',
      month: 1, // January
      weekday: 1, // Monday
      nth: 3, // Third Monday
    },
    durationDays: 3,
    priority: 20,
    description: 'Third Monday of January',
    enabledByDefault: true,
  },
  {
    id: 'presidents-day',
    name: "Presidents' Day",
    category: 'weekend',
    defaultAssignment: 'alternate-odd-even',
    dateCalculation: {
      type: 'nth-weekday',
      month: 2, // February
      weekday: 1, // Monday
      nth: 3, // Third Monday
    },
    durationDays: 3,
    priority: 20,
    description: 'Third Monday of February',
    enabledByDefault: true,
  },
  {
    id: 'mothers-day',
    name: "Mother's Day",
    category: 'weekend',
    defaultAssignment: 'always-parent-b', // Traditionally with mother
    dateCalculation: {
      type: 'nth-weekday',
      month: 5, // May
      weekday: 0, // Sunday
      nth: 2, // Second Sunday
    },
    durationDays: 3,
    priority: 25, // Higher priority for parent-specific days
    description: 'Second Sunday of May',
    enabledByDefault: true,
  },
  {
    id: 'memorial-day',
    name: 'Memorial Day',
    category: 'weekend',
    defaultAssignment: 'alternate-odd-even',
    dateCalculation: {
      type: 'last-weekday',
      month: 5, // May
      weekday: 1, // Monday
    },
    durationDays: 3,
    priority: 20,
    description: 'Last Monday of May',
    enabledByDefault: true,
  },
  {
    id: 'fathers-day',
    name: "Father's Day",
    category: 'weekend',
    defaultAssignment: 'always-parent-a', // Traditionally with father
    dateCalculation: {
      type: 'nth-weekday',
      month: 6, // June
      weekday: 0, // Sunday
      nth: 3, // Third Sunday
    },
    durationDays: 3,
    priority: 25, // Higher priority for parent-specific days
    description: 'Third Sunday of June',
    enabledByDefault: true,
  },
  {
    id: 'independence-day',
    name: 'Independence Day',
    category: 'weekend',
    defaultAssignment: 'alternate-odd-even',
    dateCalculation: {
      type: 'fixed',
      month: 7, // July
      day: 4,
    },
    durationDays: 3, // Extends to nearest weekend
    priority: 20,
    description: 'July 4th weekend',
    enabledByDefault: true,
  },
  {
    id: 'labor-day',
    name: 'Labor Day',
    category: 'weekend',
    defaultAssignment: 'alternate-odd-even',
    dateCalculation: {
      type: 'nth-weekday',
      month: 9, // September
      weekday: 1, // Monday
      nth: 1, // First Monday
    },
    durationDays: 3,
    priority: 20,
    description: 'First Monday of September',
    enabledByDefault: true,
  },
  {
    id: 'nevada-day',
    name: 'Nevada Day',
    category: 'weekend',
    defaultAssignment: 'alternate-odd-even',
    dateCalculation: {
      type: 'last-weekday',
      month: 10, // October
      weekday: 5, // Friday
    },
    durationDays: 3,
    priority: 15, // Lower priority, state-specific
    description: 'Last Friday of October',
    enabledByDefault: true,
  },
  {
    id: 'halloween',
    name: 'Halloween',
    category: 'weekend',
    defaultAssignment: 'alternate-odd-even',
    dateCalculation: {
      type: 'fixed',
      month: 10, // October
      day: 31,
    },
    durationDays: 1, // Just the evening
    priority: 15,
    description: 'October 31st evening',
    enabledByDefault: true,
  },
  {
    id: 'veterans-day',
    name: 'Veterans Day',
    category: 'weekend',
    defaultAssignment: 'alternate-odd-even',
    dateCalculation: {
      type: 'fixed',
      month: 11, // November
      day: 11,
    },
    durationDays: 3, // Extends to nearest weekend
    priority: 20,
    description: 'November 11th weekend',
    enabledByDefault: true,
  },
];

/**
 * Major Breaks - Extended holiday periods.
 * These account for 50+ days combined.
 */
export const MAJOR_BREAKS: HolidayDefinition[] = [
  {
    id: 'spring-break',
    name: 'Spring Break',
    category: 'major-break',
    defaultAssignment: 'alternate-odd-even',
    dateCalculation: {
      type: 'date-range',
      startMonth: 3, // March
      startDay: 17,
      endMonth: 3,
      endDay: 23,
    },
    durationDays: 7,
    priority: 30,
    description: 'Typically one week in mid-March',
    enabledByDefault: true,
  },
  {
    id: 'thanksgiving',
    name: 'Thanksgiving',
    category: 'major-break',
    defaultAssignment: 'alternate-odd-even',
    dateCalculation: {
      type: 'nth-weekday',
      month: 11, // November
      weekday: 4, // Thursday
      nth: 4, // Fourth Thursday
    },
    durationDays: 5, // Wed 6pm - Sun 6pm
    priority: 35,
    description: 'Wednesday 6pm through Sunday 6pm',
    enabledByDefault: true,
  },
  {
    id: 'winter-break',
    name: 'Winter Break',
    category: 'major-break',
    defaultAssignment: 'split-period',
    dateCalculation: {
      type: 'date-range',
      startMonth: 12, // December
      startDay: 23,
      endMonth: 1, // January (next year)
      endDay: 2,
    },
    durationDays: 14,
    priority: 40,
    description: 'December 23 through January 2',
    enabledByDefault: true,
  },
  {
    id: 'summer-vacation',
    name: 'Summer Vacation',
    category: 'major-break',
    defaultAssignment: 'selection-priority',
    dateCalculation: {
      type: 'date-range',
      startMonth: 6, // June
      startDay: 1,
      endMonth: 8, // August
      endDay: 15,
    },
    durationDays: 26, // Each parent gets approximately 2 weeks × 2 blocks
    priority: 45,
    description: 'Each parent selects vacation weeks',
    enabledByDefault: true,
  },
];

/**
 * Birthday type definitions (not the actual birthdays, but the types).
 */
export const BIRTHDAY_DEFINITIONS: HolidayDefinition[] = [
  {
    id: 'child-birthday',
    name: "Children's Birthday",
    category: 'birthday',
    defaultAssignment: 'alternate-odd-even',
    dateCalculation: { type: 'custom' },
    durationDays: 1,
    priority: 50, // High priority
    description: "Child's birthday celebration",
    enabledByDefault: true,
  },
  {
    id: 'mother-birthday',
    name: "Mother's Birthday",
    category: 'birthday',
    defaultAssignment: 'always-parent-b',
    dateCalculation: { type: 'custom' },
    durationDays: 1,
    priority: 50,
    description: "Mother's birthday",
    enabledByDefault: true,
  },
  {
    id: 'father-birthday',
    name: "Father's Birthday",
    category: 'birthday',
    defaultAssignment: 'always-parent-a',
    dateCalculation: { type: 'custom' },
    durationDays: 1,
    priority: 50,
    description: "Father's birthday",
    enabledByDefault: true,
  },
];

/**
 * All holidays combined for easy access.
 */
export const ALL_HOLIDAYS: HolidayDefinition[] = [
  ...MAJOR_BREAKS,
  ...WEEKEND_HOLIDAYS,
  ...BIRTHDAY_DEFINITIONS,
];

/**
 * Default Winter Break split configuration.
 * Christmas segment (Dec 23 - Dec 26 noon) and New Year segment (Dec 26 noon - Jan 2).
 */
export const DEFAULT_WINTER_BREAK_SPLIT: SplitPeriodConfig = {
  holidayId: 'winter-break',
  splitPoint: 'December 26 at 12:00 PM',
  splitDate: '12-26',
  segment1Name: 'Christmas',
  segment2Name: "New Year's",
  segment1Assignment: 'alternate-odd-even', // Even years to Parent A
  segment2Assignment: 'alternate-odd-even', // Opposite of segment 1
};

/**
 * Default Summer Vacation selection configuration.
 */
export const DEFAULT_SUMMER_VACATION_CONFIG: SelectionPriorityConfig = {
  holidayId: 'summer-vacation',
  weeksPerParent: 2,
  blocksPerParent: 2,
  selectionDeadline: 'April 1',
  firstPickOddYears: 'parentA',
  maxConsecutiveWeeks: 2,
};

/**
 * Holiday Presets for quick configuration.
 */
export const HOLIDAY_PRESETS: HolidayPreset[] = [
  {
    type: 'traditional',
    name: 'Traditional',
    description: 'Alternating major holidays, fixed parent days (Mother/Father\'s Day)',
    assignments: {
      'mlk-day': 'alternate-odd-even',
      'presidents-day': 'alternate-odd-even',
      'mothers-day': 'always-parent-b',
      'memorial-day': 'alternate-odd-even',
      'fathers-day': 'always-parent-a',
      'independence-day': 'alternate-odd-even',
      'labor-day': 'alternate-odd-even',
      'nevada-day': 'alternate-odd-even',
      'halloween': 'alternate-odd-even',
      'veterans-day': 'alternate-odd-even',
      'spring-break': 'alternate-odd-even',
      'thanksgiving': 'alternate-odd-even',
      'winter-break': 'split-period',
      'summer-vacation': 'selection-priority',
      'child-birthday': 'alternate-odd-even',
      'mother-birthday': 'always-parent-b',
      'father-birthday': 'always-parent-a',
    },
  },
  {
    type: '50-50-split',
    name: '50/50 Split',
    description: 'Alternate all holidays by odd/even years',
    assignments: {
      'mlk-day': 'alternate-odd-even',
      'presidents-day': 'alternate-odd-even',
      'mothers-day': 'alternate-odd-even',
      'memorial-day': 'alternate-odd-even',
      'fathers-day': 'alternate-odd-even',
      'independence-day': 'alternate-odd-even',
      'labor-day': 'alternate-odd-even',
      'nevada-day': 'alternate-odd-even',
      'halloween': 'alternate-odd-even',
      'veterans-day': 'alternate-odd-even',
      'spring-break': 'alternate-odd-even',
      'thanksgiving': 'alternate-odd-even',
      'winter-break': 'split-period',
      'summer-vacation': 'selection-priority',
      'child-birthday': 'alternate-odd-even',
      'mother-birthday': 'alternate-odd-even',
      'father-birthday': 'alternate-odd-even',
    },
  },
  {
    type: 'one-parent-all',
    name: 'One Parent All',
    description: 'All holidays assigned to Parent A (can be customized)',
    assignments: {
      'mlk-day': 'always-parent-a',
      'presidents-day': 'always-parent-a',
      'mothers-day': 'always-parent-a',
      'memorial-day': 'always-parent-a',
      'fathers-day': 'always-parent-a',
      'independence-day': 'always-parent-a',
      'labor-day': 'always-parent-a',
      'nevada-day': 'always-parent-a',
      'halloween': 'always-parent-a',
      'veterans-day': 'always-parent-a',
      'spring-break': 'always-parent-a',
      'thanksgiving': 'always-parent-a',
      'winter-break': 'always-parent-a',
      'summer-vacation': 'always-parent-a',
      'child-birthday': 'always-parent-a',
      'mother-birthday': 'always-parent-a',
      'father-birthday': 'always-parent-a',
    },
  },
];

/**
 * Get a holiday definition by its ID.
 */
export function getHolidayById(id: string): HolidayDefinition | undefined {
  return ALL_HOLIDAYS.find((h) => h.id === id);
}

/**
 * Get holidays by category.
 */
export function getHolidaysByCategory(category: HolidayDefinition['category']): HolidayDefinition[] {
  return ALL_HOLIDAYS.filter((h) => h.category === category);
}

/**
 * Get a preset by type.
 */
export function getPresetByType(type: HolidayPresetType): HolidayPreset | undefined {
  return HOLIDAY_PRESETS.find((p) => p.type === type);
}

/**
 * Create default holiday configurations based on holiday definitions.
 */
export function createDefaultHolidayConfigs(): HolidayUserConfig[] {
  return ALL_HOLIDAYS.map((holiday) => ({
    holidayId: holiday.id,
    enabled: holiday.enabledByDefault ?? true,
    assignment: holiday.defaultAssignment,
  }));
}

/**
 * Create default birthday configurations.
 */
export function createDefaultBirthdayConfigs(): BirthdayConfig[] {
  return [
    {
      id: 'mother-birthday',
      name: 'Mother',
      type: 'parent-b',
      month: 1,
      day: 1,
      defaultAssignment: 'always-parent-b',
    },
    {
      id: 'father-birthday',
      name: 'Father',
      type: 'parent-a',
      month: 1,
      day: 1,
      defaultAssignment: 'always-parent-a',
    },
  ];
}

/**
 * Apply a preset to holiday configurations.
 */
export function applyPreset(
  configs: HolidayUserConfig[],
  presetType: HolidayPresetType
): HolidayUserConfig[] {
  const preset = getPresetByType(presetType);
  if (!preset) return configs;

  return configs.map((config) => {
    const presetAssignment = preset.assignments[config.holidayId];
    if (presetAssignment) {
      return { ...config, assignment: presetAssignment };
    }
    return config;
  });
}

/**
 * Calculate the date of an Nth weekday holiday (e.g., 3rd Monday of January).
 */
export function calculateNthWeekday(year: number, month: number, weekday: number, nth: number): string {
  // Start at the first day of the month
  const firstDay = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstDay.getDay();
  
  // Calculate the day of the first occurrence of the weekday
  let daysToAdd = weekday - firstDayOfWeek;
  if (daysToAdd < 0) daysToAdd += 7;
  
  // Calculate the day of the nth occurrence
  const day = 1 + daysToAdd + (nth - 1) * 7;
  
  // Format as YYYY-MM-DD
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Calculate the date of the last weekday of a month (e.g., last Monday of May).
 */
export function calculateLastWeekday(year: number, month: number, weekday: number): string {
  // Start at the last day of the month
  const lastDay = new Date(year, month, 0); // Day 0 of next month = last day of this month
  const lastDayOfWeek = lastDay.getDay();
  
  // Calculate how many days to subtract to get to the target weekday
  let daysToSubtract = lastDayOfWeek - weekday;
  if (daysToSubtract < 0) daysToSubtract += 7;
  
  const day = lastDay.getDate() - daysToSubtract;
  
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Get the date(s) for a holiday in a specific year.
 * Returns an array of ISO date strings.
 * 
 * This function applies conditional expansion rules for holidays that depend
 * on what day of week they fall on (e.g., July 4th, Veterans Day).
 */
export function getHolidayDates(holiday: HolidayDefinition, year: number): string[] {
  const { dateCalculation, durationDays, id } = holiday;
  
  // Check if this holiday has a conditional expansion rule
  const expansionRule = getExpansionRuleForHoliday(id);
  
  // For holidays with expansion rules (like July 4, Veterans Day, Halloween),
  // calculate the base date first, then apply the expansion rule
  if (expansionRule) {
    const baseDate = getHolidayBaseDate(dateCalculation, year);
    if (baseDate) {
      return getExpandedHolidayDates(baseDate, expansionRule);
    }
  }
  
  // Standard date calculation for holidays without expansion rules
  const dates: string[] = [];

  switch (dateCalculation.type) {
    case 'fixed': {
      const startDate = `${year}-${String(dateCalculation.month).padStart(2, '0')}-${String(dateCalculation.day).padStart(2, '0')}`;
      for (let i = 0; i < durationDays; i++) {
        const date = new Date(startDate + 'T00:00:00');
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
      break;
    }
    case 'nth-weekday': {
      const startDate = calculateNthWeekday(year, dateCalculation.month, dateCalculation.weekday, dateCalculation.nth);
      for (let i = 0; i < durationDays; i++) {
        const date = new Date(startDate + 'T00:00:00');
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
      break;
    }
    case 'last-weekday': {
      const startDate = calculateLastWeekday(year, dateCalculation.month, dateCalculation.weekday);
      for (let i = 0; i < durationDays; i++) {
        const date = new Date(startDate + 'T00:00:00');
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
      break;
    }
    case 'date-range': {
      // For date ranges that cross year boundaries (e.g., Winter Break Dec 23 - Jan 2):
      // - If endMonth < startMonth, the range crosses into the next year
      // - Example: startMonth=12, endMonth=1 → endYear = year + 1
      // - For Winter Break in 2025: Dec 23, 2025 to Jan 2, 2026
      const startDate = `${year}-${String(dateCalculation.startMonth).padStart(2, '0')}-${String(dateCalculation.startDay).padStart(2, '0')}`;
      const endYear = dateCalculation.endMonth < dateCalculation.startMonth ? year + 1 : year;
      const endDate = `${endYear}-${String(dateCalculation.endMonth).padStart(2, '0')}-${String(dateCalculation.endDay).padStart(2, '0')}`;
      
      const currentDate = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T00:00:00');
      
      while (currentDate <= end) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      break;
    }
    case 'custom':
      // Custom dates are user-defined, return empty array
      if (dateCalculation.dates) {
        dates.push(...dateCalculation.dates);
      }
      break;
  }

  return dates;
}

/**
 * Get the base date for a holiday (before expansion).
 * This is used by holidays with conditional expansion rules.
 */
function getHolidayBaseDate(dateCalculation: HolidayDefinition['dateCalculation'], year: number): string | null {
  switch (dateCalculation.type) {
    case 'fixed':
      return `${year}-${String(dateCalculation.month).padStart(2, '0')}-${String(dateCalculation.day).padStart(2, '0')}`;
    case 'nth-weekday':
      return calculateNthWeekday(year, dateCalculation.month, dateCalculation.weekday, dateCalculation.nth);
    case 'last-weekday':
      return calculateLastWeekday(year, dateCalculation.month, dateCalculation.weekday);
    default:
      return null;
  }
}

/**
 * Calculate the display date string for a holiday in the current year.
 */
export function getHolidayDisplayDate(holiday: HolidayDefinition, year: number = new Date().getFullYear()): string {
  const dates = getHolidayDates(holiday, year);
  if (dates.length === 0) return 'Date not set';
  
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (dates.length === 1) {
    return formatDate(dates[0]);
  }
  
  return `${formatDate(dates[0])} - ${formatDate(dates[dates.length - 1])}`;
}

/**
 * Get total days for a category of holidays.
 */
export function getCategoryTotalDays(category: HolidayDefinition['category']): number {
  return getHolidaysByCategory(category).reduce((sum, h) => sum + h.durationDays, 0);
}
