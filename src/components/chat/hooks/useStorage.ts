import { useState, useEffect, useCallback, useRef } from "react";

// Generic hook for localStorage persistence with lazy initialization
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  // Use a function to lazy-initialize the state from localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const [isLoaded] = useState(true); // Already loaded since we use lazy init

  // Save to localStorage when value changes
  const setValue = useCallback(
    (value: React.SetStateAction<T>) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          localStorage.setItem(key, JSON.stringify(valueToStore));
          return valueToStore;
        });
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue, isLoaded];
}

// Hook for managing auto-export timer
export function useAutoExportTimer(
  enabled: boolean,
  intervalMinutes: number,
  onExport: () => void
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onExportRef = useRef(onExport);

  // Keep the callback ref updated
  useEffect(() => {
    onExportRef.current = onExport;
  }, [onExport]);

  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Start new timer if enabled
    if (enabled && intervalMinutes > 0) {
      const intervalMs = intervalMinutes * 60 * 1000;
      timerRef.current = setInterval(() => {
        console.log(`Auto-exporting data (every ${intervalMinutes} minutes)...`);
        onExportRef.current();
      }, intervalMs);
    }

    // Cleanup on unmount or when settings change
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [enabled, intervalMinutes]);

  return timerRef;
}
