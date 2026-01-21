import { useCallback, useEffect, useState } from "react";

/**
 * A generic hook for syncing state with localStorage
 * Handles SSR gracefully and includes error handling for JSON parsing
 *
 * @param key - The localStorage key to use
 * @param initialValue - The initial value if nothing is stored
 * @returns A tuple of [storedValue, setValue] similar to useState
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize state with a function to handle SSR and localStorage read
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Check if we're in browser environment
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      // Parse stored JSON or return initial value if nothing stored
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      // If error parsing JSON, return initial value
      console.warn(
        `Error reading localStorage key "${key}":`,
        error instanceof Error ? error.message : error,
      );
      return initialValue;
    }
  });

  // Update localStorage when storedValue changes
  useEffect(() => {
    // Skip if SSR
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(
        `Error setting localStorage key "${key}":`,
        error instanceof Error ? error.message : error,
      );
    }
  }, [key, storedValue]);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue) as T);
        } catch (error) {
          console.warn(
            `Error parsing storage event for key "${key}":`,
            error instanceof Error ? error.message : error,
          );
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  // Wrapped setter that handles both direct values and updater functions
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const nextValue = value instanceof Function ? value(prev) : value;
      return nextValue;
    });
  }, []);

  return [storedValue, setValue];
}

/**
 * Remove a value from localStorage
 * @param key - The localStorage key to remove
 */
export function removeFromLocalStorage(key: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(
      `Error removing localStorage key "${key}":`,
      error instanceof Error ? error.message : error,
    );
  }
}
