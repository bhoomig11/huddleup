/**
 * Formats a Date object to yyyy-MM-dd format using local date components.
 * This avoids timezone conversion issues by using the local year, month, and day.
 *
 * @param date - The Date object to format
 * @returns Date string in yyyy-MM-dd format (local date, not UTC)
 */
export function formatDateToLocalString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parses a date string (yyyy-MM-dd) into a Date object at local midnight.
 * This ensures the Date object represents the correct local date without timezone shifts.
 *
 * @param dateString - Date string in yyyy-MM-dd format
 * @returns Date object at local midnight for the given date
 */
export function parseLocalDateString(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Validates that a date string is in the correct format (yyyy-MM-dd) and represents a valid date.
 *
 * @param dateString - Date string to validate
 * @returns true if the date string is valid, false otherwise
 */
export function isValidDateString(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }

  const date = parseLocalDateString(dateString);
  const [year, month, day] = dateString.split("-").map(Number);
  return (
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
}
