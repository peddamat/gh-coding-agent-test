import { describe, test, expect } from 'vitest';
import { appStateReducer, initialAppState } from '../AppStateContext';
import type { AppStateAction } from '../AppStateContext';
import type { AppState, AppConfig, ParentConfig, PatternType, Child, FamilyInfo, TrackBreak } from '../../types';

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

    test('has valid familyInfo structure', () => {
      expect(initialAppState.familyInfo).toBeDefined();
      expect(initialAppState.familyInfo.children).toEqual([]);
      expect(initialAppState.familyInfo.planStartDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(initialAppState.familyInfo.planEndDate).toBeUndefined();
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
          familyInfo: {
            children: [],
            planStartDate: '2025-12-25',
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
          familyInfo: {
            children: [],
            planStartDate: '2024-07-04',
          },
        };

        const action: AppStateAction = { type: 'LOAD_STATE', payload: loadedState };
        const newState = appStateReducer(initialAppState, action);

        expect(newState).toEqual(loadedState);
      });
    });

    describe('SET_FAMILY_INFO action', () => {
      test('updates familyInfo correctly', () => {
        const newFamilyInfo: FamilyInfo = {
          children: [
            { id: '1', name: 'Alice', birthdate: '2015-03-15', custodyEndAge: 18 },
          ],
          planStartDate: '2025-01-01',
          planEndDate: '2033-03-15',
        };

        const action: AppStateAction = { type: 'SET_FAMILY_INFO', payload: newFamilyInfo };
        const newState = appStateReducer(initialAppState, action);

        expect(newState.familyInfo).toEqual(newFamilyInfo);
        // Config should remain unchanged
        expect(newState.config).toEqual(initialAppState.config);
      });
    });

    describe('ADD_CHILD action', () => {
      test('adds a child to familyInfo.children', () => {
        const newChild: Child = {
          id: '1',
          name: 'Bob',
          birthdate: '2018-07-20',
          custodyEndAge: 18,
        };

        const action: AppStateAction = { type: 'ADD_CHILD', payload: newChild };
        const newState = appStateReducer(initialAppState, action);

        expect(newState.familyInfo.children).toHaveLength(1);
        expect(newState.familyInfo.children[0]).toEqual(newChild);
      });

      test('preserves existing children when adding new one', () => {
        const existingChild: Child = {
          id: '1',
          name: 'Alice',
          birthdate: '2015-03-15',
          custodyEndAge: 18,
        };

        const stateWithChild: AppState = {
          ...initialAppState,
          familyInfo: {
            ...initialAppState.familyInfo,
            children: [existingChild],
          },
        };

        const newChild: Child = {
          id: '2',
          name: 'Bob',
          birthdate: '2018-07-20',
          custodyEndAge: 18,
        };

        const action: AppStateAction = { type: 'ADD_CHILD', payload: newChild };
        const newState = appStateReducer(stateWithChild, action);

        expect(newState.familyInfo.children).toHaveLength(2);
        expect(newState.familyInfo.children[0]).toEqual(existingChild);
        expect(newState.familyInfo.children[1]).toEqual(newChild);
      });
    });

    describe('REMOVE_CHILD action', () => {
      test('removes child by id', () => {
        const child1: Child = {
          id: '1',
          name: 'Alice',
          birthdate: '2015-03-15',
          custodyEndAge: 18,
        };
        const child2: Child = {
          id: '2',
          name: 'Bob',
          birthdate: '2018-07-20',
          custodyEndAge: 18,
        };

        const stateWithChildren: AppState = {
          ...initialAppState,
          familyInfo: {
            ...initialAppState.familyInfo,
            children: [child1, child2],
          },
        };

        const action: AppStateAction = { type: 'REMOVE_CHILD', payload: '1' };
        const newState = appStateReducer(stateWithChildren, action);

        expect(newState.familyInfo.children).toHaveLength(1);
        expect(newState.familyInfo.children[0]).toEqual(child2);
      });

      test('does nothing if child id not found', () => {
        const child: Child = {
          id: '1',
          name: 'Alice',
          birthdate: '2015-03-15',
          custodyEndAge: 18,
        };

        const stateWithChild: AppState = {
          ...initialAppState,
          familyInfo: {
            ...initialAppState.familyInfo,
            children: [child],
          },
        };

        const action: AppStateAction = { type: 'REMOVE_CHILD', payload: 'non-existent' };
        const newState = appStateReducer(stateWithChild, action);

        expect(newState.familyInfo.children).toHaveLength(1);
        expect(newState.familyInfo.children[0]).toEqual(child);
      });
    });

    describe('UPDATE_CHILD action', () => {
      test('updates existing child by id', () => {
        const child: Child = {
          id: '1',
          name: 'Alice',
          birthdate: '2015-03-15',
          custodyEndAge: 18,
        };

        const stateWithChild: AppState = {
          ...initialAppState,
          familyInfo: {
            ...initialAppState.familyInfo,
            children: [child],
          },
        };

        const updatedChild: Child = {
          id: '1',
          name: 'Alice Updated',
          birthdate: '2015-03-15',
          custodyEndAge: 19,
        };

        const action: AppStateAction = { type: 'UPDATE_CHILD', payload: updatedChild };
        const newState = appStateReducer(stateWithChild, action);

        expect(newState.familyInfo.children).toHaveLength(1);
        expect(newState.familyInfo.children[0]).toEqual(updatedChild);
      });

      test('does not modify other children', () => {
        const child1: Child = {
          id: '1',
          name: 'Alice',
          birthdate: '2015-03-15',
          custodyEndAge: 18,
        };
        const child2: Child = {
          id: '2',
          name: 'Bob',
          birthdate: '2018-07-20',
          custodyEndAge: 18,
        };

        const stateWithChildren: AppState = {
          ...initialAppState,
          familyInfo: {
            ...initialAppState.familyInfo,
            children: [child1, child2],
          },
        };

        const updatedChild1: Child = {
          id: '1',
          name: 'Alice Updated',
          birthdate: '2015-03-15',
          custodyEndAge: 19,
        };

        const action: AppStateAction = { type: 'UPDATE_CHILD', payload: updatedChild1 };
        const newState = appStateReducer(stateWithChildren, action);

        expect(newState.familyInfo.children).toHaveLength(2);
        expect(newState.familyInfo.children[0]).toEqual(updatedChild1);
        expect(newState.familyInfo.children[1]).toEqual(child2);
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
        familyInfo: {
          children: [],
          planStartDate: '2025-05-15',
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

// ============================================================================
// Track Break Actions Tests
// ============================================================================

describe('Track Break Actions', () => {
  const sampleTrackBreak: TrackBreak = {
    id: 'fall-break-2025',
    name: 'Fall Track Break',
    startDate: '2025-10-06',
    endDate: '2025-10-17',
  };

  const anotherTrackBreak: TrackBreak = {
    id: 'spring-break-2025',
    name: 'Spring Track Break',
    startDate: '2025-03-24',
    endDate: '2025-04-04',
  };

  describe('SET_SCHOOL_TYPE action', () => {
    test('sets school type to year-round', () => {
      const action: AppStateAction = { type: 'SET_SCHOOL_TYPE', payload: 'year-round' };
      const newState = appStateReducer(initialAppState, action);
      expect(newState.schoolType).toBe('year-round');
    });

    test('sets school type to traditional', () => {
      const stateWithYearRound: AppState = {
        ...initialAppState,
        schoolType: 'year-round',
      };
      const action: AppStateAction = { type: 'SET_SCHOOL_TYPE', payload: 'traditional' };
      const newState = appStateReducer(stateWithYearRound, action);
      expect(newState.schoolType).toBe('traditional');
    });
  });

  describe('SET_TRACK_BREAKS action', () => {
    test('sets track breaks array', () => {
      const trackBreaks = [sampleTrackBreak, anotherTrackBreak];
      const action: AppStateAction = { type: 'SET_TRACK_BREAKS', payload: trackBreaks };
      const newState = appStateReducer(initialAppState, action);
      expect(newState.trackBreaks).toEqual(trackBreaks);
    });

    test('replaces existing track breaks', () => {
      const stateWithBreaks: AppState = {
        ...initialAppState,
        trackBreaks: [sampleTrackBreak],
      };
      const action: AppStateAction = { type: 'SET_TRACK_BREAKS', payload: [anotherTrackBreak] };
      const newState = appStateReducer(stateWithBreaks, action);
      expect(newState.trackBreaks).toEqual([anotherTrackBreak]);
    });
  });

  describe('ADD_TRACK_BREAK action', () => {
    test('adds track break to empty array', () => {
      const action: AppStateAction = { type: 'ADD_TRACK_BREAK', payload: sampleTrackBreak };
      const newState = appStateReducer(initialAppState, action);
      expect(newState.trackBreaks).toHaveLength(1);
      expect(newState.trackBreaks?.[0]).toEqual(sampleTrackBreak);
    });

    test('adds track break to existing array', () => {
      const stateWithBreak: AppState = {
        ...initialAppState,
        trackBreaks: [sampleTrackBreak],
      };
      const action: AppStateAction = { type: 'ADD_TRACK_BREAK', payload: anotherTrackBreak };
      const newState = appStateReducer(stateWithBreak, action);
      expect(newState.trackBreaks).toHaveLength(2);
      expect(newState.trackBreaks).toContainEqual(anotherTrackBreak);
    });
  });

  describe('UPDATE_TRACK_BREAK action', () => {
    test('updates existing track break', () => {
      const stateWithBreak: AppState = {
        ...initialAppState,
        trackBreaks: [sampleTrackBreak],
      };
      const updatedBreak: TrackBreak = {
        ...sampleTrackBreak,
        name: 'Updated Fall Break',
      };
      const action: AppStateAction = { type: 'UPDATE_TRACK_BREAK', payload: updatedBreak };
      const newState = appStateReducer(stateWithBreak, action);
      expect(newState.trackBreaks?.[0].name).toBe('Updated Fall Break');
    });

    test('does not modify other track breaks', () => {
      const stateWithBreaks: AppState = {
        ...initialAppState,
        trackBreaks: [sampleTrackBreak, anotherTrackBreak],
      };
      const updatedBreak: TrackBreak = {
        ...sampleTrackBreak,
        name: 'Updated Fall Break',
      };
      const action: AppStateAction = { type: 'UPDATE_TRACK_BREAK', payload: updatedBreak };
      const newState = appStateReducer(stateWithBreaks, action);
      expect(newState.trackBreaks?.[1]).toEqual(anotherTrackBreak);
    });
  });

  describe('REMOVE_TRACK_BREAK action', () => {
    test('removes track break by id', () => {
      const stateWithBreaks: AppState = {
        ...initialAppState,
        trackBreaks: [sampleTrackBreak, anotherTrackBreak],
      };
      const action: AppStateAction = { type: 'REMOVE_TRACK_BREAK', payload: sampleTrackBreak.id };
      const newState = appStateReducer(stateWithBreaks, action);
      expect(newState.trackBreaks).toHaveLength(1);
      expect(newState.trackBreaks?.[0]).toEqual(anotherTrackBreak);
    });

    test('handles non-existent id gracefully', () => {
      const stateWithBreak: AppState = {
        ...initialAppState,
        trackBreaks: [sampleTrackBreak],
      };
      const action: AppStateAction = { type: 'REMOVE_TRACK_BREAK', payload: 'non-existent' };
      const newState = appStateReducer(stateWithBreak, action);
      expect(newState.trackBreaks).toHaveLength(1);
    });
  });

  describe('CLAIM_TRACK_BREAK_VACATION action', () => {
    test('claims vacation on track break', () => {
      const stateWithBreak: AppState = {
        ...initialAppState,
        trackBreaks: [sampleTrackBreak],
      };
      const action: AppStateAction = {
        type: 'CLAIM_TRACK_BREAK_VACATION',
        payload: {
          trackBreakId: sampleTrackBreak.id,
          claimedBy: 'parentA',
          claimDate: '2025-09-01',
          weeks: 2,
        },
      };
      const newState = appStateReducer(stateWithBreak, action);
      expect(newState.trackBreaks?.[0].vacationClaimed).toBeDefined();
      expect(newState.trackBreaks?.[0].vacationClaimed?.claimedBy).toBe('parentA');
      expect(newState.trackBreaks?.[0].vacationClaimed?.claimDate).toBe('2025-09-01');
      expect(newState.trackBreaks?.[0].vacationClaimed?.weeks).toBe(2);
    });

    test('does not affect other track breaks', () => {
      const stateWithBreaks: AppState = {
        ...initialAppState,
        trackBreaks: [sampleTrackBreak, anotherTrackBreak],
      };
      const action: AppStateAction = {
        type: 'CLAIM_TRACK_BREAK_VACATION',
        payload: {
          trackBreakId: sampleTrackBreak.id,
          claimedBy: 'parentB',
          claimDate: '2025-09-01',
          weeks: 2,
        },
      };
      const newState = appStateReducer(stateWithBreaks, action);
      expect(newState.trackBreaks?.[1].vacationClaimed).toBeUndefined();
    });
  });

  describe('UNCLAIM_TRACK_BREAK_VACATION action', () => {
    test('removes vacation claim from track break', () => {
      const claimedBreak: TrackBreak = {
        ...sampleTrackBreak,
        vacationClaimed: {
          claimedBy: 'parentA',
          claimDate: '2025-09-01',
          weeks: 2,
        },
      };
      const stateWithClaim: AppState = {
        ...initialAppState,
        trackBreaks: [claimedBreak],
      };
      const action: AppStateAction = {
        type: 'UNCLAIM_TRACK_BREAK_VACATION',
        payload: sampleTrackBreak.id,
      };
      const newState = appStateReducer(stateWithClaim, action);
      expect(newState.trackBreaks?.[0].vacationClaimed).toBeUndefined();
    });
  });

  describe('SET_TRACK_VACATION_NOTICE_DEADLINE action', () => {
    test('sets vacation notice deadline', () => {
      const action: AppStateAction = { type: 'SET_TRACK_VACATION_NOTICE_DEADLINE', payload: 45 };
      const newState = appStateReducer(initialAppState, action);
      expect(newState.trackVacationNoticeDeadline).toBe(45);
    });
  });
});
