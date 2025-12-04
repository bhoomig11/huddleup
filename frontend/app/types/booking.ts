export type BookingSummary = {
  bookingId: number;
  startTimeLocal: string; // ISO 8601 string format (turf's local time, no timezone)
  endTimeLocal: string; // ISO 8601 string format (turf's local time, no timezone)
  amount: number;
  complaintSubject: string | null;
  complaintDescription: string | null;
  complaintFiledAtUtc: string | null; // ISO 8601 string format
  complaintResolvedAtUtc: string | null; // ISO 8601 string format
  turfId: number;
  turfName: string;
  username: string;
  maskedCardNumber: string | null;
  couponId: number | null;
};

/**
 * Response payload for booking a turf.
 * This is returned by the booking API endpoint after a successful booking creation.
 */
export interface BookingResponse {
  bookingId: number;
}
