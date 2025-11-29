import { withBase } from "./base";

export async function findTurfs() {
  const response = await fetch(withBase("/api/turf"));
  return response;
}
