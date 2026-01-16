/**
 * useDebounce - Custom hook for debouncing values
 * Useful for search inputs and API calls that shouldn't fire on every keystroke
 */

import { useEffect, useState } from "react";

/**
 * Returns a debounced value that only updates after the specified delay
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
