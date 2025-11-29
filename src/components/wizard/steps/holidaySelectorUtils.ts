import type { ParentId } from '../../../types';

/**
 * Represents how custody is assigned for a holiday.
 * Can be a specific parent or alternating between years.
 */
export type HolidayAssignment = ParentId | 'alternate';

/** Holiday definition with metadata */
export interface HolidayDefinition {
  id: string;
  name: string;
  /** Date description - fixed format like '12-25' or dynamic like 'fourth-thursday-november' */
  date: string;
}

/** State of a single holiday selection */
export interface HolidaySelection {
  holidayId: string;
  assignment: HolidayAssignment;
}

/** Major US holidays for custody scheduling */
export const HOLIDAYS: HolidayDefinition[] = [
  { id: 'thanksgiving', name: 'Thanksgiving', date: 'fourth-thursday-november' },
  { id: 'christmas', name: 'Christmas Day', date: '12-25' },
  { id: 'newyear', name: "New Year's Day", date: '01-01' },
  { id: 'july4', name: 'Independence Day', date: '07-04' },
  { id: 'memorial', name: 'Memorial Day', date: 'last-monday-may' },
  { id: 'labor', name: 'Labor Day', date: 'first-monday-september' },
];

/**
 * Get the default holiday selections.
 * Returns selections with 'alternate' as the default assignment for all holidays.
 */
export function getDefaultHolidaySelections(): HolidaySelection[] {
  return HOLIDAYS.map((holiday) => ({
    holidayId: holiday.id,
    assignment: 'alternate',
  }));
}

/**
 * Returns true if the assignment is explicitly configured (not left on default 'alternate').
 * Note: 'alternate' is treated as the default/unconfigured state.
 */
export function isConfiguredAssignment(assignment: HolidayAssignment): boolean {
  return assignment === 'parentA' || assignment === 'parentB';
}

/**
 * Count how many holidays have been explicitly configured (not left on default 'alternate').
 * Only holidays assigned to a specific parent are considered "configured".
 */
export function getConfiguredHolidayCount(selections: HolidaySelection[]): number {
  return selections.filter((s) => isConfiguredAssignment(s.assignment)).length;
}
