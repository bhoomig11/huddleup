import { redirect } from "react-router";
import type { Route } from "./+types/index";

export async function loader({ params, request }: Route.LoaderArgs) {
  const turfId = params.turfId;
  const url = new URL(request.url);

  const redirectUrl = new URL(
    `/turf/${turfId}/book/step-select-slot`,
    url.origin
  );

  const date = url.searchParams.get("date");
  const fromTime = url.searchParams.get("fromTime");
  const toTime = url.searchParams.get("toTime");

  if (date && fromTime && toTime) {
    redirectUrl.searchParams.set("date", date);
    redirectUrl.searchParams.set("fromTime", fromTime);
    redirectUrl.searchParams.set("toTime", toTime);
  }

  return redirect(redirectUrl.pathname + redirectUrl.search);
}
