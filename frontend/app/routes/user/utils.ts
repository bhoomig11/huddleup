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

