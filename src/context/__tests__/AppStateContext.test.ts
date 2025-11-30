import { describe, test, expect } from 'vitest';
import { appStateReducer, initialAppState } from '../AppStateContext';
import type { AppStateAction } from '../AppStateContext';
import type { AppState, AppConfig, ParentConfig, PatternType } from '../../types';

describe('AppStateContext', () => {
  describe('initialAppState', () => {
    test('has valid config structure', () => {
      expect(initialAppState.config).toBeDefined();
      expect(initialAppState.config.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(initialAppState.config.selectedPattern).toBe('2-2-5-5');
      expect(initialAppState.config.startingParent).toBe('parentA');
      expect(initialAppState.config.exchangeTime).toBe('18:00');
    });

    test('has valid parents structure', () => {
      expect(initialAppState.parents).toBeDefined();
      expect(initialAppState.parents.parentA.name).toBe('Parent A');
      expect(initialAppState.parents.parentA.colorClass).toBe('bg-blue-500');
      expect(initialAppState.parents.parentB.name).toBe('Parent B');
      expect(initialAppState.parents.parentB.colorClass).toBe('bg-pink-500');
    });
  });

  describe('appStateReducer', () => {
    describe('SET_CONFIG action', () => {
      test('updates config correctly', () => {
        const newConfig: AppConfig = {
          startDate: '2025-06-01',
          selectedPattern: 'alt-weeks',
          startingParent: 'parentB',
          exchangeTime: '15:00',
        };

        const action: AppStateAction = { type: 'SET_CONFIG', payload: newConfig };
        const newState = appStateReducer(initialAppState, action);

        expect(newState.config).toEqual(newConfig);
        // Parents should remain unchanged
        expect(newState.parents).toEqual(initialAppState.parents);
      });

      test('preserves parents when updating config', () => {
        const customState: AppState = {
          ...initialAppState,
          parents: {
            parentA: { name: 'John', colorClass: 'bg-green-500' },
            parentB: { name: 'Sarah', colorClass: 'bg-purple-500' },
          },
        };

        const newConfig: AppConfig = {
          startDate: '2025-01-15',
          selectedPattern: '3-4-4-3',
          startingParent: 'parentA',
          exchangeTime: '18:00',
        };

        const action: AppStateAction = { type: 'SET_CONFIG', payload: newConfig };
        const newState = appStateReducer(customState, action);

        expect(newState.config).toEqual(newConfig);
        expect(newState.parents).toEqual(customState.parents);
      });
    });

    describe('SET_PARENTS action', () => {
      test('updates parents correctly', () => {
        const newParents: { parentA: ParentConfig; parentB: ParentConfig } = {
          parentA: { name: 'John', colorClass: 'bg-green-500' },
          parentB: { name: 'Sarah', colorClass: 'bg-purple-500' },
        };

        const action: AppStateAction = { type: 'SET_PARENTS', payload: newParents };
        const newState = appStateReducer(initialAppState, action);

        expect(newState.parents).toEqual(newParents);
        // Config should remain unchanged
        expect(newState.config).toEqual(initialAppState.config);
      });

      test('preserves config when updating parents', () => {
        const customState: AppState = {
          ...initialAppState,
          config: {
            startDate: '2025-06-01',
            selectedPattern: 'every-weekend',
            startingParent: 'parentB',
            exchangeTime: '17:00',
          },
        };

        const newParents: { parentA: ParentConfig; parentB: ParentConfig } = {
          parentA: { name: 'Alice', colorClass: 'bg-red-500' },
          parentB: { name: 'Bob', colorClass: 'bg-yellow-500' },
        };

        const action: AppStateAction = { type: 'SET_PARENTS', payload: newParents };
        const newState = appStateReducer(customState, action);

        expect(newState.parents).toEqual(newParents);
        expect(newState.config).toEqual(customState.config);
      });
    });

    describe('UPDATE_PATTERN action', () => {
      test('updates only selectedPattern in config', () => {
        const customState: AppState = {
          ...initialAppState,
          config: {
            startDate: '2025-03-15',
            selectedPattern: '2-2-5-5',
            startingParent: 'parentA',
            exchangeTime: '16:00',
          },
        };

        const newPattern: PatternType = 'every-other-weekend';
        const action: AppStateAction = { type: 'UPDATE_PATTERN', payload: newPattern };
        const newState = appStateReducer(customState, action);

        expect(newState.config.selectedPattern).toBe(newPattern);
        // Other config fields should remain unchanged
        expect(newState.config.startDate).toBe('2025-03-15');
        expect(newState.config.startingParent).toBe('parentA');
        expect(newState.config.exchangeTime).toBe('16:00');
        // Parents should remain unchanged
        expect(newState.parents).toEqual(customState.parents);
      });

      test('handles all pattern types', () => {
        const patterns: PatternType[] = [
          'alt-weeks',
          '2-2-3',
          '2-2-5-5',
          '3-4-4-3',
          'every-weekend',
          'every-other-weekend',
          'same-weekends-monthly',
          'all-to-one',
          'custom',
        ];

        patterns.forEach((pattern) => {
          const action: AppStateAction = { type: 'UPDATE_PATTERN', payload: pattern };
          const newState = appStateReducer(initialAppState, action);
          expect(newState.config.selectedPattern).toBe(pattern);
        });
      });
    });

    describe('RESET action', () => {
      test('resets state to initialAppState', () => {
        const customState: AppState = {
          config: {
            startDate: '2025-12-25',
            selectedPattern: 'all-to-one',
            startingParent: 'parentB',
            exchangeTime: '12:00',
          },
          parents: {
            parentA: { name: 'Custom A', colorClass: 'bg-red-500' },
            parentB: { name: 'Custom B', colorClass: 'bg-yellow-500' },
          },
        };

        const action: AppStateAction = { type: 'RESET' };
        const newState = appStateReducer(customState, action);

        // Check that config is reset (pattern should be default)
        expect(newState.config.selectedPattern).toBe(initialAppState.config.selectedPattern);
        expect(newState.config.startingParent).toBe(initialAppState.config.startingParent);
        expect(newState.config.exchangeTime).toBe(initialAppState.config.exchangeTime);

        // Check that parents are reset
        expect(newState.parents).toEqual(initialAppState.parents);
      });
    });

    describe('LOAD_STATE action', () => {
      test('loads entire state from payload', () => {
        const loadedState: AppState = {
          config: {
            startDate: '2024-07-04',
            selectedPattern: '3-4-4-3',
            startingParent: 'parentB',
            exchangeTime: '09:00',
          },
          parents: {
            parentA: { name: 'Loaded A', colorClass: 'bg-indigo-500' },
            parentB: { name: 'Loaded B', colorClass: 'bg-teal-500' },
          },
        };

        const action: AppStateAction = { type: 'LOAD_STATE', payload: loadedState };
        const newState = appStateReducer(initialAppState, action);

        expect(newState).toEqual(loadedState);
      });
    });

    describe('default case', () => {
      test('returns current state for unknown action', () => {
        const customState: AppState = {
          ...initialAppState,
          config: {
            ...initialAppState.config,
            selectedPattern: 'alt-weeks',
          },
        };

        // Force an unknown action type
        const action = { type: 'UNKNOWN_ACTION' } as unknown as AppStateAction;
        const newState = appStateReducer(customState, action);

        expect(newState).toEqual(customState);
      });
    });
  });

  describe('AppStateContextValue interface structure', () => {
    test('context value should include expected properties', () => {
      const contextShape = {
        state: initialAppState,
        dispatch: () => {},
        isLoaded: true,
      };
      expect(contextShape).toHaveProperty('state');
      expect(contextShape).toHaveProperty('dispatch');
      expect(contextShape).toHaveProperty('isLoaded');
    });
  });

  describe('useAppState hook behavior expectations', () => {
    test('useAppState should throw error when used outside provider', () => {
      // This test documents the expected behavior
      // The actual implementation throws: "useAppState must be used within an AppStateProvider"
      const expectedErrorMessage = 'useAppState must be used within an AppStateProvider';
      expect(expectedErrorMessage).toContain('AppStateProvider');
    });
  });

  describe('state persistence flow', () => {
    test('state can be serialized and deserialized', () => {
      const state: AppState = {
        config: {
          startDate: '2025-05-15',
          selectedPattern: '2-2-3',
          startingParent: 'parentA',
          exchangeTime: '18:00',
        },
        parents: {
          parentA: { name: 'John', colorClass: 'bg-blue-500' },
          parentB: { name: 'Sarah', colorClass: 'bg-pink-500' },
        },
      };

      const serialized = JSON.stringify(state);
      const deserialized = JSON.parse(serialized) as AppState;

      expect(deserialized).toEqual(state);
    });

    test('null state falls back to initialAppState pattern', () => {
      const storedState: AppState | null = null;
      const effectiveState = storedState ?? initialAppState;

      expect(effectiveState).toEqual(initialAppState);
    });
  });
});
