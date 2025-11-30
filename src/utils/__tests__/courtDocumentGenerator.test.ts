import { describe, test, expect } from 'vitest';
import {
  generateCourtDocument,
  generatePlainText,
  getTemplateHolidayAssignments,
  getTemplateMajorBreaks,
} from '../courtDocumentGenerator';
import type { AppState } from '../../types';

/**
 * Create a minimal valid AppState for testing.
 */
function createTestAppState(overrides?: Partial<AppState>): AppState {
  return {
    config: {
      startDate: '2025-01-01',
      selectedPattern: 'every-other-weekend',
      startingParent: 'parentA',
      exchangeTime: '18:00',
    },
    parents: {
      parentA: {
        name: 'John Smith',
        colorClass: 'bg-blue-500',
        relationship: 'dad',
      },
      parentB: {
        name: 'Jane Smith',
        colorClass: 'bg-pink-500',
        relationship: 'mom',
      },
    },
    familyInfo: {
      children: [
        {
          id: '1',
          name: 'Emma',
          birthdate: '2015-05-15',
          custodyEndAge: 18,
        },
      ],
      planStartDate: '2025-01-01',
    },
    ...overrides,
  };
}

describe('generateCourtDocument', () => {
  test('generates document with correct title', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);

    expect(document.title).toBe('HOLIDAY AND VACATION PLAN');
  });

  test('generates document header sections', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);

    const headerSections = document.sections.filter(s => s.type === 'header');
    expect(headerSections.length).toBeGreaterThanOrEqual(3);

    const headerTexts = headerSections.map(s => s.content as string);
    expect(headerTexts).toContain('EIGHTH JUDICIAL DISTRICT COURT');
    expect(headerTexts).toContain('FAMILY DIVISION');
    expect(headerTexts).toContain('CLARK COUNTY, NEVADA');
  });

  test('includes parent names in document', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);

    expect(plainText).toContain('John Smith');
    expect(plainText).toContain('Jane Smith');
  });

  test('generates section titles for all major sections', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);

    const sectionTitles = document.sections
      .filter(s => s.type === 'section-title')
      .map(s => s.content as string);

    expect(sectionTitles).toContain('HOLIDAY AND VACATION PLAN');
    expect(sectionTitles).toContain('THREE-DAY WEEKEND HOLIDAYS');
    expect(sectionTitles).toContain('SPECIAL HOLIDAYS');
    expect(sectionTitles).toContain('MAJOR BREAKS');
    expect(sectionTitles).toContain('BIRTHDAYS');
    expect(sectionTitles).toContain('TRANSPORTATION AND EXCHANGE');
  });

  test('generates footnotes array', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);

    expect(document.footnotes).toBeInstanceOf(Array);
    expect(document.footnotes.length).toBeGreaterThan(0);
  });

  test('includes Independence Day footnote', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);

    const july4Footnote = document.footnotes.find(f => f.includes('Independence Day'));
    expect(july4Footnote).toBeDefined();
    expect(july4Footnote).toContain('extended');
  });

  test('handles missing parent names gracefully', () => {
    const appState = createTestAppState({
      parents: {
        parentA: { name: '', colorClass: 'bg-blue-500' },
        parentB: { name: '', colorClass: 'bg-pink-500' },
      },
    });
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);

    // Should use fallback names
    expect(plainText).toContain('Parent A');
    expect(plainText).toContain('Parent B');
  });

  test('uses Father/Mother labels when relationship is set', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);

    // Should use relationship-based labels in tables
    expect(plainText).toContain('Father');
    expect(plainText).toContain('Mother');
  });
});

describe('holiday tables', () => {
  test('three-day weekend table has correct headers', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);

    const tableSections = document.sections.filter(s => s.type === 'table');
    expect(tableSections.length).toBeGreaterThan(0);

    const firstTable = tableSections[0].content as { headers: string[]; rows: string[][] };
    expect(firstTable.headers).toContain('Holiday');
    expect(firstTable.headers).toContain('Odd Years');
    expect(firstTable.headers).toContain('Even Years');
    expect(firstTable.headers).toContain('Time');
  });

  test('three-day weekend table includes MLK Day', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);

    const tableSections = document.sections.filter(s => s.type === 'table');
    const firstTable = tableSections[0].content as { headers: string[]; rows: string[][] };
    
    const holidayNames = firstTable.rows.map(row => row[0]);
    expect(holidayNames).toContain('Martin Luther King Jr. Day');
  });

  test('three-day weekend table includes Presidents Day', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);

    const tableSections = document.sections.filter(s => s.type === 'table');
    const firstTable = tableSections[0].content as { headers: string[]; rows: string[][] };
    
    const holidayNames = firstTable.rows.map(row => row[0]);
    expect(holidayNames).toContain("Presidents' Day");
  });

  test('three-day weekend table includes Memorial Day', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);

    const tableSections = document.sections.filter(s => s.type === 'table');
    const firstTable = tableSections[0].content as { headers: string[]; rows: string[][] };
    
    const holidayNames = firstTable.rows.map(row => row[0]);
    expect(holidayNames).toContain('Memorial Day');
  });

  test('three-day weekend table includes Labor Day', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);

    const tableSections = document.sections.filter(s => s.type === 'table');
    const firstTable = tableSections[0].content as { headers: string[]; rows: string[][] };
    
    const holidayNames = firstTable.rows.map(row => row[0]);
    expect(holidayNames).toContain('Labor Day');
  });

  test('special holidays table includes Independence Day', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);

    expect(plainText).toContain('Independence Day');
  });

  test('special holidays table includes Thanksgiving', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);

    expect(plainText).toContain('Thanksgiving');
  });

  test('holiday tables show correct odd/even year assignments', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);

    const tableSections = document.sections.filter(s => s.type === 'table');
    
    for (const tableSection of tableSections) {
      const table = tableSection.content as { headers: string[]; rows: string[][] };
      for (const row of table.rows) {
        const oddYear = row[1];
        const evenYear = row[2];
        
        // Each cell should have a valid parent label or 'Alternates'/'Split'
        expect(oddYear).toBeTruthy();
        expect(evenYear).toBeTruthy();
        expect(['Father', 'Mother', 'Parent A', 'Parent B', 'Alternates', 'Split']).toContain(oddYear);
        expect(['Father', 'Mother', 'Parent A', 'Parent B', 'Alternates', 'Split']).toContain(evenYear);
      }
    }
  });
});

describe('major breaks section', () => {
  test('includes winter break description', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);

    expect(plainText).toContain('WINTER BREAK');
    expect(plainText).toContain('December 23');
    expect(plainText).toContain('December 26');
  });

  test('includes summer vacation rules', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);

    expect(plainText).toContain('SUMMER VACATION');
    expect(plainText).toContain('weeks');
    expect(plainText).toContain('selection');
  });

  test('includes summer vacation selection deadline', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);

    expect(plainText).toContain('April 1');
  });

  test('includes spring break section', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);

    expect(plainText).toContain('SPRING BREAK');
    expect(plainText).toContain('school calendar');
  });
});

describe('birthdays section', () => {
  test("includes Mother's Day", () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);

    expect(plainText).toContain("Mother's Day");
  });

  test("includes Father's Day", () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);

    expect(plainText).toContain("Father's Day");
  });

  test("includes parent's birthday assignments", () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);

    expect(plainText).toContain("Mother's Birthday");
    expect(plainText).toContain("Father's Birthday");
  });

  test("includes child's birthday row", () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);

    expect(plainText).toContain('Birthday');
  });
});

describe('transportation section', () => {
  test('includes default exchange time', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);

    expect(plainText).toContain('6:00 PM');
  });

  test('formats exchange time correctly for different inputs', () => {
    const appState = createTestAppState({
      config: {
        ...createTestAppState().config,
        exchangeTime: '09:30',
      },
    });
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);

    expect(plainText).toContain('9:30 AM');
  });

  test('includes transportation responsibility statement', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);

    expect(plainText).toContain('delivering parent');
    expect(plainText).toContain('transportation');
  });

  test('includes holiday precedence rule', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);

    expect(plainText).toContain('take precedence');
    expect(plainText).toContain('regular custody schedule');
  });
});

describe('generatePlainText', () => {
  test('generates non-empty string', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);

    expect(plainText).toBeTruthy();
    expect(plainText.length).toBeGreaterThan(100);
  });

  test('includes section separators', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);

    // Should have separator lines
    expect(plainText).toContain('═');
  });

  test('includes table formatting', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);

    // Should have table separators
    expect(plainText).toContain(' | ');
    expect(plainText).toContain('-+-');
  });

  test('includes footnotes section', () => {
    const appState = createTestAppState();
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);

    expect(plainText).toContain('NOTES');
    expect(plainText).toContain('1.');
  });

  test('handles empty parent names gracefully', () => {
    const appState = createTestAppState({
      parents: {
        parentA: { name: '', colorClass: 'bg-blue-500' },
        parentB: { name: '', colorClass: 'bg-pink-500' },
      },
    });
    
    // Should not throw
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);
    
    expect(plainText).toBeTruthy();
  });
});

describe('getTemplateHolidayAssignments', () => {
  test('returns array of holiday assignments', () => {
    const assignments = getTemplateHolidayAssignments();

    expect(assignments).toBeInstanceOf(Array);
    expect(assignments.length).toBeGreaterThan(0);
  });

  test('includes all major holidays', () => {
    const assignments = getTemplateHolidayAssignments();
    const holidayIds = assignments.map(a => a.holidayId);

    expect(holidayIds).toContain('presidents-day');
    expect(holidayIds).toContain('memorial-day');
    expect(holidayIds).toContain('independence-day');
    expect(holidayIds).toContain('labor-day');
    expect(holidayIds).toContain('thanksgiving');
    expect(holidayIds).toContain('winter-break');
  });

  test('each assignment has required fields', () => {
    const assignments = getTemplateHolidayAssignments();

    for (const assignment of assignments) {
      expect(assignment.holidayId).toBeTruthy();
      expect(assignment.assignment).toBeTruthy();
      expect(typeof assignment.enabled).toBe('boolean');
    }
  });
});

describe('getTemplateMajorBreaks', () => {
  test('returns array of major break configs', () => {
    const breaks = getTemplateMajorBreaks();

    expect(breaks).toBeInstanceOf(Array);
    expect(breaks.length).toBeGreaterThan(0);
  });

  test('includes summer vacation', () => {
    const breaks = getTemplateMajorBreaks();
    const summer = breaks.find(b => b.breakId === 'summer-vacation');

    expect(summer).toBeDefined();
    expect(summer?.weeksPerParent).toBe(2);
    expect(summer?.selectionDeadline).toBe('April 1');
  });

  test('includes winter break', () => {
    const breaks = getTemplateMajorBreaks();
    const winter = breaks.find(b => b.breakId === 'winter-break');

    expect(winter).toBeDefined();
    expect(winter?.isSplit).toBe(true);
  });

  test('includes spring break', () => {
    const breaks = getTemplateMajorBreaks();
    const spring = breaks.find(b => b.breakId === 'spring-break');

    expect(spring).toBeDefined();
  });
});

describe('edge cases', () => {
  test('handles appState without holidays config', () => {
    const appState = createTestAppState();
    delete appState.holidays;
    
    // Should not throw
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);
    
    expect(plainText).toBeTruthy();
  });

  test('handles empty children array', () => {
    const appState = createTestAppState({
      familyInfo: {
        children: [],
        planStartDate: '2025-01-01',
      },
    });
    
    // Should not throw
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);
    
    expect(plainText).toBeTruthy();
  });

  test('handles guardian relationship type', () => {
    const appState = createTestAppState({
      parents: {
        parentA: { name: 'John Smith', colorClass: 'bg-blue-500', relationship: 'guardian' },
        parentB: { name: 'Jane Smith', colorClass: 'bg-pink-500', relationship: 'mom' },
      },
    });
    
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);
    
    expect(plainText).toContain('Guardian');
    expect(plainText).toContain('Mother');
  });

  test('handles midnight exchange time', () => {
    const appState = createTestAppState({
      config: {
        ...createTestAppState().config,
        exchangeTime: '00:00',
      },
    });
    
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);
    
    expect(plainText).toContain('12:00 AM');
  });

  test('handles noon exchange time', () => {
    const appState = createTestAppState({
      config: {
        ...createTestAppState().config,
        exchangeTime: '12:00',
      },
    });
    
    const document = generateCourtDocument(appState);
    const plainText = generatePlainText(document);
    
    expect(plainText).toContain('12:00 PM');
  });
});
