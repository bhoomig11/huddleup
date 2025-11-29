import type { Address } from "./shared";

export type TurfSummary = {
  turfId: number;
  turfName: string;
  imageUrl: string;
  sportName: string;
  hourlyRate: number;
  averageRating: number;
  numberOfRatings: number;
  address: Address;
};
