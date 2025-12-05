import { data } from "react-router";
import type { Route } from "./+types/available-start-times";
import { fetchAvailableStartTimes } from "~/api/turf";
import { authContext } from "~/middleware/auth-middleware";
import { redirectToLogin } from "~/utils/auth-errors";
import { isValidDateString } from "./book/utils/date-utils";

export async function clientLoader({
  context,
  params,
  request,
}: Route.ClientLoaderArgs) {
  const auth = context.get(authContext);
  if (auth === null) {
    const currentPath = new URL(request.url).pathname;
    redirectToLogin(currentPath);
  }

  const turfId = Number.parseInt(params.turfId ?? "");
  if (Number.isNaN(turfId)) {
    throw data("Invalid turf ID", { status: 400 });
  }

  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date");
  if (!dateParam) {
    throw data("Date parameter is required", { status: 400 });
  }

  // Validate date string format and ensure it represents a valid date
  if (!isValidDateString(dateParam)) {
    throw data("Invalid date format or date value. Expected yyyy-MM-dd", {
      status: 400,
    });
  }

  const response = await fetchAvailableStartTimes(turfId, dateParam);
  if (!response.ok) {
    throw data("Failed to fetch available start times", {
      status: response.status,
    });
  }

  const times = (await response.json()) as string[];
  return times;
}
