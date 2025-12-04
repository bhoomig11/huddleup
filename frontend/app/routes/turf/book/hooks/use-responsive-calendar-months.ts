import { useState, useEffect } from "react";

const RESPONSIVE_CALENDAR_CONFIG = {
  breakpoints: {
    xl: 1280, // xl and above: show 3 months
    md: 768, // md to lg: show 2 months
  },
  months: {
    default: 1,
    md: 2,
    xl: 3,
  },
} as const;

export function useResponsiveCalendarMonths() {
  const [numberOfMonths, setNumberOfMonths] = useState<number>(
    RESPONSIVE_CALENDAR_CONFIG.months.default
  );

  useEffect(() => {
    const updateNumberOfMonths = () => {
      const width = window.innerWidth;
      if (width >= RESPONSIVE_CALENDAR_CONFIG.breakpoints.xl) {
        setNumberOfMonths(RESPONSIVE_CALENDAR_CONFIG.months.xl);
      } else if (width >= RESPONSIVE_CALENDAR_CONFIG.breakpoints.md) {
        setNumberOfMonths(RESPONSIVE_CALENDAR_CONFIG.months.md);
      } else {
        setNumberOfMonths(RESPONSIVE_CALENDAR_CONFIG.months.default);
      }
    };

    // Set initial value
    updateNumberOfMonths();

    // Update on resize
    window.addEventListener("resize", updateNumberOfMonths);
    return () => window.removeEventListener("resize", updateNumberOfMonths);
  }, []);

  return numberOfMonths;
}
