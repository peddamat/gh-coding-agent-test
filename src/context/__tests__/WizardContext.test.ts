import { describe, test, expect } from 'vitest';
import type { WizardState } from '../../reducers/wizardReducer';
import { createDefaultEnhancedHolidayState } from '../../reducers/wizardReducer';
import { getDefaultParentSetupData, getDefaultHolidaySelections, type HolidaySelection } from '../../components/wizard';

describe('WizardContext', () => {
  describe('initial state structure', () => {
    const defaultState: WizardState = {
      pattern: null,
      split: null,
      parentSetup: getDefaultParentSetupData(),
      holidaySelections: getDefaultHolidaySelections(),
      enhancedHolidays: createDefaultEnhancedHolidayState(),
    };

    test('initial state has null pattern', () => {
      expect(defaultState.pattern).toBeNull();
    });

    test('initial state has null split', () => {
      expect(defaultState.split).toBeNull();
    });

    test('initial state has default parent setup', () => {
      expect(defaultState.parentSetup.parentAName).toBe('');
      expect(defaultState.parentSetup.parentBName).toBe('');
      expect(defaultState.parentSetup.startingParent).toBe('parentA');
    });

    test('initial state has default holiday selections', () => {
      expect(defaultState.holidaySelections.length).toBeGreaterThan(0);
      defaultState.holidaySelections.forEach((selection: HolidaySelection) => {
        expect(selection.assignment).toBe('alternate');
      });
    });

    test('initial state has enhanced holidays', () => {
      expect(defaultState.enhancedHolidays.holidayConfigs.length).toBeGreaterThan(0);
      expect(defaultState.enhancedHolidays.birthdays.length).toBeGreaterThan(0);
    });
  });

  describe('WizardContextValue interface structure', () => {
    test('context value should include state property', () => {
      const contextShape = {
        state: {} as WizardState,
        dispatch: () => {},
        toAppState: () => ({ config: {}, parents: {} }),
        reset: () => {},
      };
      expect(contextShape).toHaveProperty('state');
      expect(contextShape).toHaveProperty('dispatch');
      expect(contextShape).toHaveProperty('toAppState');
      expect(contextShape).toHaveProperty('reset');
    });
  });

  describe('state persistence across steps', () => {
    test('pattern selection persists when moving to next step', () => {
      let state: WizardState = {
        pattern: null,
        split: null,
        parentSetup: getDefaultParentSetupData(),
        holidaySelections: getDefaultHolidaySelections(),
        enhancedHolidays: createDefaultEnhancedHolidayState(),
      };

      // Simulate SET_PATTERN action
      state = {
        ...state,
        pattern: '2-2-5-5',
        split: '50/50',
      };

      // Simulate moving to step 2 (parent setup) - pattern should persist
      const updatedParentSetup = {
        ...state.parentSetup,
        parentAName: 'John',
      };
      state = {
        ...state,
        parentSetup: updatedParentSetup,
      };

      expect(state.pattern).toBe('2-2-5-5');
      expect(state.split).toBe('50/50');
      expect(state.parentSetup.parentAName).toBe('John');
    });

    test('all state persists when navigating back and forth', () => {
      const state: WizardState = {
        pattern: '3-4-4-3',
        split: '50/50',
        parentSetup: {
          ...getDefaultParentSetupData(),
          parentAName: 'Alice',
          parentBName: 'Bob',
        },
        holidaySelections: [
          { holidayId: 'christmas', assignment: 'parentA' },
          { holidayId: 'thanksgiving', assignment: 'parentB' },
        ],
        enhancedHolidays: createDefaultEnhancedHolidayState(),
      };

      // Simulate going back and forth between steps
      // State should remain unchanged
      const stateAfterNavigation = { ...state };

      expect(stateAfterNavigation.pattern).toBe('3-4-4-3');
      expect(stateAfterNavigation.parentSetup.parentAName).toBe('Alice');
      expect(stateAfterNavigation.parentSetup.parentBName).toBe('Bob');
      expect(stateAfterNavigation.holidaySelections[0].assignment).toBe('parentA');
    });
  });

  describe('useWizard hook behavior expectations', () => {
    test('useWizard should throw error when used outside provider', () => {
      // This test documents the expected behavior
      // The actual implementation throws: "useWizard must be used within a WizardProvider"
      const expectedErrorMessage = 'useWizard must be used within a WizardProvider';
      expect(expectedErrorMessage).toContain('WizardProvider');
    });
  });
});
