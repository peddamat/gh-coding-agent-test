import { describe, test, expect } from 'vitest';
import { 
  validateParentSetup, 
  isParentSetupValid, 
  getDefaultParentSetupData,
  type ParentSetupData 
} from '../parentSetupUtils';
import { COLOR_OPTIONS } from '../../../shared/colorOptions';

describe('ParentSetup', () => {
  describe('getDefaultParentSetupData', () => {
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
      const today = new Date().toISOString().split('T')[0];
      
      expect(data.startDate).toBe(today);
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
});
