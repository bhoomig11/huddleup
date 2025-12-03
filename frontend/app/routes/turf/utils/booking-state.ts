/**
 * Utility functions for managing booking state across the booking flow.
 * Uses sessionStorage to persist booking data between steps.
 */

/**
 * Complete booking state with all required fields for final booking submission.
 */
export interface BookingState {
  turfId: number;
  date: string; // ISO date string (YYYY-MM-DD)
  fromTime: string; // Time string (HH:mm)
  toTime: string; // Time string (HH:mm)
  cardId: number; // Required for booking submission
  couponId?: number; // Optional coupon
}

/**
 * Utility type to make specific fields optional.
 * Useful for intermediate steps where cardId hasn't been selected yet.
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Booking state for step 1 (select slot) - cardId is optional
 */
export type Step1BookingState = Optional<BookingState, "cardId" | "couponId">;

/**
 * Booking state for step 2 (select payment) - cardId is optional, couponId is optional
 */
export type Step2BookingState = Optional<BookingState, "couponId">;

const BOOKING_STATE_KEY = "huddleup_booking_state";

/**
 * Save booking state to sessionStorage.
 * Accepts partial state to allow incremental updates.
 */
export function saveBookingState(
  state: Partial<BookingState>
): void {
  const existing = getBookingState();
  const updated = { ...existing, ...state };
  sessionStorage.setItem(BOOKING_STATE_KEY, JSON.stringify(updated));
}

/**
 * Get booking state from sessionStorage.
 * Returns partial state since it may be incomplete during the booking flow.
 */
export function getBookingState(): Partial<BookingState> | null {
  const stored = sessionStorage.getItem(BOOKING_STATE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as Partial<BookingState>;
  } catch {
    return null;
  }
}

/**
 * Get complete booking state from sessionStorage.
 * Returns null if any required fields are missing.
 */
export function getCompleteBookingState(): BookingState | null {
  const state = getBookingState();
  if (
    !state ||
    state.turfId === undefined ||
    !state.date ||
    !state.fromTime ||
    !state.toTime ||
    state.cardId === undefined
  ) {
    return null;
  }
  return state as BookingState;
}

/**
 * Clear booking state from sessionStorage
 */
export function clearBookingState(): void {
  sessionStorage.removeItem(BOOKING_STATE_KEY);
}

/**
 * Get booking state for a specific turf.
 * Returns partial state since it may be incomplete during the booking flow.
 */
export function getBookingStateForTurf(
  turfId: number
): Partial<BookingState> | null {
  const state = getBookingState();
  if (!state || state.turfId !== turfId) return null;
  return state;
}

