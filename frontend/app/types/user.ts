import type { Address } from "./shared";

export type UserProfile = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string | null; // ISO date string from backend
  address: Address;
};
