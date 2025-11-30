import { useState, useCallback, useRef } from 'react';

/**
 * Return type for useLocalStorage hook.
 * [0] - The current stored value
 * [1] - Setter function to update the value
 * [2] - Clear function to remove the value and reset to initial
 */
export type UseLocalStorageReturn<T> = [
  T,
  (value: T | ((prev: T) => T)) => void,
  () => void
];

/**
 * Check if localStorage is available in the current environment.
 * Handles cases like SSR, private browsing mode, or storage being disabled.
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const testKey = '__localStorage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Custom hook for persisting state to localStorage.
 * Provides type-safe JSON serialization/deserialization with graceful fallback
 * when localStorage is unavailable.
 *
 * @param key - The localStorage key to use for persistence
 * @param initialValue - The initial value to use if no stored value exists
 * @returns A tuple of [storedValue, setValue, clearValue]
 *
 * @example
 * ```typescript
 * const [config, setConfig, clearConfig] = useLocalStorage('app-config', defaultConfig);
 *
 * // Update config
 * setConfig({ ...config, theme: 'dark' });
 *
 * // Use functional update
 * setConfig(prev => ({ ...prev, count: prev.count + 1 }));
 *
 * // Clear and reset to initial value
 * clearConfig();
 * ```
 *
 * Edge Cases Handled:
 * - localStorage not available (SSR, private browsing)
 * - Invalid JSON in storage
 * - Storage quota exceeded
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): UseLocalStorageReturn<T> {
  // Store initialValue in a ref to keep clearValue callback stable
  const initialValueRef = useRef(initialValue);

  // Get initial value from localStorage or use default
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!isLocalStorageAvailable()) {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Use functional update pattern to get the correct previous value
        setStoredValue((prevValue) => {
          const valueToStore = value instanceof Function ? value(prevValue) : value;
          
          // Save to localStorage
          if (isLocalStorageAvailable()) {
            try {
              window.localStorage.setItem(key, JSON.stringify(valueToStore));
            } catch (storageError) {
              // Handle quota exceeded or other storage errors
              console.warn(`Error setting localStorage key "${key}":`, storageError);
            }
          }
          
          return valueToStore;
        });
      } catch (error) {
        console.warn(`Error in setValue for localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  // Clear the stored value and reset to initial
  const clearValue = useCallback(() => {
    try {
      setStoredValue(initialValueRef.current);
      if (isLocalStorageAvailable()) {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error clearing localStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue, clearValue];
}
