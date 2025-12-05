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

export async function searchTurfs(params: {
  query?: string;
  date?: string; // yyyy-MM-dd format
  fromTime?: string; // HH:mm format
  toTime?: string; // HH:mm format
}) {
  const searchParams = new URLSearchParams();
  if (params.query) {
    searchParams.append("query", params.query);
  }
  if (params.date) {
    searchParams.append("date", params.date);
  }
  if (params.fromTime) {
    searchParams.append("fromTime", params.fromTime);
  }
  if (params.toTime) {
    searchParams.append("toTime", params.toTime);
  }

  const queryString = searchParams.toString();
  const url = queryString
    ? `/api/turf/search?${queryString}`
    : "/api/turf/search";

  const response = await fetch(withBase(url));
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

export async function fetchAllFeatures() {
  const response = await fetch(withBase("/api/turf/feature"));
  return response;
}

export async function fetchAvailableStartTimes(
  turfId: number,
  dateString: string // Date string in yyyy-MM-dd format
) {
  const headers = getAuthenticatedHeaders();
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
  dateString: string, // Date string in yyyy-MM-dd format
  startTime: string // Time string (HH:mm:ss)
) {
  const headers = getAuthenticatedHeaders();
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
    date: string; // yyyy-MM-dd format
    startTime: string; // HH:mm format (local time)
    endTime: string; // HH:mm format (local time)
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
