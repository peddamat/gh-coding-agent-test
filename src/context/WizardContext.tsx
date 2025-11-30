/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useMemo, type ReactNode, type Dispatch } from 'react';
import { wizardReducer, convertWizardToAppState, createDefaultEnhancedHolidayState, type WizardState, type WizardAction } from '../reducers/wizardReducer';
import { getDefaultParentSetupData, getDefaultHolidaySelections } from '../components/wizard';
import type { AppState } from '../types';

/**
 * Context value type for WizardContext.
 */
export interface WizardContextValue {
  /** Current wizard state */
  state: WizardState;
  /** Dispatch function for wizard actions */
  dispatch: Dispatch<WizardAction>;
  /** Convert current wizard state to AppState */
  toAppState: () => AppState;
  /** Reset wizard to initial state */
  reset: () => void;
}

/**
 * Create initial wizard state with default values.
 */
function createInitialWizardState(): WizardState {
  return {
    selectedTemplate: null,
    isBuildYourOwn: false,
    pattern: null,
    split: null,
    parentSetup: getDefaultParentSetupData(),
    holidaySelections: getDefaultHolidaySelections(),
    enhancedHolidays: createDefaultEnhancedHolidayState(),
  };
}

/**
 * Context for wizard form state management.
 */
const WizardContext = createContext<WizardContextValue | null>(null);

/**
 * Props for WizardProvider component.
 */
export interface WizardProviderProps {
  /** Child components that will have access to wizard state */
  children: ReactNode;
  /** Optional initial state for testing or restoring state */
  initialState?: WizardState;
}

/**
 * Provider component for wizard state management.
 * Wraps components that need access to wizard state and dispatch.
 */
export function WizardProvider({ children, initialState }: WizardProviderProps) {
  const [state, dispatch] = useReducer(
    wizardReducer,
    initialState ?? createInitialWizardState()
  );

  const contextValue = useMemo<WizardContextValue>(() => ({
    state,
    dispatch,
    toAppState: () => convertWizardToAppState(state),
    reset: () => dispatch({ type: 'RESET', payload: createInitialWizardState() }),
  }), [state]);

  return (
    <WizardContext.Provider value={contextValue}>
      {children}
    </WizardContext.Provider>
  );
}

/**
 * Hook to access wizard state and dispatch.
 * Must be used within a WizardProvider.
 * 
 * @throws Error if used outside of WizardProvider
 * @returns WizardContextValue with state, dispatch, and helper functions
 */
export function useWizard(): WizardContextValue {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}
