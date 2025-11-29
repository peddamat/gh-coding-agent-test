import type { PatternType, ParentId, AppState } from '../types';
import type { SplitType } from '../data/patterns';
import type { ParentSetupData, HolidaySelection } from '../components/wizard';

/**
 * Wizard state that tracks user progress through the setup wizard.
 * This state is separate from AppState and is converted to AppState when wizard finishes.
 */
export interface WizardState {
  /** Selected custody pattern (Step 1) */
  pattern: PatternType | null;
  /** Pattern's custody split percentage (automatically set when pattern is selected) */
  split: SplitType | null;
  /** Parent configuration data (Step 2) */
  parentSetup: ParentSetupData;
  /** Holiday custody assignments (Step 3) */
  holidaySelections: HolidaySelection[];
}

/**
 * Action types for wizard state management.
 */
export type WizardAction =
  | { type: 'SET_PATTERN'; payload: { pattern: PatternType; split: SplitType } }
  | { type: 'SET_PARENTS'; payload: ParentSetupData }
  | { type: 'SET_HOLIDAYS'; payload: HolidaySelection[] }
  | { type: 'RESET'; payload: WizardState };

/**
 * Reducer function for wizard state management.
 * Handles all wizard state transitions in a predictable, immutable way.
 */
export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_PATTERN':
      return {
        ...state,
        pattern: action.payload.pattern,
        split: action.payload.split,
      };
    case 'SET_PARENTS':
      return {
        ...state,
        parentSetup: action.payload,
      };
    case 'SET_HOLIDAYS':
      return {
        ...state,
        holidaySelections: action.payload,
      };
    case 'RESET':
      return action.payload;
    default: {
      // Exhaustive check - TypeScript will error if a new action type is added but not handled
      action satisfies never;
      return state;
    }
  }
}

/**
 * Convert wizard state to AppState format.
 * This is called when the user completes the wizard ("Finish" action).
 * 
 * @param wizardState - The current wizard state to convert
 * @returns AppState object ready for the main application
 */
export function convertWizardToAppState(wizardState: WizardState): AppState {
  const { pattern, parentSetup } = wizardState;

  // Default values for required fields
  const selectedPattern: PatternType = pattern || 'alt-weeks';
  const startingParent: ParentId = parentSetup.startingParent || 'parentA';
  
  // Default to today's date if not provided
  const startDate = parentSetup.startDate || new Date().toISOString().split('T')[0];
  const exchangeTime = '15:00'; // Default exchange time

  return {
    config: {
      startDate,
      selectedPattern,
      startingParent,
      exchangeTime,
    },
    parents: {
      parentA: {
        name: parentSetup.parentAName || 'Parent A',
        colorClass: parentSetup.parentAColor || 'bg-blue-500',
      },
      parentB: {
        name: parentSetup.parentBName || 'Parent B',
        colorClass: parentSetup.parentBColor || 'bg-pink-500',
      },
    },
  };
}
