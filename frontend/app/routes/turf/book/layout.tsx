import { Outlet, data } from "react-router";
import type { Route } from "./+types/layout";
import { BookingStepper } from "./booking-stepper";
import { fetchTurfDetails } from "~/api/turf";
import { getAllCardDetails } from "~/api/user";
import { authContext } from "~/middleware/auth-middleware";
import { redirectToLogin } from "~/utils/auth-errors";
import type { TurfDetails } from "~/types/turf";
import type { CardDetail } from "~/types/card";

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
    const invalidTurfIdMessage =
      "Invalid turf ID! Expected a number, received: " + params.turfId;
    throw data(invalidTurfIdMessage, { status: 400 });
  }

  const username = auth!.username;

  // Fetch both turf details and card details in parallel
  const [turfResponse, cardsResponse] = await Promise.all([
    fetchTurfDetails(turfId),
    getAllCardDetails(username),
  ]);

  if (!turfResponse.ok) {
    throw data("Error fetching turf details", {
      status: turfResponse.status,
    });
  }

  if (!cardsResponse.ok) {
    const errorData = await cardsResponse.json().catch(() => ({}));
    throw data(errorData.message || "Error fetching card details", {
      status: cardsResponse.status,
    });
  }

  const turfDetails = (await turfResponse.json()) as TurfDetails;
  const cards = (await cardsResponse.json()) as Array<CardDetail>;

  return { turfDetails, cards, username };
}

export default function BookLayout() {
  return (
    <main className="flex w-full flex-col items-center py-8">
      <div className="w-full max-w-4xl px-4">
        <BookingStepper />
        <Outlet />
      </div>
    </main>
  );
}
