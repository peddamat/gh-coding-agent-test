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
import { getTodayDateString } from '../hooks/useCustodyEngine';
import type { AppState, AppConfig, ParentConfig, PatternType, HolidayState, FamilyInfo, Child, InServiceDayConfig, SchoolType, TrackBreak } from '../types';
import { createDefaultHolidayConfigs, createDefaultBirthdayConfigs } from '../data/holidays';

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
  | { type: 'SET_HOLIDAYS'; payload: HolidayState }
  | { type: 'UPDATE_HOLIDAY_CONFIGS'; payload: HolidayState['holidayConfigs'] }
  | { type: 'UPDATE_BIRTHDAYS'; payload: HolidayState['birthdays'] }
  | { type: 'SET_FAMILY_INFO'; payload: FamilyInfo }
  | { type: 'ADD_CHILD'; payload: Child }
  | { type: 'REMOVE_CHILD'; payload: string } // payload is child id
  | { type: 'UPDATE_CHILD'; payload: Child }
  | { type: 'SET_IN_SERVICE_DAYS'; payload: string[] }
  | { type: 'ADD_IN_SERVICE_DAY'; payload: string }
  | { type: 'REMOVE_IN_SERVICE_DAY'; payload: string }
  | { type: 'SET_IN_SERVICE_CONFIG'; payload: InServiceDayConfig }
  | { type: 'SET_SCHOOL_TYPE'; payload: SchoolType }
  | { type: 'SET_TRACK_BREAKS'; payload: TrackBreak[] }
  | { type: 'ADD_TRACK_BREAK'; payload: TrackBreak }
  | { type: 'UPDATE_TRACK_BREAK'; payload: TrackBreak }
  | { type: 'REMOVE_TRACK_BREAK'; payload: string } // payload is track break id
  | { type: 'CLAIM_TRACK_BREAK_VACATION'; payload: { trackBreakId: string; claimedBy: import('../types').ParentId; claimDate: string; weeks: number } }
  | { type: 'UNCLAIM_TRACK_BREAK_VACATION'; payload: string } // payload is track break id
  | { type: 'SET_TRACK_VACATION_NOTICE_DEADLINE'; payload: number }
  | { type: 'RESET' }
  | { type: 'LOAD_STATE'; payload: AppState };

/**
 * Get default holiday state.
 */
function getDefaultHolidayState(): HolidayState {
  return {
    holidayConfigs: createDefaultHolidayConfigs(),
    birthdays: createDefaultBirthdayConfigs(),
    selectedPreset: undefined,
  };
}

/**
 * Get default family info state.
 */
function getDefaultFamilyInfo(): FamilyInfo {
  return {
    children: [],
    planStartDate: getTodayDateString(),
    planEndDate: undefined,
  };
}

/**
 * Get default in-service day configuration.
 */
function getDefaultInServiceConfig(): InServiceDayConfig {
  return {
    enabled: false,
    attachmentRule: 'attach-to-adjacent',
  };
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
  holidays: getDefaultHolidayState(),
  familyInfo: getDefaultFamilyInfo(),
  inServiceDays: [],
  inServiceConfig: getDefaultInServiceConfig(),
  schoolType: 'traditional',
  trackBreaks: [],
  trackVacationNoticeDeadline: 30,
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
    case 'SET_HOLIDAYS':
      return { ...state, holidays: action.payload };
    case 'UPDATE_HOLIDAY_CONFIGS':
      return {
        ...state,
        holidays: {
          ...(state.holidays ?? getDefaultHolidayState()),
          holidayConfigs: action.payload,
        },
      };
    case 'UPDATE_BIRTHDAYS':
      return {
        ...state,
        holidays: {
          ...(state.holidays ?? getDefaultHolidayState()),
          birthdays: action.payload,
        },
      };
    case 'SET_FAMILY_INFO':
      return { ...state, familyInfo: action.payload };
    case 'ADD_CHILD':
      return {
        ...state,
        familyInfo: {
          ...state.familyInfo,
          children: [...state.familyInfo.children, action.payload],
        },
      };
    case 'REMOVE_CHILD':
      return {
        ...state,
        familyInfo: {
          ...state.familyInfo,
          children: state.familyInfo.children.filter(
            (child) => child.id !== action.payload
          ),
        },
      };
    case 'UPDATE_CHILD':
      return {
        ...state,
        familyInfo: {
          ...state.familyInfo,
          children: state.familyInfo.children.map((child) =>
            child.id === action.payload.id ? action.payload : child
          ),
        },
      };
    case 'SET_IN_SERVICE_DAYS':
      return { ...state, inServiceDays: action.payload };
    case 'ADD_IN_SERVICE_DAY':
      return {
        ...state,
        inServiceDays: state.inServiceDays
          ? [...state.inServiceDays.filter(d => d !== action.payload), action.payload].sort()
          : [action.payload],
      };
    case 'REMOVE_IN_SERVICE_DAY':
      return {
        ...state,
        inServiceDays: state.inServiceDays
          ? state.inServiceDays.filter(d => d !== action.payload)
          : [],
      };
    case 'SET_IN_SERVICE_CONFIG':
      return { ...state, inServiceConfig: action.payload };
    case 'SET_SCHOOL_TYPE':
      return { ...state, schoolType: action.payload };
    case 'SET_TRACK_BREAKS':
      return { ...state, trackBreaks: action.payload };
    case 'ADD_TRACK_BREAK':
      return {
        ...state,
        trackBreaks: state.trackBreaks
          ? [...state.trackBreaks, action.payload]
          : [action.payload],
      };
    case 'UPDATE_TRACK_BREAK':
      return {
        ...state,
        trackBreaks: state.trackBreaks
          ? state.trackBreaks.map((tb) =>
              tb.id === action.payload.id ? action.payload : tb
            )
          : [action.payload],
      };
    case 'REMOVE_TRACK_BREAK':
      return {
        ...state,
        trackBreaks: state.trackBreaks
          ? state.trackBreaks.filter((tb) => tb.id !== action.payload)
          : [],
      };
    case 'CLAIM_TRACK_BREAK_VACATION':
      return {
        ...state,
        trackBreaks: state.trackBreaks
          ? state.trackBreaks.map((tb) =>
              tb.id === action.payload.trackBreakId
                ? {
                    ...tb,
                    vacationClaimed: {
                      claimedBy: action.payload.claimedBy,
                      claimDate: action.payload.claimDate,
                      weeks: action.payload.weeks,
                    },
                  }
                : tb
            )
          : [],
      };
    case 'UNCLAIM_TRACK_BREAK_VACATION':
      return {
        ...state,
        trackBreaks: state.trackBreaks
          ? state.trackBreaks.map((tb) =>
              tb.id === action.payload
                ? { ...tb, vacationClaimed: undefined }
                : tb
            )
          : [],
      };
    case 'SET_TRACK_VACATION_NOTICE_DEADLINE':
      return { ...state, trackVacationNoticeDeadline: action.payload };
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
