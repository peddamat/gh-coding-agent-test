/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
  type Dispatch,
} from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { AppState, AppConfig, ParentConfig, PatternType } from '../types';

/**
 * Storage key for localStorage persistence.
 * Format: 'custody-calculator-state'
 */
const STORAGE_KEY = 'custody-calculator-state';

/**
 * Action types for the AppState reducer.
 */
export type AppStateAction =
  | { type: 'SET_CONFIG'; payload: AppConfig }
  | { type: 'SET_PARENTS'; payload: { parentA: ParentConfig; parentB: ParentConfig } }
  | { type: 'UPDATE_PATTERN'; payload: PatternType }
  | { type: 'RESET' }
  | { type: 'LOAD_STATE'; payload: AppState };

/**
 * Get today's date in ISO format (YYYY-MM-DD).
 */
function getTodayDateString(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

/**
 * Default initial state for the application.
 * Used when no saved state exists in localStorage.
 */
export const initialAppState: AppState = {
  config: {
    startDate: getTodayDateString(),
    selectedPattern: '2-2-5-5',
    startingParent: 'parentA',
    exchangeTime: '18:00',
  },
  parents: {
    parentA: { name: 'Parent A', colorClass: 'bg-blue-500' },
    parentB: { name: 'Parent B', colorClass: 'bg-pink-500' },
  },
};

/**
 * Reducer function for AppState.
 * Handles all state transformations based on action types.
 */
export function appStateReducer(state: AppState, action: AppStateAction): AppState {
  switch (action.type) {
    case 'SET_CONFIG':
      return { ...state, config: action.payload };
    case 'SET_PARENTS':
      return { ...state, parents: action.payload };
    case 'UPDATE_PATTERN':
      return {
        ...state,
        config: { ...state.config, selectedPattern: action.payload },
      };
    case 'RESET':
      return initialAppState;
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

/**
 * Context value type for AppStateContext.
 */
export interface AppStateContextValue {
  /** Current application state */
  state: AppState;
  /** Dispatch function for state actions */
  dispatch: Dispatch<AppStateAction>;
  /** Whether state has been loaded from localStorage */
  isLoaded: boolean;
}

/**
 * Context for global application state management.
 */
const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

/**
 * Props for AppStateProvider component.
 */
export interface AppStateProviderProps {
  /** Child components that will have access to app state */
  children: ReactNode;
}

/**
 * Provider component for global application state.
 * Automatically persists state to localStorage on changes
 * and loads from localStorage on mount.
 */
export function AppStateProvider({ children }: AppStateProviderProps) {
  // Use localStorage hook for persistence
  const [storedState, setStoredState] = useLocalStorage<AppState | null>(
    STORAGE_KEY,
    null
  );

  // Initialize reducer with stored state or default
  const [state, dispatch] = useReducer(
    appStateReducer,
    storedState ?? initialAppState
  );

  // Track if initial load is complete
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount (runs once)
  // Note: storedState is intentionally omitted from deps array because:
  // 1. It's read synchronously from localStorage on initial render
  // 2. Adding it would cause infinite loops when state changes
  // 3. We only want to load from storage once on mount
  useEffect(() => {
    if (storedState && !isLoaded) {
      dispatch({ type: 'LOAD_STATE', payload: storedState });
    }
    setIsLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage on state change (after initial load)
  useEffect(() => {
    if (isLoaded) {
      setStoredState(state);
    }
  }, [state, isLoaded, setStoredState]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<AppStateContextValue>(
    () => ({
      state,
      dispatch,
      isLoaded,
    }),
    [state, isLoaded]
  );

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
}

/**
 * Hook to access application state and dispatch.
 * Must be used within an AppStateProvider.
 *
 * @throws Error if used outside of AppStateProvider
 * @returns AppStateContextValue with state, dispatch, and isLoaded
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { state, dispatch, isLoaded } = useAppState();
 *
 *   const handlePatternChange = (pattern: PatternType) => {
 *     dispatch({ type: 'UPDATE_PATTERN', payload: pattern });
 *   };
 *
 *   if (!isLoaded) {
 *     return <LoadingSpinner />;
 *   }
 *
 *   return <div>{state.config.selectedPattern}</div>;
 * }
 * ```
 */
export function useAppState(): AppStateContextValue {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
