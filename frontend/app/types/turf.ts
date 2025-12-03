import type { BookingSummary } from "./booking";
import type { Address } from "./shared";

/**
 * Turf details as returned by the API endpoint.
 * This is the base turf information without extended data (images, features, reviews).
 */
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
};

/**
 * Extended turf details including images, features, and reviews.
 * This is the combined type used on the turf detail page.
 */
export type TurfDetailsWithExtras = TurfDetails & {
  images: Array<string>;
  features: Array<TurfFeature>;
  userReview: TurfReview | null;
  otherReviews: Array<TurfReview>;
  canUserReview: boolean;
  latestBooking: BookingSummary | null;
};

export type TurfReview = {
  username: string;
  rating: number;
  review: string | null;
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

export type TurfFeature = {
  featureName: string;
  featureDescription: string | null;
};
