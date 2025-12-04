import { cn } from "~/lib/utils";

export const getInputClass = (value: string) =>
  cn(
    "bg-stone-50 border-stone-300/80 text-stone-500 focus:bg-white focus:ring-2 focus:ring-green-700/80",
    value && value.trim() !== "" && "bg-white"
  );

/**
 * Masks a card number showing only the last 4 digits.
 * @param cardNumber The full card number
 * @returns Masked card number in format "**** **** **** 1234"
 */
export const maskCardNumber = (cardNumber: string): string => {
  if (cardNumber.length < 4) return cardNumber;
  return `**** **** **** ${cardNumber.slice(-4)}`;
};

/**
 * Formats an already-masked card number into readable groups of 4 characters.
 * Handles variable-length card numbers (13-19 digits) by grouping into 4-character chunks.
 * 
 * @param maskedCardNumber The already-masked card number (last 4 digits visible)
 * @returns Formatted masked card number with spaces in groups of 4
 */
export const formatMaskedCardNumber = (maskedCardNumber: string): string => {
  if (!maskedCardNumber) return maskedCardNumber;
  
  // Remove any existing spaces
  const cleaned = maskedCardNumber.replace(/\s/g, "");
  
  // Group into chunks of 4 characters (handles variable-length cards)
  const chunks: string[] = [];
  for (let i = 0; i < cleaned.length; i += 4) {
    chunks.push(cleaned.slice(i, i + 4));
  }
  
  return chunks.join(" ");
};

/**
 * Filters input to allow only English alphabets and converts to uppercase.
 * Used for fields like state codes.
 * @param value The input value
 * @returns Filtered value with only alphabetic characters in uppercase
 */
export const handleAlphabeticInput = (value: string): string => {
  return value.replace(/[^A-Za-z]/g, "").toUpperCase();
};

/**
 * Filters input to allow only numeric characters.
 * Used for fields like card numbers, expiry dates, and ZIP codes.
 * @param value The input value
 * @returns Filtered value with only numeric characters
 */
export const handleNumericInput = (value: string): string => {
  return value.replace(/\D/g, "");
};

/**
 * Helper function to format expiry date from ISO string to MM/YYYY
 * @param expiryDate the date to format
 * @returns the formatted date in MM/YYYY format
 */
export const formatExpiryDate = (expiryDate: string) => {
  const date = new Date(expiryDate);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return { month, year };
};
