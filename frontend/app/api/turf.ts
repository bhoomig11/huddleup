import { withBase } from "./base";

export async function findTurfs() {
  const response = await fetch(withBase("/api/turf"));
  return response;
}

export async function fetchTurfDetails(turfId: number) {
  const response = await fetch(withBase(`/api/turf/${turfId}`));
  return response;
}
