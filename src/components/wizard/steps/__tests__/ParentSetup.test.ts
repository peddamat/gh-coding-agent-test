import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  validateParentSetup, 
  isParentSetupValid, 
  getDefaultParentSetupData,
  toAppStateFormat,
  fromAppStateFormat,
  type ParentSetupData 
} from '../parentSetupUtils';
import { COLOR_OPTIONS } from '../../../shared/colorOptions';

describe('ParentSetup', () => {
  describe('getDefaultParentSetupData', () => {
    beforeEach(() => {
      // Mock Date to avoid flaky tests at midnight
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('returns data with default values', () => {
      const data = getDefaultParentSetupData();
      
      expect(data.parentAName).toBe('');
      expect(data.parentBName).toBe('');
      expect(data.parentAColor).toBe(COLOR_OPTIONS[0].value);
      expect(data.parentBColor).toBe(COLOR_OPTIONS[1].value);
      expect(data.startingParent).toBe('parentA');
    });

    test('returns today\'s date as start date', () => {
      const data = getDefaultParentSetupData();
      
      expect(data.startDate).toBe('2024-01-15');
    });

    test('returns different colors for parents', () => {
      const data = getDefaultParentSetupData();
      
      expect(data.parentAColor).not.toBe(data.parentBColor);
    });
  });

  describe('validateParentSetup', () => {
    test('validates missing parent A name', () => {
      const data: ParentSetupData = {
        parentAName: '',
        parentBName: 'Bob',
        parentAColor: 'bg-blue-500',
        parentBColor: 'bg-pink-500',
        startDate: '2024-01-01',
        startingParent: 'parentA',
      };

      const errors = validateParentSetup(data);
      
      expect(errors.parentAName).toBe('Parent A name is required');
      expect(errors.parentBName).toBeUndefined();
    });

    test('validates missing parent B name', () => {
      const data: ParentSetupData = {
        parentAName: 'Alice',
        parentBName: '',
        parentAColor: 'bg-blue-500',
        parentBColor: 'bg-pink-500',
        startDate: '2024-01-01',
        startingParent: 'parentA',
      };

      const errors = validateParentSetup(data);
      
      expect(errors.parentBName).toBe('Parent B name is required');
      expect(errors.parentAName).toBeUndefined();
    });

    test('validates missing parent A color', () => {
      const data: ParentSetupData = {
        parentAName: 'Alice',
        parentBName: 'Bob',
        parentAColor: '',
        parentBColor: 'bg-pink-500',
        startDate: '2024-01-01',
        startingParent: 'parentA',
      };

      const errors = validateParentSetup(data);
      
      expect(errors.parentAColor).toBe('Please select a color for Parent A');
    });

    test('validates missing parent B color', () => {
      const data: ParentSetupData = {
        parentAName: 'Alice',
        parentBName: 'Bob',
        parentAColor: 'bg-blue-500',
        parentBColor: '',
        startDate: '2024-01-01',
        startingParent: 'parentA',
      };

      const errors = validateParentSetup(data);
      
      expect(errors.parentBColor).toBe('Please select a color for Parent B');
    });

    test('validates missing start date', () => {
      const data: ParentSetupData = {
        parentAName: 'Alice',
        parentBName: 'Bob',
        parentAColor: 'bg-blue-500',
        parentBColor: 'bg-pink-500',
        startDate: '',
        startingParent: 'parentA',
      };

      const errors = validateParentSetup(data);
      
      expect(errors.startDate).toBe('Schedule start date is required');
    });

    test('detects color conflict when both parents have same color', () => {
      const data: ParentSetupData = {
        parentAName: 'Alice',
        parentBName: 'Bob',
        parentAColor: 'bg-blue-500',
        parentBColor: 'bg-blue-500',
        startDate: '2024-01-01',
        startingParent: 'parentA',
      };

      const errors = validateParentSetup(data);
      
      expect(errors.colorConflict).toBe('Parents must have different colors');
    });

    test('returns no errors for valid data', () => {
      const data: ParentSetupData = {
        parentAName: 'Alice',
        parentBName: 'Bob',
        parentAColor: 'bg-blue-500',
        parentBColor: 'bg-pink-500',
        startDate: '2024-01-01',
        startingParent: 'parentA',
      };

      const errors = validateParentSetup(data);
      
      expect(Object.keys(errors).length).toBe(0);
    });

    test('trims whitespace when validating names', () => {
      const data: ParentSetupData = {
        parentAName: '   ',
        parentBName: '   ',
        parentAColor: 'bg-blue-500',
        parentBColor: 'bg-pink-500',
        startDate: '2024-01-01',
        startingParent: 'parentA',
      };

      const errors = validateParentSetup(data);
      
      expect(errors.parentAName).toBe('Parent A name is required');
      expect(errors.parentBName).toBe('Parent B name is required');
    });
  });

  describe('isParentSetupValid', () => {
    test('returns false when data is invalid', () => {
      const data: ParentSetupData = {
        parentAName: '',
        parentBName: '',
        parentAColor: '',
        parentBColor: '',
        startDate: '',
        startingParent: 'parentA',
      };

      expect(isParentSetupValid(data)).toBe(false);
    });

    test('returns true when data is valid', () => {
      const data: ParentSetupData = {
        parentAName: 'Alice',
        parentBName: 'Bob',
        parentAColor: 'bg-blue-500',
        parentBColor: 'bg-pink-500',
        startDate: '2024-01-01',
        startingParent: 'parentA',
      };

      expect(isParentSetupValid(data)).toBe(true);
    });

    test('returns false when parents have same color', () => {
      const data: ParentSetupData = {
        parentAName: 'Alice',
        parentBName: 'Bob',
        parentAColor: 'bg-blue-500',
        parentBColor: 'bg-blue-500',
        startDate: '2024-01-01',
        startingParent: 'parentA',
      };

      expect(isParentSetupValid(data)).toBe(false);
    });
  });

  describe('ParentSetupData types', () => {
    test('startingParent can be parentA or parentB', () => {
      const dataA: ParentSetupData = {
        parentAName: 'Alice',
        parentBName: 'Bob',
        parentAColor: 'bg-blue-500',
        parentBColor: 'bg-pink-500',
        startDate: '2024-01-01',
        startingParent: 'parentA',
      };

      const dataB: ParentSetupData = {
        ...dataA,
        startingParent: 'parentB',
      };

      expect(dataA.startingParent).toBe('parentA');
      expect(dataB.startingParent).toBe('parentB');
    });
  });

  describe('toAppStateFormat', () => {
    test('transforms ParentSetupData to AppState format', () => {
      const data: ParentSetupData = {
        parentAName: 'Alice',
        parentBName: 'Bob',
        parentAColor: 'bg-blue-500',
        parentBColor: 'bg-pink-500',
        startDate: '2024-01-01',
        startingParent: 'parentA',
      };

      const result = toAppStateFormat(data);

      expect(result.parents.parentA.name).toBe('Alice');
      expect(result.parents.parentA.colorClass).toBe('bg-blue-500');
      expect(result.parents.parentB.name).toBe('Bob');
      expect(result.parents.parentB.colorClass).toBe('bg-pink-500');
      expect(result.config.startDate).toBe('2024-01-01');
      expect(result.config.startingParent).toBe('parentA');
    });
  });

  describe('fromAppStateFormat', () => {
    test('transforms AppState format to ParentSetupData', () => {
      const parents = {
        parentA: { name: 'Alice', colorClass: 'bg-blue-500' },
        parentB: { name: 'Bob', colorClass: 'bg-pink-500' },
      };
      const config = {
        startDate: '2024-01-01',
        startingParent: 'parentA' as const,
      };

      const result = fromAppStateFormat(parents, config);

      expect(result.parentAName).toBe('Alice');
      expect(result.parentBName).toBe('Bob');
      expect(result.parentAColor).toBe('bg-blue-500');
      expect(result.parentBColor).toBe('bg-pink-500');
      expect(result.startDate).toBe('2024-01-01');
      expect(result.startingParent).toBe('parentA');
    });

    test('round-trip transformation preserves data', () => {
      const original: ParentSetupData = {
        parentAName: 'Sarah',
        parentBName: 'John',
        parentAColor: 'bg-green-500',
        parentBColor: 'bg-purple-500',
        startDate: '2024-06-15',
        startingParent: 'parentB',
      };

      const appState = toAppStateFormat(original);
      const result = fromAppStateFormat(appState.parents, appState.config);

      expect(result).toEqual(original);
    });
  });
});
