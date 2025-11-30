import { describe, test, expect } from 'vitest';
import { wizardReducer, convertWizardToAppState, createDefaultEnhancedHolidayState, type WizardState, type WizardAction } from '../wizardReducer';
import { getDefaultParentSetupData, getDefaultHolidaySelections } from '../../components/wizard';
import { NEVADA_8TH_DISTRICT_TEMPLATE } from '../../data/templates/nevada-8th-district';

describe('wizardReducer', () => {
  const initialState: WizardState = {
    selectedTemplate: null,
    isBuildYourOwn: false,
    pattern: null,
    split: null,
    parentSetup: getDefaultParentSetupData(),
    holidaySelections: getDefaultHolidaySelections(),
    enhancedHolidays: createDefaultEnhancedHolidayState(),
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
        selectedTemplate: null,
        isBuildYourOwn: true,
        pattern: '2-2-5-5',
        split: '50/50',
        parentSetup: {
          ...initialState.parentSetup,
          parentAName: 'Modified',
        },
        holidaySelections: [{ holidayId: 'christmas', assignment: 'parentA' }],
        enhancedHolidays: createDefaultEnhancedHolidayState(),
      };
      const action: WizardAction = { type: 'RESET', payload: initialState };
      const newState = wizardReducer(modifiedState, action);

      expect(newState.pattern).toBeNull();
      expect(newState.split).toBeNull();
      expect(newState.parentSetup.parentAName).toBe('');
    });
  });

  describe('SET_TEMPLATE action', () => {
    test('applies template and sets pattern', () => {
      const action: WizardAction = { type: 'SET_TEMPLATE', payload: NEVADA_8TH_DISTRICT_TEMPLATE };
      const newState = wizardReducer(initialState, action);

      expect(newState.selectedTemplate).toBe(NEVADA_8TH_DISTRICT_TEMPLATE);
      expect(newState.isBuildYourOwn).toBe(false);
      expect(newState.pattern).toBe('every-other-weekend');
      expect(newState.split).toBe('80/20');
    });

    test('applies template holiday configurations', () => {
      const action: WizardAction = { type: 'SET_TEMPLATE', payload: NEVADA_8TH_DISTRICT_TEMPLATE };
      const newState = wizardReducer(initialState, action);

      // Check that holiday configs were updated
      expect(newState.enhancedHolidays.holidayConfigs.length).toBeGreaterThan(0);
    });
  });

  describe('SET_BUILD_YOUR_OWN action', () => {
    test('clears template and sets build your own flag', () => {
      // First apply a template
      const stateWithTemplate: WizardState = {
        ...initialState,
        selectedTemplate: NEVADA_8TH_DISTRICT_TEMPLATE,
        isBuildYourOwn: false,
      };
      
      const action: WizardAction = { type: 'SET_BUILD_YOUR_OWN' };
      const newState = wizardReducer(stateWithTemplate, action);

      expect(newState.selectedTemplate).toBeNull();
      expect(newState.isBuildYourOwn).toBe(true);
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
      selectedTemplate: null,
      isBuildYourOwn: true,
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
      enhancedHolidays: createDefaultEnhancedHolidayState(),
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
      selectedTemplate: null,
      isBuildYourOwn: false,
      pattern: null,
      split: null,
      parentSetup: getDefaultParentSetupData(),
      holidaySelections: getDefaultHolidaySelections(),
      enhancedHolidays: createDefaultEnhancedHolidayState(),
    };

    const appState = convertWizardToAppState(wizardState);

    expect(appState.config.selectedPattern).toBe('alt-weeks');
  });

  test('uses default parent names when names are empty', () => {
    const wizardState: WizardState = {
      selectedTemplate: null,
      isBuildYourOwn: true,
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
      enhancedHolidays: createDefaultEnhancedHolidayState(),
    };

    const appState = convertWizardToAppState(wizardState);

    expect(appState.parents.parentA.name).toBe('Parent A');
    expect(appState.parents.parentB.name).toBe('Parent B');
  });

  test('preserves startingParent correctly', () => {
    const wizardState: WizardState = {
      selectedTemplate: null,
      isBuildYourOwn: true,
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
      enhancedHolidays: createDefaultEnhancedHolidayState(),
    };

    const appState = convertWizardToAppState(wizardState);

    expect(appState.config.startingParent).toBe('parentB');
  });
});
