import { describe, test, expect } from 'vitest';
import { wizardReducer, convertWizardToAppState, type WizardState, type WizardAction } from '../wizardReducer';
import { getDefaultParentSetupData, getDefaultHolidaySelections } from '../../components/wizard';

describe('wizardReducer', () => {
  const initialState: WizardState = {
    pattern: null,
    split: null,
    parentSetup: getDefaultParentSetupData(),
    holidaySelections: getDefaultHolidaySelections(),
  };

  describe('SET_PATTERN action', () => {
    test('sets pattern and split correctly', () => {
      const action: WizardAction = {
        type: 'SET_PATTERN',
        payload: { pattern: '2-2-5-5', split: '50/50' },
      };
      const newState = wizardReducer(initialState, action);

      expect(newState.pattern).toBe('2-2-5-5');
      expect(newState.split).toBe('50/50');
    });

    test('preserves other state when setting pattern', () => {
      const stateWithParents: WizardState = {
        ...initialState,
        parentSetup: {
          ...initialState.parentSetup,
          parentAName: 'John',
          parentBName: 'Jane',
        },
      };
      const action: WizardAction = {
        type: 'SET_PATTERN',
        payload: { pattern: 'alt-weeks', split: '50/50' },
      };
      const newState = wizardReducer(stateWithParents, action);

      expect(newState.parentSetup.parentAName).toBe('John');
      expect(newState.parentSetup.parentBName).toBe('Jane');
    });

    test('handles all valid pattern types', () => {
      const patterns: Array<{ pattern: WizardState['pattern']; split: WizardState['split'] }> = [
        { pattern: 'alt-weeks', split: '50/50' },
        { pattern: '2-2-3', split: '50/50' },
        { pattern: '2-2-5-5', split: '50/50' },
        { pattern: '3-4-4-3', split: '50/50' },
        { pattern: 'every-weekend', split: '60/40' },
        { pattern: 'every-other-weekend', split: '80/20' },
        { pattern: 'same-weekends-monthly', split: '80/20' },
        { pattern: 'all-to-one', split: '100/0' },
        { pattern: 'custom', split: 'Custom' },
      ];

      patterns.forEach(({ pattern, split }) => {
        const action: WizardAction = { type: 'SET_PATTERN', payload: { pattern: pattern!, split: split! } };
        const newState = wizardReducer(initialState, action);
        expect(newState.pattern).toBe(pattern);
        expect(newState.split).toBe(split);
      });
    });
  });

  describe('SET_PARENTS action', () => {
    test('sets parent setup data correctly', () => {
      const parentSetup = {
        ...initialState.parentSetup,
        parentAName: 'Alice',
        parentBName: 'Bob',
        parentAColor: 'bg-red-500',
        parentBColor: 'bg-green-500',
        startDate: '2025-01-01',
        startingParent: 'parentB' as const,
      };
      const action: WizardAction = { type: 'SET_PARENTS', payload: parentSetup };
      const newState = wizardReducer(initialState, action);

      expect(newState.parentSetup.parentAName).toBe('Alice');
      expect(newState.parentSetup.parentBName).toBe('Bob');
      expect(newState.parentSetup.parentAColor).toBe('bg-red-500');
      expect(newState.parentSetup.parentBColor).toBe('bg-green-500');
      expect(newState.parentSetup.startDate).toBe('2025-01-01');
      expect(newState.parentSetup.startingParent).toBe('parentB');
    });

    test('preserves pattern when setting parents', () => {
      const stateWithPattern: WizardState = {
        ...initialState,
        pattern: '2-2-5-5',
        split: '50/50',
      };
      const action: WizardAction = {
        type: 'SET_PARENTS',
        payload: { ...initialState.parentSetup, parentAName: 'Test' },
      };
      const newState = wizardReducer(stateWithPattern, action);

      expect(newState.pattern).toBe('2-2-5-5');
      expect(newState.split).toBe('50/50');
    });
  });

  describe('SET_HOLIDAYS action', () => {
    test('sets holiday selections correctly', () => {
      const holidaySelections = [
        { holidayId: 'thanksgiving', assignment: 'parentA' as const },
        { holidayId: 'christmas', assignment: 'parentB' as const },
        { holidayId: 'newyear', assignment: 'alternate' as const },
      ];
      const action: WizardAction = { type: 'SET_HOLIDAYS', payload: holidaySelections };
      const newState = wizardReducer(initialState, action);

      expect(newState.holidaySelections).toHaveLength(3);
      expect(newState.holidaySelections[0]).toEqual({ holidayId: 'thanksgiving', assignment: 'parentA' });
      expect(newState.holidaySelections[1]).toEqual({ holidayId: 'christmas', assignment: 'parentB' });
    });

    test('preserves pattern and parents when setting holidays', () => {
      const stateWithData: WizardState = {
        ...initialState,
        pattern: 'alt-weeks',
        split: '50/50',
        parentSetup: { ...initialState.parentSetup, parentAName: 'Test' },
      };
      const action: WizardAction = {
        type: 'SET_HOLIDAYS',
        payload: [{ holidayId: 'christmas', assignment: 'parentA' }],
      };
      const newState = wizardReducer(stateWithData, action);

      expect(newState.pattern).toBe('alt-weeks');
      expect(newState.parentSetup.parentAName).toBe('Test');
    });
  });

  describe('RESET action', () => {
    test('resets state to provided initial state', () => {
      const modifiedState: WizardState = {
        pattern: '2-2-5-5',
        split: '50/50',
        parentSetup: {
          ...initialState.parentSetup,
          parentAName: 'Modified',
        },
        holidaySelections: [{ holidayId: 'christmas', assignment: 'parentA' }],
      };
      const action: WizardAction = { type: 'RESET', payload: initialState };
      const newState = wizardReducer(modifiedState, action);

      expect(newState.pattern).toBeNull();
      expect(newState.split).toBeNull();
      expect(newState.parentSetup.parentAName).toBe('');
    });
  });

  describe('unknown action', () => {
    test('returns current state for unknown action', () => {
      const unknownAction = { type: 'UNKNOWN_ACTION' } as unknown as WizardAction;
      const newState = wizardReducer(initialState, unknownAction);
      expect(newState).toBe(initialState);
    });
  });
});

describe('convertWizardToAppState', () => {
  test('converts wizard state to AppState format', () => {
    const wizardState: WizardState = {
      pattern: '2-2-5-5',
      split: '50/50',
      parentSetup: {
        parentAName: 'John',
        parentBName: 'Jane',
        parentAColor: 'bg-blue-500',
        parentBColor: 'bg-pink-500',
        startDate: '2025-01-15',
        startingParent: 'parentA',
      },
      holidaySelections: getDefaultHolidaySelections(),
    };

    const appState = convertWizardToAppState(wizardState);

    expect(appState.config.selectedPattern).toBe('2-2-5-5');
    expect(appState.config.startDate).toBe('2025-01-15');
    expect(appState.config.startingParent).toBe('parentA');
    expect(appState.config.exchangeTime).toBe('15:00');
    expect(appState.parents.parentA.name).toBe('John');
    expect(appState.parents.parentA.colorClass).toBe('bg-blue-500');
    expect(appState.parents.parentB.name).toBe('Jane');
    expect(appState.parents.parentB.colorClass).toBe('bg-pink-500');
  });

  test('uses default pattern when pattern is null', () => {
    const wizardState: WizardState = {
      pattern: null,
      split: null,
      parentSetup: getDefaultParentSetupData(),
      holidaySelections: getDefaultHolidaySelections(),
    };

    const appState = convertWizardToAppState(wizardState);

    expect(appState.config.selectedPattern).toBe('alt-weeks');
  });

  test('uses default parent names when names are empty', () => {
    const wizardState: WizardState = {
      pattern: 'alt-weeks',
      split: '50/50',
      parentSetup: {
        parentAName: '',
        parentBName: '',
        parentAColor: 'bg-blue-500',
        parentBColor: 'bg-pink-500',
        startDate: '2025-01-01',
        startingParent: 'parentA',
      },
      holidaySelections: getDefaultHolidaySelections(),
    };

    const appState = convertWizardToAppState(wizardState);

    expect(appState.parents.parentA.name).toBe('Parent A');
    expect(appState.parents.parentB.name).toBe('Parent B');
  });

  test('preserves startingParent correctly', () => {
    const wizardState: WizardState = {
      pattern: '2-2-3',
      split: '50/50',
      parentSetup: {
        parentAName: 'Test',
        parentBName: 'Test2',
        parentAColor: 'bg-blue-500',
        parentBColor: 'bg-pink-500',
        startDate: '2025-01-01',
        startingParent: 'parentB',
      },
      holidaySelections: getDefaultHolidaySelections(),
    };

    const appState = convertWizardToAppState(wizardState);

    expect(appState.config.startingParent).toBe('parentB');
  });
});
