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

