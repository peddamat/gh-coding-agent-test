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

/**
 * Helper function to create valid ParentSetupData with optional overrides
 */
function createParentSetupData(overrides: Partial<ParentSetupData> = {}): ParentSetupData {
  return {
    parentAName: 'Alice',
    parentBName: 'Bob',
    parentAColor: 'bg-blue-500',
    parentBColor: 'bg-pink-500',
    parentARelationship: 'mom',
    parentBRelationship: 'dad',
    startDate: '2024-01-01',
    startingParent: 'parentA',
    children: [],
    ...overrides,
  };
}

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
      expect(data.parentARelationship).toBe('dad');
      expect(data.parentBRelationship).toBe('mom');
      expect(data.children).toEqual([]);
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
      const data = createParentSetupData({ parentAName: '' });

      const errors = validateParentSetup(data);
      
      expect(errors.parentAName).toBe('Parent A name is required');
      expect(errors.parentBName).toBeUndefined();
    });

    test('validates missing parent B name', () => {
      const data = createParentSetupData({ parentBName: '' });

      const errors = validateParentSetup(data);
      
      expect(errors.parentBName).toBe('Parent B name is required');
      expect(errors.parentAName).toBeUndefined();
    });

    test('validates missing parent A color', () => {
      const data = createParentSetupData({ parentAColor: '' });

      const errors = validateParentSetup(data);
      
      expect(errors.parentAColor).toBe('Please select a color for Parent A');
    });

    test('validates missing parent B color', () => {
      const data = createParentSetupData({ parentBColor: '' });

      const errors = validateParentSetup(data);
      
      expect(errors.parentBColor).toBe('Please select a color for Parent B');
    });

    test('validates missing start date', () => {
      const data = createParentSetupData({ startDate: '' });

      const errors = validateParentSetup(data);
      
      expect(errors.startDate).toBe('Schedule start date is required');
    });

    test('detects color conflict when both parents have same color', () => {
      const data = createParentSetupData({
        parentAColor: 'bg-blue-500',
        parentBColor: 'bg-blue-500',
      });

      const errors = validateParentSetup(data);
      
      expect(errors.colorConflict).toBe('Parents must have different colors');
    });

    test('returns no errors for valid data', () => {
      const data = createParentSetupData();

      const errors = validateParentSetup(data);
      
      expect(Object.keys(errors).length).toBe(0);
    });

    test('trims whitespace when validating names', () => {
      const data = createParentSetupData({
        parentAName: '   ',
        parentBName: '   ',
      });

      const errors = validateParentSetup(data);
      
      expect(errors.parentAName).toBe('Parent A name is required');
      expect(errors.parentBName).toBe('Parent B name is required');
    });
  });

  describe('isParentSetupValid', () => {
    test('returns false when data is invalid', () => {
      const data = createParentSetupData({
        parentAName: '',
        parentBName: '',
        parentAColor: '',
        parentBColor: '',
        startDate: '',
      });

      expect(isParentSetupValid(data)).toBe(false);
    });

    test('returns true when data is valid', () => {
      const data = createParentSetupData();

      expect(isParentSetupValid(data)).toBe(true);
    });

    test('returns false when parents have same color', () => {
      const data = createParentSetupData({
        parentAColor: 'bg-blue-500',
        parentBColor: 'bg-blue-500',
      });

      expect(isParentSetupValid(data)).toBe(false);
    });
  });

  describe('ParentSetupData types', () => {
    test('startingParent can be parentA or parentB', () => {
      const dataA = createParentSetupData({ startingParent: 'parentA' });
      const dataB = createParentSetupData({ startingParent: 'parentB' });

      expect(dataA.startingParent).toBe('parentA');
      expect(dataB.startingParent).toBe('parentB');
    });
  });

  describe('toAppStateFormat', () => {
    test('transforms ParentSetupData to AppState format', () => {
      const data = createParentSetupData({
        children: [
          { id: '1', name: 'Child 1', birthdate: '2020-01-01', custodyEndAge: 18 },
        ],
      });

      const result = toAppStateFormat(data);

      expect(result.parents.parentA.name).toBe('Alice');
      expect(result.parents.parentA.colorClass).toBe('bg-blue-500');
      expect(result.parents.parentA.relationship).toBe('mom');
      expect(result.parents.parentB.name).toBe('Bob');
      expect(result.parents.parentB.colorClass).toBe('bg-pink-500');
      expect(result.parents.parentB.relationship).toBe('dad');
      expect(result.config.startDate).toBe('2024-01-01');
      expect(result.config.startingParent).toBe('parentA');
      expect(result.familyInfo.children).toHaveLength(1);
      expect(result.familyInfo.planStartDate).toBe('2024-01-01');
    });
  });

  describe('fromAppStateFormat', () => {
    test('transforms AppState format to ParentSetupData', () => {
      const parents = {
        parentA: { name: 'Alice', colorClass: 'bg-blue-500', relationship: 'mom' as const },
        parentB: { name: 'Bob', colorClass: 'bg-pink-500', relationship: 'dad' as const },
      };
      const config = {
        startDate: '2024-01-01',
        startingParent: 'parentA' as const,
      };
      const familyInfo = {
        children: [{ id: '1', name: 'Child 1', birthdate: '2020-01-01', custodyEndAge: 18 }],
        planStartDate: '2024-01-01',
      };

      const result = fromAppStateFormat(parents, config, familyInfo);

      expect(result.parentAName).toBe('Alice');
      expect(result.parentBName).toBe('Bob');
      expect(result.parentAColor).toBe('bg-blue-500');
      expect(result.parentBColor).toBe('bg-pink-500');
      expect(result.parentARelationship).toBe('mom');
      expect(result.parentBRelationship).toBe('dad');
      expect(result.startDate).toBe('2024-01-01');
      expect(result.startingParent).toBe('parentA');
      expect(result.children).toHaveLength(1);
    });

    test('uses defaults when relationship is not provided', () => {
      const parents = {
        parentA: { name: 'Alice', colorClass: 'bg-blue-500' },
        parentB: { name: 'Bob', colorClass: 'bg-pink-500' },
      };
      const config = {
        startDate: '2024-01-01',
        startingParent: 'parentA' as const,
      };

      const result = fromAppStateFormat(parents, config);

      expect(result.parentARelationship).toBe('dad');
      expect(result.parentBRelationship).toBe('mom');
      expect(result.children).toEqual([]);
    });

    test('round-trip transformation preserves data', () => {
      const original = createParentSetupData({
        parentAName: 'Sarah',
        parentBName: 'John',
        parentAColor: 'bg-green-500',
        parentBColor: 'bg-purple-500',
        parentARelationship: 'guardian',
        parentBRelationship: 'other',
        startDate: '2024-06-15',
        startingParent: 'parentB',
        children: [{ id: '1', name: 'Child 1', birthdate: '2020-01-01', custodyEndAge: 18 }],
      });

      const appState = toAppStateFormat(original);
      const result = fromAppStateFormat(appState.parents, appState.config, appState.familyInfo);

      expect(result).toEqual(original);
    });
  });
});
