import { describe, test, expect } from 'vitest';
import { 
  HOLIDAYS, 
  getDefaultHolidaySelections, 
  getConfiguredHolidayCount,
  type HolidaySelection,
  type HolidayAssignment,
} from '../holidaySelectorUtils';

describe('HolidaySelector', () => {
  describe('HOLIDAYS constant', () => {
    test('contains all major US holidays', () => {
      const holidayIds = HOLIDAYS.map((h) => h.id);
      
      expect(holidayIds).toContain('thanksgiving');
      expect(holidayIds).toContain('christmas');
      expect(holidayIds).toContain('newyear');
      expect(holidayIds).toContain('july4');
      expect(holidayIds).toContain('memorial');
      expect(holidayIds).toContain('labor');
    });

    test('has 6 holidays', () => {
      expect(HOLIDAYS.length).toBe(6);
    });

    test('each holiday has id, name, and date', () => {
      for (const holiday of HOLIDAYS) {
        expect(typeof holiday.id).toBe('string');
        expect(holiday.id.length).toBeGreaterThan(0);
        expect(typeof holiday.name).toBe('string');
        expect(holiday.name.length).toBeGreaterThan(0);
        expect(typeof holiday.date).toBe('string');
        expect(holiday.date.length).toBeGreaterThan(0);
      }
    });

    test('fixed date holidays have proper MM-DD format', () => {
      const christmas = HOLIDAYS.find((h) => h.id === 'christmas');
      const newyear = HOLIDAYS.find((h) => h.id === 'newyear');
      const july4 = HOLIDAYS.find((h) => h.id === 'july4');

      expect(christmas?.date).toBe('12-25');
      expect(newyear?.date).toBe('01-01');
      expect(july4?.date).toBe('07-04');
    });

    test('dynamic date holidays have descriptive format', () => {
      const thanksgiving = HOLIDAYS.find((h) => h.id === 'thanksgiving');
      const memorial = HOLIDAYS.find((h) => h.id === 'memorial');
      const labor = HOLIDAYS.find((h) => h.id === 'labor');

      expect(thanksgiving?.date).toBe('fourth-thursday-november');
      expect(memorial?.date).toBe('last-monday-may');
      expect(labor?.date).toBe('first-monday-september');
    });
  });

  describe('getDefaultHolidaySelections', () => {
    test('returns selections for all holidays', () => {
      const selections = getDefaultHolidaySelections();
      
      expect(selections.length).toBe(HOLIDAYS.length);
    });

    test('all selections default to alternate', () => {
      const selections = getDefaultHolidaySelections();
      
      for (const selection of selections) {
        expect(selection.assignment).toBe('alternate');
      }
    });

    test('selections have corresponding holiday IDs', () => {
      const selections = getDefaultHolidaySelections();
      const holidayIds = HOLIDAYS.map((h) => h.id);
      const selectionIds = selections.map((s) => s.holidayId);
      
      expect(selectionIds).toEqual(holidayIds);
    });
  });

  describe('getConfiguredHolidayCount', () => {
    test('returns 0 when all selections are alternate', () => {
      const selections = getDefaultHolidaySelections();
      
      expect(getConfiguredHolidayCount(selections)).toBe(0);
    });

    test('counts parentA selections', () => {
      const selections: HolidaySelection[] = [
        { holidayId: 'thanksgiving', assignment: 'parentA' },
        { holidayId: 'christmas', assignment: 'alternate' },
        { holidayId: 'newyear', assignment: 'alternate' },
      ];
      
      expect(getConfiguredHolidayCount(selections)).toBe(1);
    });

    test('counts parentB selections', () => {
      const selections: HolidaySelection[] = [
        { holidayId: 'thanksgiving', assignment: 'parentB' },
        { holidayId: 'christmas', assignment: 'parentB' },
        { holidayId: 'newyear', assignment: 'alternate' },
      ];
      
      expect(getConfiguredHolidayCount(selections)).toBe(2);
    });

    test('counts both parentA and parentB selections', () => {
      const selections: HolidaySelection[] = [
        { holidayId: 'thanksgiving', assignment: 'parentA' },
        { holidayId: 'christmas', assignment: 'parentB' },
        { holidayId: 'newyear', assignment: 'parentA' },
        { holidayId: 'july4', assignment: 'alternate' },
        { holidayId: 'memorial', assignment: 'parentB' },
        { holidayId: 'labor', assignment: 'alternate' },
      ];
      
      expect(getConfiguredHolidayCount(selections)).toBe(4);
    });

    test('returns 0 for empty array', () => {
      expect(getConfiguredHolidayCount([])).toBe(0);
    });
  });

  describe('HolidayAssignment type', () => {
    test('accepts parentA', () => {
      const assignment: HolidayAssignment = 'parentA';
      expect(assignment).toBe('parentA');
    });

    test('accepts parentB', () => {
      const assignment: HolidayAssignment = 'parentB';
      expect(assignment).toBe('parentB');
    });

    test('accepts alternate', () => {
      const assignment: HolidayAssignment = 'alternate';
      expect(assignment).toBe('alternate');
    });
  });

  describe('HolidaySelection interactions', () => {
    test('updating a selection creates correct new state', () => {
      const selections = getDefaultHolidaySelections();
      
      // Simulate selecting parentA for thanksgiving
      const newSelections = selections.map((selection) =>
        selection.holidayId === 'thanksgiving' 
          ? { ...selection, assignment: 'parentA' as HolidayAssignment } 
          : selection
      );
      
      const thanksgivingSelection = newSelections.find(
        (s) => s.holidayId === 'thanksgiving'
      );
      expect(thanksgivingSelection?.assignment).toBe('parentA');
      
      // Other selections should remain unchanged
      const christmasSelection = newSelections.find(
        (s) => s.holidayId === 'christmas'
      );
      expect(christmasSelection?.assignment).toBe('alternate');
    });

    test('multiple updates preserve state correctly', () => {
      let selections = getDefaultHolidaySelections();
      
      // Update thanksgiving to parentA
      selections = selections.map((s) =>
        s.holidayId === 'thanksgiving' 
          ? { ...s, assignment: 'parentA' as HolidayAssignment } 
          : s
      );
      
      // Update christmas to parentB
      selections = selections.map((s) =>
        s.holidayId === 'christmas' 
          ? { ...s, assignment: 'parentB' as HolidayAssignment } 
          : s
      );
      
      // Update thanksgiving to parentB (change)
      selections = selections.map((s) =>
        s.holidayId === 'thanksgiving' 
          ? { ...s, assignment: 'parentB' as HolidayAssignment } 
          : s
      );
      
      expect(getConfiguredHolidayCount(selections)).toBe(2);
      
      const thanksgiving = selections.find((s) => s.holidayId === 'thanksgiving');
      expect(thanksgiving?.assignment).toBe('parentB');
      
      const christmas = selections.find((s) => s.holidayId === 'christmas');
      expect(christmas?.assignment).toBe('parentB');
    });
  });
});
