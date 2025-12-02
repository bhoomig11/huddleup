import type { Address } from "./shared";

export type CardDetail = {
  cardId: number;
  cardNumber: string;
  nameOnCard: string;
  expiryDate: string; // ISO date string from backend
  billingAddress: Address;
};

