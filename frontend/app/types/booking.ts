export type BookingSummary = {
  bookingId: number;
  startTimeUtc: string; // ISO 8601 string format
  durationMins: number;
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