import type { CourtTemplate, HolidayAssignment, MajorBreakConfig } from '../../types';

/**
 * Nevada 8th District Court Holiday and Vacation Plan Template.
 * 
 * Based on the standard court order format used in Clark County, Nevada.
 * This template pre-configures:
 * - Holiday assignments alternating by odd/even years
 * - Standard exchange time of 6:00 PM
 * - Summer vacation selection rules
 * - Winter break split configuration
 * 
 * Reference: docs/examples/2025-11-16-0001.pdf
 */

/**
 * Holiday assignments from the Nevada 8th District Court template.
 * 
 * Key mappings from the court PDF:
 * | Holiday               | Odd Years | Even Years | Time                      |
 * |-----------------------|-----------|------------|---------------------------|
 * | New Year's Day        | Parent B  | Parent A   | 6 PM Dec 31 - 6 PM Jan 1  |
 * | President's Day Wknd  | Parent A  | Parent B   | Fri 6 PM - Mon 6 PM       |
 * | Spring Break          | Parent B  | Parent A   | As school calendar        |
 * | Easter Weekend        | Parent A  | Parent B   | Fri 6 PM - Sun 6 PM       |
 * | Memorial Day Weekend  | Parent B  | Parent A   | Fri 6 PM - Mon 6 PM       |
 * | Independence Day      | Parent A  | Parent B   | 6 PM Jul 3 - 6 PM Jul 5   |
 * | Labor Day Weekend     | Parent B  | Parent A   | Fri 6 PM - Mon 6 PM       |
 * | Nevada Day Weekend    | Parent A  | Parent B   | Fri 6 PM - Mon 6 PM       |
 * | Thanksgiving          | Parent B  | Parent A   | Wed 6 PM - Sun 6 PM       |
 * | Christmas Break       | Split     | Split      | First/Second half altern. |
 */
const NEVADA_HOLIDAY_ASSIGNMENTS: HolidayAssignment[] = [
  // New Year's Day: Parent B in odd years, Parent A in even years
  {
    holidayId: 'new-years-day',
    assignment: 'alternate-odd-even',
    oddYearParent: 'parentB',
    exchangeTime: '18:00',
    timingDescription: '6:00 PM December 31 through 6:00 PM January 1',
    enabled: true,
  },
  // President's Day Weekend: Parent A in odd years, Parent B in even years
  {
    holidayId: 'presidents-day',
    assignment: 'alternate-odd-even',
    oddYearParent: 'parentA',
    exchangeTime: '18:00',
    timingDescription: 'Friday 6:00 PM through Monday 6:00 PM',
    enabled: true,
  },
  // Spring Break: Parent B in odd years, Parent A in even years
  {
    holidayId: 'spring-break',
    assignment: 'alternate-odd-even',
    oddYearParent: 'parentB',
    exchangeTime: '18:00',
    timingDescription: 'As determined by school calendar',
    enabled: true,
  },
  // Easter Weekend: Parent A in odd years, Parent B in even years
  {
    holidayId: 'easter',
    assignment: 'alternate-odd-even',
    oddYearParent: 'parentA',
    exchangeTime: '18:00',
    timingDescription: 'Friday 6:00 PM through Sunday 6:00 PM',
    enabled: true,
  },
  // Memorial Day Weekend: Parent B in odd years, Parent A in even years
  {
    holidayId: 'memorial-day',
    assignment: 'alternate-odd-even',
    oddYearParent: 'parentB',
    exchangeTime: '18:00',
    timingDescription: 'Friday 6:00 PM through Monday 6:00 PM',
    enabled: true,
  },
  // Independence Day: Parent A in odd years, Parent B in even years
  {
    holidayId: 'independence-day',
    assignment: 'alternate-odd-even',
    oddYearParent: 'parentA',
    exchangeTime: '18:00',
    timingDescription: '6:00 PM July 3 through 6:00 PM July 5',
    enabled: true,
  },
  // Labor Day Weekend: Parent B in odd years, Parent A in even years
  {
    holidayId: 'labor-day',
    assignment: 'alternate-odd-even',
    oddYearParent: 'parentB',
    exchangeTime: '18:00',
    timingDescription: 'Friday 6:00 PM through Monday 6:00 PM',
    enabled: true,
  },
  // Nevada Day Weekend: Parent A in odd years, Parent B in even years
  {
    holidayId: 'nevada-day',
    assignment: 'alternate-odd-even',
    oddYearParent: 'parentA',
    exchangeTime: '18:00',
    timingDescription: 'Friday 6:00 PM through Monday 6:00 PM',
    enabled: true,
  },
  // Thanksgiving: Parent B in odd years, Parent A in even years
  {
    holidayId: 'thanksgiving',
    assignment: 'alternate-odd-even',
    oddYearParent: 'parentB',
    exchangeTime: '18:00',
    timingDescription: 'Wednesday 6:00 PM through Sunday 6:00 PM',
    enabled: true,
  },
  // Winter Break: Split between parents
  {
    holidayId: 'winter-break',
    assignment: 'split-period',
    exchangeTime: '18:00',
    timingDescription: 'First half / Second half alternates by year',
    enabled: true,
  },
  // Three-Day Weekends (not specifically assigned)
  {
    holidayId: 'mlk-day',
    assignment: 'alternate-odd-even',
    oddYearParent: 'parentA',
    exchangeTime: '18:00',
    timingDescription: 'Friday 6:00 PM through Monday 6:00 PM',
    enabled: true,
  },
  // Veterans Day (if it falls on a school day)
  {
    holidayId: 'veterans-day',
    assignment: 'alternate-odd-even',
    oddYearParent: 'parentB',
    exchangeTime: '18:00',
    timingDescription: 'Friday 6:00 PM through Monday 6:00 PM (if 3-day weekend)',
    enabled: true,
  },
  // Mother's Day: Always with mother (Parent B by convention)
  {
    holidayId: 'mothers-day',
    assignment: 'always-parent-b',
    exchangeTime: '18:00',
    timingDescription: 'Saturday 9:00 AM through Sunday 6:00 PM',
    enabled: true,
  },
  // Father's Day: Always with father (Parent A by convention)
  {
    holidayId: 'fathers-day',
    assignment: 'always-parent-a',
    exchangeTime: '18:00',
    timingDescription: 'Saturday 9:00 AM through Sunday 6:00 PM',
    enabled: true,
  },
  // Halloween
  {
    holidayId: 'halloween',
    assignment: 'alternate-odd-even',
    oddYearParent: 'parentA',
    exchangeTime: '18:00',
    timingDescription: '6:00 PM October 31 through 9:00 PM October 31',
    enabled: true,
  },
];

/**
 * Major break configurations for the Nevada 8th District Court template.
 */
const NEVADA_MAJOR_BREAKS: MajorBreakConfig[] = [
  // Summer Vacation: Selection-based, 2 weeks per parent
  {
    breakId: 'summer-vacation',
    name: 'Summer Vacation',
    startMonth: 6, // June
    startDay: 1,
    endMonth: 8, // August
    endDay: 15,
    weeksPerParent: 2,
    selectionDeadline: 'April 1',
    firstPickOddYears: 'parentA',
    maxConsecutiveWeeks: 2,
  },
  // Winter Break: Split between Christmas and New Year's
  {
    breakId: 'winter-break',
    name: 'Winter Break',
    startMonth: 12, // December
    startDay: 23,
    endMonth: 1, // January (next year)
    endDay: 2,
    isSplit: true,
    splitDate: 'December 26 at 12:00 PM',
    splitDescription: 'First half (Dec 23 - Dec 26 noon) alternates with second half (Dec 26 noon - Jan 2)',
  },
  // Spring Break: Follows school calendar
  {
    breakId: 'spring-break',
    name: 'Spring Break',
    startMonth: 3, // March (approximate)
    startDay: 15,
    endMonth: 3,
    endDay: 22,
  },
];

/**
 * Nevada 8th District Court Standard Holiday and Vacation Plan Template.
 * 
 * This template is based on the standard court order format used in
 * Clark County, Nevada (Las Vegas area). It provides:
 * 
 * - Standard 6:00 PM exchange time
 * - Alternating odd/even year holiday assignments
 * - Summer vacation selection process (April 1 deadline)
 * - Winter break split configuration
 * - Transportation responsibilities (delivering parent)
 * 
 * Note: This template uses 'every-other-weekend' as the default base pattern,
 * which is common for Nevada court orders. Users can customize the base
 * pattern after applying the template.
 */
export const NEVADA_8TH_DISTRICT_TEMPLATE: CourtTemplate = {
  id: 'nevada-8th-district-standard',
  name: 'Nevada 8th District Court - Standard',
  jurisdiction: 'Nevada 8th District Court (Clark County)',
  version: '1.0.0',
  description: 'Standard holiday and vacation schedule used by the Nevada 8th District Court (Clark County, including Las Vegas). Includes alternating holidays, summer vacation selection, and winter break split.',
  defaultPattern: 'every-other-weekend',
  defaultExchangeTime: '18:00',
  holidays: NEVADA_HOLIDAY_ASSIGNMENTS,
  majorBreaks: NEVADA_MAJOR_BREAKS,
  requiresChildAge: false,
  notes: 'Exchange times are 6:00 PM unless otherwise specified. The delivering parent is responsible for transportation. Holiday periods take precedence over regular custody schedules.',
  sourceDocument: 'docs/examples/2025-11-16-0001.pdf',
  lastUpdated: '2024-11-30',
};
