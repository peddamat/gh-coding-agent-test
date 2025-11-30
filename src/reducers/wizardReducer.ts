import type { PatternType, ParentId, AppState, HolidayState, HolidayUserConfig, BirthdayConfig, HolidayPresetType } from '../types';
import type { SplitPeriodConfig, SelectionPriorityConfig } from '../types/holidays';
import type { SplitType } from '../data/patterns';
import type { ParentSetupData, HolidaySelection } from '../components/wizard';
import { createDefaultHolidayConfigs, createDefaultBirthdayConfigs, DEFAULT_WINTER_BREAK_SPLIT, DEFAULT_SUMMER_VACATION_CONFIG } from '../data/holidays';
import { DEFAULT_PARENT_A_COLOR, DEFAULT_PARENT_B_COLOR } from '../components/shared/colorOptions';

/**
 * Enhanced holiday state for the wizard.
 * Tracks all holiday configuration including presets, major breaks, weekend holidays, and birthdays.
 */
export interface EnhancedHolidayState {
  /** Holiday configurations for all holidays */
  holidayConfigs: HolidayUserConfig[];
  /** Birthday configurations */
  birthdays: BirthdayConfig[];
  /** Currently selected preset (if any) */
  selectedPreset?: HolidayPresetType;
  /** Winter break split configuration */
  winterBreakSplit: SplitPeriodConfig;
  /** Summer vacation configuration */
  summerVacationConfig: SelectionPriorityConfig;
}

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
  /** Holiday custody assignments (Step 3) - Legacy format */
  holidaySelections: HolidaySelection[];
  /** Enhanced holiday configuration (Step 2) - New format with full holiday support */
  enhancedHolidays: EnhancedHolidayState;
}

/**
 * Action types for wizard state management.
 */
export type WizardAction =
  | { type: 'SET_PATTERN'; payload: { pattern: PatternType; split: SplitType } }
  | { type: 'SET_PARENTS'; payload: ParentSetupData }
  | { type: 'SET_HOLIDAYS'; payload: HolidaySelection[] }
  | { type: 'SET_ENHANCED_HOLIDAY_CONFIGS'; payload: HolidayUserConfig[] }
  | { type: 'SET_ENHANCED_BIRTHDAYS'; payload: BirthdayConfig[] }
  | { type: 'SET_ENHANCED_PRESET'; payload: HolidayPresetType }
  | { type: 'SET_ENHANCED_WINTER_BREAK_SPLIT'; payload: SplitPeriodConfig }
  | { type: 'SET_ENHANCED_SUMMER_VACATION_CONFIG'; payload: SelectionPriorityConfig }
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
    case 'SET_ENHANCED_HOLIDAY_CONFIGS':
      return {
        ...state,
        enhancedHolidays: {
          ...state.enhancedHolidays,
          holidayConfigs: action.payload,
        },
      };
    case 'SET_ENHANCED_BIRTHDAYS':
      return {
        ...state,
        enhancedHolidays: {
          ...state.enhancedHolidays,
          birthdays: action.payload,
        },
      };
    case 'SET_ENHANCED_PRESET':
      return {
        ...state,
        enhancedHolidays: {
          ...state.enhancedHolidays,
          selectedPreset: action.payload,
        },
      };
    case 'SET_ENHANCED_WINTER_BREAK_SPLIT':
      return {
        ...state,
        enhancedHolidays: {
          ...state.enhancedHolidays,
          winterBreakSplit: action.payload,
        },
      };
    case 'SET_ENHANCED_SUMMER_VACATION_CONFIG':
      return {
        ...state,
        enhancedHolidays: {
          ...state.enhancedHolidays,
          summerVacationConfig: action.payload,
        },
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
  const { pattern, parentSetup, enhancedHolidays } = wizardState;

  // Default values for required fields
  const selectedPattern: PatternType = pattern || 'alt-weeks';
  const startingParent: ParentId = parentSetup.startingParent || 'parentA';
  
  // Default to today's date if not provided
  const startDate = parentSetup.startDate || new Date().toISOString().split('T')[0];
  const exchangeTime = '15:00'; // Default exchange time

  // Convert enhanced holidays to HolidayState
  const holidays: HolidayState = {
    holidayConfigs: enhancedHolidays.holidayConfigs,
    birthdays: enhancedHolidays.birthdays,
    selectedPreset: enhancedHolidays.selectedPreset,
    winterBreakSplit: enhancedHolidays.winterBreakSplit,
    summerVacationConfig: enhancedHolidays.summerVacationConfig,
  };

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
        colorClass: parentSetup.parentAColor || DEFAULT_PARENT_A_COLOR,
      },
      parentB: {
        name: parentSetup.parentBName || 'Parent B',
        colorClass: parentSetup.parentBColor || DEFAULT_PARENT_B_COLOR,
      },
    },
    holidays,
  };
}

/**
 * Create default enhanced holiday state for the wizard.
 */
export function createDefaultEnhancedHolidayState(): EnhancedHolidayState {
  return {
    holidayConfigs: createDefaultHolidayConfigs(),
    birthdays: createDefaultBirthdayConfigs(),
    selectedPreset: undefined,
    winterBreakSplit: DEFAULT_WINTER_BREAK_SPLIT,
    summerVacationConfig: DEFAULT_SUMMER_VACATION_CONFIG,
  };
}
