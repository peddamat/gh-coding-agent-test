/**
 * Court Document Template Engine
 *
 * Generates court-style document content matching the Nevada 8th District Court format.
 * This module transforms app state into structured document sections that can be
 * rendered as HTML or exported as plain text.
 *
 * Reference: Nevada 8th District Court Holiday and Vacation Plan format
 */

import type { AppState, HolidayAssignment, MajorBreakConfig, ParentId } from '../types';
import { NEVADA_8TH_DISTRICT_TEMPLATE } from '../data/templates/nevada-8th-district';
import { getHolidayById } from '../data/holidays';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Table data structure for document tables.
 */
export interface TableData {
  /** Column headers */
  headers: string[];
  /** Table rows, each row is an array of cell values */
  rows: string[][];
}

/**
 * A section in the court document.
 * Each section has a type that determines how it should be rendered.
 */
export interface CourtDocumentSection {
  /** Section type determines rendering style */
  type: 'header' | 'paragraph' | 'table' | 'section-title' | 'footnote';
  /** Section content - string for text sections, TableData for tables */
  content: string | string[] | TableData;
}

/**
 * Complete court document structure.
 */
export interface CourtDocument {
  /** Document title */
  title: string;
  /** Document sections in order */
  sections: CourtDocumentSection[];
  /** Document footnotes */
  footnotes: string[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the fallback name for a parent ID.
 */
function getDefaultParentName(parentId: ParentId): string {
  return parentId === 'parentA' ? 'Parent A' : 'Parent B';
}

/**
 * Get the parent name for a given parent ID.
 */
function getParentName(appState: AppState, parentId: ParentId): string {
  return parentId === 'parentA'
    ? appState.parents.parentA.name || getDefaultParentName(parentId)
    : appState.parents.parentB.name || getDefaultParentName(parentId);
}

/**
 * Get the parent label (Father/Mother) based on relationship or fallback to name.
 */
function getParentLabel(appState: AppState, parentId: ParentId): string {
  const parent = parentId === 'parentA' ? appState.parents.parentA : appState.parents.parentB;
  
  if (parent.relationship === 'dad') return 'Father';
  if (parent.relationship === 'mom') return 'Mother';
  if (parent.relationship === 'guardian') return 'Guardian';
  
  return parent.name || getDefaultParentName(parentId);
}

/**
 * Find which parent is the mother based on relationship configuration.
 * Returns the parent ID if found, or 'parentB' as default (convention).
 */
function getMotherParentId(appState: AppState): ParentId {
  if (appState.parents.parentA.relationship === 'mom') return 'parentA';
  if (appState.parents.parentB.relationship === 'mom') return 'parentB';
  // Default convention: parentB is typically the mother
  return 'parentB';
}

/**
 * Find which parent is the father based on relationship configuration.
 * Returns the parent ID if found, or 'parentA' as default (convention).
 */
function getFatherParentId(appState: AppState): ParentId {
  if (appState.parents.parentA.relationship === 'dad') return 'parentA';
  if (appState.parents.parentB.relationship === 'dad') return 'parentB';
  // Default convention: parentA is typically the father
  return 'parentA';
}

/**
 * Get the odd/even year assignment text for a holiday.
 * Returns [oddYearParent, evenYearParent] labels.
 */
function getYearAssignmentLabels(
  appState: AppState,
  assignment: HolidayAssignment
): [string, string] {
  const parentALabel = getParentLabel(appState, 'parentA');
  const parentBLabel = getParentLabel(appState, 'parentB');

  if (assignment.assignment === 'always-parent-a') {
    return [parentALabel, parentALabel];
  }
  if (assignment.assignment === 'always-parent-b') {
    return [parentBLabel, parentBLabel];
  }
  if (assignment.assignment === 'alternate-odd-even') {
    const oddParent = assignment.oddYearParent === 'parentA' ? parentALabel : parentBLabel;
    const evenParent = assignment.oddYearParent === 'parentA' ? parentBLabel : parentALabel;
    return [oddParent, evenParent];
  }
  // For split-period, selection-priority, etc.
  return ['Split', 'Split'];
}

/**
 * Format exchange time from 24h to 12h format.
 */
function formatExchangeTime(time: string): string {
  if (!time) return '6:00 PM';
  
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get the holiday name from a holiday ID.
 */
function getHolidayName(holidayId: string): string {
  const holiday = getHolidayById(holidayId);
  if (holiday) return holiday.name;
  
  // Fallback for holidays not in the main list
  const nameMap: Record<string, string> = {
    'new-years-day': "New Year's Day",
    'easter': 'Easter Weekend',
    'presidents-day': "Presidents' Day Weekend",
    'spring-break': 'Spring Break',
    'memorial-day': 'Memorial Day Weekend',
    'independence-day': 'Independence Day',
    'labor-day': 'Labor Day Weekend',
    'nevada-day': 'Nevada Day Weekend',
    'thanksgiving': 'Thanksgiving',
    'winter-break': 'Winter Break',
    'mlk-day': 'Martin Luther King Jr. Day Weekend',
    'veterans-day': "Veterans' Day Weekend",
    'mothers-day': "Mother's Day Weekend",
    'fathers-day': "Father's Day Weekend",
    'halloween': 'Halloween',
    'child-birthday': "Child's Birthday",
    'mother-birthday': "Mother's Birthday",
    'father-birthday': "Father's Birthday",
  };
  
  return nameMap[holidayId] || holidayId;
}

// ============================================================================
// Document Section Generators
// ============================================================================

/**
 * Generate the document header section.
 */
function generateDocumentHeader(appState: AppState): CourtDocumentSection[] {
  const parentAName = getParentName(appState, 'parentA');
  const parentBName = getParentName(appState, 'parentB');
  
  return [
    {
      type: 'header',
      content: 'EIGHTH JUDICIAL DISTRICT COURT',
    },
    {
      type: 'header',
      content: 'FAMILY DIVISION',
    },
    {
      type: 'header',
      content: 'CLARK COUNTY, NEVADA',
    },
    {
      type: 'section-title',
      content: 'HOLIDAY AND VACATION PLAN',
    },
    {
      type: 'paragraph',
      content: `In the matter of custody between ${parentAName} and ${parentBName}:`,
    },
  ];
}

/**
 * Generate the three-day weekend holidays table.
 */
function generateThreeDayWeekendTable(appState: AppState): CourtDocumentSection[] {
  const template = NEVADA_8TH_DISTRICT_TEMPLATE;
  
  // Filter holidays to get three-day weekend holidays
  const threeDayHolidayIds = [
    'mlk-day',
    'presidents-day',
    'memorial-day',
    'labor-day',
    'nevada-day',
    'veterans-day',
  ];
  
  const rows: string[][] = [];
  
  for (const holidayId of threeDayHolidayIds) {
    const assignment = template.holidays.find(h => h.holidayId === holidayId);
    if (!assignment || assignment.enabled === false) continue;
    
    const [oddYear, evenYear] = getYearAssignmentLabels(appState, assignment);
    const timing = assignment.timingDescription || 'Friday 6:00 PM through Monday 6:00 PM';
    
    rows.push([
      getHolidayName(holidayId),
      oddYear,
      evenYear,
      timing,
    ]);
  }
  
  return [
    {
      type: 'section-title',
      content: 'THREE-DAY WEEKEND HOLIDAYS',
    },
    {
      type: 'table',
      content: {
        headers: ['Holiday', 'Odd Years', 'Even Years', 'Time'],
        rows,
      },
    },
  ];
}

/**
 * Generate the special holidays table (Easter, Independence Day, Thanksgiving, etc.).
 */
function generateSpecialHolidaysTable(appState: AppState): CourtDocumentSection[] {
  const template = NEVADA_8TH_DISTRICT_TEMPLATE;
  
  const specialHolidayIds = [
    'new-years-day',
    'easter',
    'spring-break',
    'independence-day',
    'halloween',
    'thanksgiving',
  ];
  
  const rows: string[][] = [];
  
  for (const holidayId of specialHolidayIds) {
    const assignment = template.holidays.find(h => h.holidayId === holidayId);
    if (!assignment || assignment.enabled === false) continue;
    
    const [oddYear, evenYear] = getYearAssignmentLabels(appState, assignment);
    const timing = assignment.timingDescription || '';
    
    rows.push([
      getHolidayName(holidayId),
      oddYear,
      evenYear,
      timing,
    ]);
  }
  
  return [
    {
      type: 'section-title',
      content: 'SPECIAL HOLIDAYS',
    },
    {
      type: 'table',
      content: {
        headers: ['Holiday', 'Odd Years', 'Even Years', 'Time'],
        rows,
      },
    },
  ];
}

/**
 * Generate the major breaks section (Summer, Winter).
 */
function generateMajorBreaksSection(appState: AppState): CourtDocumentSection[] {
  const template = NEVADA_8TH_DISTRICT_TEMPLATE;
  const sections: CourtDocumentSection[] = [];
  
  sections.push({
    type: 'section-title',
    content: 'MAJOR BREAKS',
  });
  
  // Winter Break
  const winterBreak = template.majorBreaks.find(b => b.breakId === 'winter-break');
  if (winterBreak) {
    const winterAssignment = template.holidays.find(h => h.holidayId === 'winter-break');
    
    sections.push({
      type: 'paragraph',
      content: [
        'WINTER BREAK:',
        winterBreak.splitDescription || 'Winter Break shall be split between the parents.',
        `The first half (December 23 through December 26 at 12:00 PM) shall alternate by year.`,
        `The second half (December 26 at 12:00 PM through January 2) shall alternate by year, opposite of the first half.`,
        winterAssignment?.timingDescription || '',
      ].filter(Boolean).join(' '),
    });
  }
  
  // Summer Vacation
  const summerVacation = template.majorBreaks.find(b => b.breakId === 'summer-vacation');
  if (summerVacation) {
    const parentALabel = getParentLabel(appState, 'parentA');
    const parentBLabel = getParentLabel(appState, 'parentB');
    
    sections.push({
      type: 'paragraph',
      content: [
        'SUMMER VACATION:',
        `Each parent shall have ${summerVacation.weeksPerParent || 2} weeks of vacation time with the children during the summer.`,
        `The parent with first selection shall alternate each year.`,
        summerVacation.firstPickOddYears === 'parentA'
          ? `${parentALabel} shall have first selection in odd years; ${parentBLabel} shall have first selection in even years.`
          : `${parentBLabel} shall have first selection in odd years; ${parentALabel} shall have first selection in even years.`,
        `Selections must be made by ${summerVacation.selectionDeadline || 'April 1'}.`,
        summerVacation.maxConsecutiveWeeks
          ? `No parent may have more than ${summerVacation.maxConsecutiveWeeks} consecutive weeks.`
          : '',
      ].filter(Boolean).join(' '),
    });
  }
  
  // Spring Break
  const springBreak = template.majorBreaks.find(b => b.breakId === 'spring-break');
  if (springBreak) {
    const springAssignment = template.holidays.find(h => h.holidayId === 'spring-break');
    if (springAssignment) {
      const [oddYear, evenYear] = getYearAssignmentLabels(appState, springAssignment);
      
      sections.push({
        type: 'paragraph',
        content: `SPRING BREAK: ${oddYear} shall have the children during Spring Break in odd years. ${evenYear} shall have the children during Spring Break in even years. Spring Break shall be as determined by the school calendar.`,
      });
    }
  }
  
  return sections;
}

/**
 * Generate the birthdays section.
 */
function generateBirthdaysSection(appState: AppState): CourtDocumentSection[] {
  const template = NEVADA_8TH_DISTRICT_TEMPLATE;
  const sections: CourtDocumentSection[] = [];
  const parentALabel = getParentLabel(appState, 'parentA');
  const parentBLabel = getParentLabel(appState, 'parentB');
  
  // Determine which parent is the mother/father based on relationship configuration
  const motherParentId = getMotherParentId(appState);
  const fatherParentId = getFatherParentId(appState);
  const motherLabel = getParentLabel(appState, motherParentId);
  const fatherLabel = getParentLabel(appState, fatherParentId);
  
  sections.push({
    type: 'section-title',
    content: 'BIRTHDAYS',
  });
  
  const rows: string[][] = [];
  
  // Mother's Day - assigned to the parent who is the mother
  const mothersDay = template.holidays.find(h => h.holidayId === 'mothers-day');
  if (mothersDay && mothersDay.enabled !== false) {
    rows.push([
      "Mother's Day Weekend",
      motherLabel,
      motherLabel,
      mothersDay.timingDescription || 'Saturday 9:00 AM through Sunday 6:00 PM',
    ]);
  }
  
  // Father's Day - assigned to the parent who is the father
  const fathersDay = template.holidays.find(h => h.holidayId === 'fathers-day');
  if (fathersDay && fathersDay.enabled !== false) {
    rows.push([
      "Father's Day Weekend",
      fatherLabel,
      fatherLabel,
      fathersDay.timingDescription || 'Saturday 9:00 AM through Sunday 6:00 PM',
    ]);
  }
  
  // Children's birthdays (from app state if available)
  if (appState.holidays?.birthdays) {
    for (const birthday of appState.holidays.birthdays) {
      if (birthday.type === 'child') {
        const oddYear = birthday.defaultAssignment === 'always-parent-a' ? parentALabel
          : birthday.defaultAssignment === 'always-parent-b' ? parentBLabel
          : 'Alternates';
        const evenYear = birthday.defaultAssignment === 'always-parent-a' ? parentALabel
          : birthday.defaultAssignment === 'always-parent-b' ? parentBLabel
          : 'Alternates';
        
        rows.push([
          birthday.name,
          oddYear,
          evenYear,
          'As scheduled',
        ]);
      }
    }
  }
  
  // Add children's birthday row if none specified
  if (!appState.holidays?.birthdays?.some(b => b.type === 'child')) {
    rows.push([
      "Child's Birthday",
      'Alternates',
      'Alternates',
      'As scheduled',
    ]);
  }
  
  // Parent birthdays - assigned to the parent who is the mother/father
  rows.push([
    "Mother's Birthday",
    motherLabel,
    motherLabel,
    'As scheduled',
  ]);
  
  rows.push([
    "Father's Birthday",
    fatherLabel,
    fatherLabel,
    'As scheduled',
  ]);
  
  sections.push({
    type: 'table',
    content: {
      headers: ['Birthday', 'Odd Years', 'Even Years', 'Time'],
      rows,
    },
  });
  
  return sections;
}

/**
 * Generate transportation and exchange rules section.
 */
function generateTransportationSection(appState: AppState): CourtDocumentSection[] {
  const exchangeTime = formatExchangeTime(appState.config.exchangeTime || '18:00');
  
  return [
    {
      type: 'section-title',
      content: 'TRANSPORTATION AND EXCHANGE',
    },
    {
      type: 'paragraph',
      content: `Unless otherwise specified, all exchanges shall occur at ${exchangeTime}.`,
    },
    {
      type: 'paragraph',
      content: 'The delivering parent shall be responsible for transportation to the exchange location.',
    },
    {
      type: 'paragraph',
      content: 'Holiday periods shall take precedence over the regular custody schedule.',
    },
  ];
}

/**
 * Generate footnotes for special rules.
 */
function generateFootnotes(): string[] {
  return [
    'Independence Day: When July 4 falls on a Tuesday, Wednesday, or Thursday, the holiday period may be extended to include the adjacent weekend at the discretion of the custodial parent for that holiday.',
    "Halloween: The non-custodial parent for Halloween may have reasonable access to the children for trick-or-treating in the other parent's neighborhood.",
    "Winter Break split occurs at 12:00 PM on December 26, with the parent having the children for Christmas delivering the children to the other parent's residence.",
  ];
}

// ============================================================================
// Main Export Functions
// ============================================================================

/**
 * Generate a complete court document from app state.
 *
 * @param appState - The current application state
 * @returns A structured CourtDocument object
 *
 * @example
 * ```typescript
 * const document = generateCourtDocument(appState);
 * const plainText = generatePlainText(document);
 * console.log(plainText);
 * ```
 */
export function generateCourtDocument(appState: AppState): CourtDocument {
  const sections: CourtDocumentSection[] = [
    ...generateDocumentHeader(appState),
    ...generateThreeDayWeekendTable(appState),
    ...generateSpecialHolidaysTable(appState),
    ...generateMajorBreaksSection(appState),
    ...generateBirthdaysSection(appState),
    ...generateTransportationSection(appState),
  ];
  
  const footnotes = generateFootnotes();
  
  return {
    title: 'HOLIDAY AND VACATION PLAN',
    sections,
    footnotes,
  };
}

/**
 * Convert a court document to plain text format.
 *
 * @param document - The court document to convert
 * @returns Plain text representation suitable for copying or exporting
 *
 * @example
 * ```typescript
 * const doc = generateCourtDocument(appState);
 * const text = generatePlainText(doc);
 * // Copy to clipboard or download as .txt
 * ```
 */
export function generatePlainText(document: CourtDocument): string {
  const lines: string[] = [];
  
  for (const section of document.sections) {
    switch (section.type) {
      case 'header':
        lines.push((section.content as string).toUpperCase());
        lines.push('');
        break;
        
      case 'section-title':
        lines.push('');
        lines.push('═'.repeat(60));
        lines.push((section.content as string).toUpperCase());
        lines.push('═'.repeat(60));
        lines.push('');
        break;
        
      case 'paragraph':
        if (Array.isArray(section.content)) {
          lines.push(section.content.join(' '));
        } else {
          lines.push(section.content as string);
        }
        lines.push('');
        break;
        
      case 'table': {
        const table = section.content as TableData;
        const colWidths = table.headers.map((header, i) => {
          const maxRowWidth = Math.max(...table.rows.map(row => (row[i] || '').length));
          return Math.max(header.length, maxRowWidth);
        });
        
        // Header row
        const headerLine = table.headers
          .map((h, i) => h.padEnd(colWidths[i]))
          .join(' | ');
        lines.push(headerLine);
        
        // Separator
        const separator = colWidths.map(w => '-'.repeat(w)).join('-+-');
        lines.push(separator);
        
        // Data rows
        for (const row of table.rows) {
          const rowLine = row
            .map((cell, i) => (cell || '').padEnd(colWidths[i]))
            .join(' | ');
          lines.push(rowLine);
        }
        lines.push('');
        break;
      }
        
      case 'footnote':
        lines.push(`* ${section.content as string}`);
        break;
    }
  }
  
  // Add footnotes
  if (document.footnotes.length > 0) {
    lines.push('');
    lines.push('═'.repeat(60));
    lines.push('NOTES');
    lines.push('═'.repeat(60));
    lines.push('');
    document.footnotes.forEach((note, i) => {
      lines.push(`${i + 1}. ${note}`);
      lines.push('');
    });
  }
  
  return lines.join('\n');
}

/**
 * Get all holiday assignments from the Nevada 8th District template.
 * Useful for displaying holiday tables in the UI.
 */
export function getTemplateHolidayAssignments(): HolidayAssignment[] {
  return NEVADA_8TH_DISTRICT_TEMPLATE.holidays;
}

/**
 * Get all major break configurations from the Nevada 8th District template.
 */
export function getTemplateMajorBreaks(): MajorBreakConfig[] {
  return NEVADA_8TH_DISTRICT_TEMPLATE.majorBreaks;
}
