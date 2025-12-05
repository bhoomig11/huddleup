import { useState, useEffect, useRef } from "react";

interface UseDebouncedLoadingOptions {
  /**
   * Minimum delay (ms) before showing loading state
   * Prevents showing skeleton for very fast operations
   */
  showDelay?: number;

  /**
   * Minimum duration (ms) to show loading state
   * Prevents flashing if data loads quickly
   */
  minDuration?: number;
}

const DEFAULT_SHOW_DELAY = 200; // ms
const DEFAULT_MIN_DURATION = 300; // ms

/**
 * Hook to debounce loading state to prevent UI flashes
 * Only shows loading after a delay, and keeps it shown for a minimum duration
 */
export function useDebouncedLoading(
  isLoading: boolean,
  options: UseDebouncedLoadingOptions = {}
): boolean {
  const { showDelay = DEFAULT_SHOW_DELAY, minDuration = DEFAULT_MIN_DURATION } =
    options;
  const [debouncedLoading, setDebouncedLoading] = useState(false);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingStartTimeRef = useRef<number | null>(null);
  const isCurrentlyLoadingRef = useRef(false);
  const debouncedLoadingRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    debouncedLoadingRef.current = debouncedLoading;
  }, [debouncedLoading]);

  useEffect(() => {
    // Clear any pending show timeout if loading state changes
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    if (isLoading) {
      isCurrentlyLoadingRef.current = true;
      // Start loading: wait for showDelay before showing
      showTimeoutRef.current = setTimeout(() => {
        if (isCurrentlyLoadingRef.current) {
          setDebouncedLoading(true);
          loadingStartTimeRef.current = Date.now();
        }
        showTimeoutRef.current = null;
      }, showDelay);
    } else {
      isCurrentlyLoadingRef.current = false;
      // Stop loading: ensure minimum duration
      if (debouncedLoadingRef.current && loadingStartTimeRef.current !== null) {
        const elapsed = Date.now() - loadingStartTimeRef.current;
        const remaining = Math.max(0, minDuration - elapsed);

        // Clear any pending hide timeout
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }

        hideTimeoutRef.current = setTimeout(() => {
          setDebouncedLoading(false);
          loadingStartTimeRef.current = null;
          hideTimeoutRef.current = null;
        }, remaining);
      } else {
        // If we never showed loading (was too fast), just hide immediately
        setDebouncedLoading(false);
        loadingStartTimeRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isLoading, showDelay, minDuration]);

  return debouncedLoading;
}
