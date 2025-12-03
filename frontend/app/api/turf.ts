import { format } from "date-fns";
import type { TurfReview } from "~/types/turf";
import { withBase } from "./base";
import { getAuthToken, isTokenValid } from "~/utils/auth";

function getAuthenticatedHeaders(): HeadersInit {
  const token = getAuthToken();
  if (!token || !isTokenValid(token)) {
    throw new Error("Authentication token is required or has expired");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function findTurfs() {
  const response = await fetch(withBase("/api/turf"));
  return response;
}

export async function fetchTurfDetails(turfId: number) {
  const response = await fetch(withBase(`/api/turf/${turfId}`));
  return response;
}

export async function fetchTurfImages(turfId: number) {
  const response = await fetch(withBase(`/api/turf/${turfId}/image`));
  return response;
}

export async function fetchTurfReviews(turfId: number) {
  const response = await fetch(withBase(`/api/turf/${turfId}/review`));
  return response;
}

export async function addTurfReview(
  turfId: number,
  review: Omit<TurfReview, "username">
) {
  const headers = getAuthenticatedHeaders();

  const response = await fetch(withBase(`/api/turf/${turfId}/review`), {
    headers,
    body: JSON.stringify(review),
    method: "POST",
  });
  return response;
}

export async function updateTurfReview(
  turfId: number,
  review: Omit<TurfReview, "username">
) {
  const headers = getAuthenticatedHeaders();

  const response = await fetch(withBase(`/api/turf/${turfId}/review`), {
    headers,
    body: JSON.stringify(review),
    method: "PUT",
  });
  return response;
}

export async function deleteTurfReview(turfId: number) {
  const headers = getAuthenticatedHeaders();

  const response = await fetch(withBase(`/api/turf/${turfId}/review`), {
    headers,
    method: "DELETE",
  });
  return response;
}

export async function fetchTurfFeatures(turfId: number) {
  const response = await fetch(withBase(`/api/turf/${turfId}/feature`));
  return response;
}

export async function fetchAvailableStartTimes(
  turfId: number,
  date: Date
) {
  const headers = getAuthenticatedHeaders();
  const dateString = format(date, "yyyy-MM-dd");
  const response = await fetch(
    withBase(`/api/turf/${turfId}/available-start-times?date=${dateString}`),
    {
      method: "GET",
      headers,
    }
  );
  return response;
}

export async function fetchAvailableEndTimes(
  turfId: number,
  date: Date,
  startTime: string // Time string (HH:mm:ss)
) {
  const headers = getAuthenticatedHeaders();
  const dateString = format(date, "yyyy-MM-dd");
  const response = await fetch(
    withBase(
      `/api/turf/${turfId}/available-end-times?date=${dateString}&startTime=${startTime}`
    ),
    {
      method: "GET",
      headers,
    }
  );
  return response;
}

export async function bookTurf(
  turfId: number,
  bookingRequest: {
    startTimeUtc: string; // ISO 8601 datetime string
    endTimeUtc: string; // ISO 8601 datetime string
    cardId: number;
    couponId?: number | null;
  }
) {
  const headers = getAuthenticatedHeaders();

  const response = await fetch(withBase(`/api/turf/${turfId}/book`), {
    headers,
    method: "POST",
    body: JSON.stringify(bookingRequest),
  });
  return response;
}
