import { redirect } from "react-router";
import type { Route } from "./+types/index";

export async function loader({ params }: Route.LoaderArgs) {
  const turfId = params.turfId;
  return redirect(`/turf/${turfId}/book/step-select-slot`);
}
