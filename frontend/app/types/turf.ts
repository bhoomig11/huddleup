import type { Address } from "./shared";

export type TurfDetails = {
  turfId: number;
  turfName: string;
  turfDescription: string;
  sportName: string;
  floorWidth: number;
  floorLength: number;
  floorMaterial: string;
  hourlyRate: number;
  averageRating: number;
  numberOfRatings: number;
  opensAtLocalTime: string;
  closesAtLocalTime: string;
  address: Address;
  images: Array<string>;
};

export type TurfSummary = Pick<
  TurfDetails,
  | "turfId"
  | "turfName"
  | "sportName"
  | "hourlyRate"
  | "averageRating"
  | "numberOfRatings"
  | "address"
> & { imageUrl: string };
