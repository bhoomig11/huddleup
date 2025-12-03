import type { TurfReview } from "~/types/turf";
import { withBase } from "./base";
import { getAuthToken } from "~/utils/auth";

function getAuthenticatedHeaders(): HeadersInit {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication token is required");
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
