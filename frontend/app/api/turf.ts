import type { TurfReview } from "~/types/turf";
import { withBase } from "./base";
import type { Auth } from "~/types/auth";

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
  review: Omit<TurfReview, "username">,
  auth: Auth
) {
  const response = await fetch(withBase(`/api/turf/${turfId}/review`), {
    headers: {
      Authorization: `Bearer ${auth.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(review),
    method: "POST",
  });
  return response;
}
