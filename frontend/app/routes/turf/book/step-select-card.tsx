import { useMemo, useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
  useRevalidator,
  data,
} from "react-router";
import type { Route } from "./+types/step-select-card";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { AddCardDialog } from "~/routes/user/components/add-card";
import { getAllCardDetails } from "~/api/user";
import { authContext } from "~/middleware/auth-middleware";
import { redirectToLogin } from "~/utils/auth-errors";
import { CardSelectionButton } from "./components/card-selection-button";
import type { CardDetail } from "~/types/card";

export async function clientLoader({
  context,
  request,
}: Route.ClientLoaderArgs) {
  const auth = context.get(authContext);
  if (auth === null) {
    const currentPath = new URL(request.url).pathname;
    redirectToLogin(currentPath);
  }

  const username = auth!.username;
  const response = await getAllCardDetails(username);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw data(errorData.message || "Error fetching card details", {
      status: response.status,
    });
  }

  const cards = (await response.json()) as Array<CardDetail>;
  return { cards, username };
}

function parseCardIdFromQuery(
  searchParams: URLSearchParams,
  validCardIds: number[]
): number | null {
  const cardIdParam = searchParams.get("cardId");
  if (!cardIdParam) return null;

  const cardId = Number.parseInt(cardIdParam, 10);
  if (Number.isNaN(cardId) || !validCardIds.includes(cardId)) {
    return null;
  }

  return cardId;
}

export default function SelectPaymentMethod({
  loaderData,
}: Route.ComponentProps) {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();
  const turfId = Number.parseInt(params.turfId ?? "");
  const { cards, username } = loaderData;

  const selectedCardId = useMemo(
    () =>
      parseCardIdFromQuery(
        searchParams,
        cards.map((card) => card.cardId)
      ),
    [searchParams, cards]
  );

  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false);

  const updateSearchParams = (cardId: number | null) => {
    const currentCardId = searchParams.get("cardId");
    const newCardId = cardId?.toString() ?? null;

    if (currentCardId !== newCardId) {
      const newParams = new URLSearchParams(searchParams);
      if (newCardId) {
        newParams.set("cardId", newCardId);
      } else {
        newParams.delete("cardId");
      }
      setSearchParams(newParams, { preventScrollReset: true, replace: true });
    }
  };

  const handleCardSelection = (cardId: number) => {
    updateSearchParams(cardId);
  };

  const handleCardAdded = () => {
    revalidator.revalidate();
  };

  const isComplete = selectedCardId !== null;

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
          <CardDescription>Choose a card to pay with</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cards List */}
          {cards.length === 0 ? (
            <p className="text-center text-stone-500">
              No saved payment methods. Please add a card to continue.
            </p>
          ) : (
            <div className="space-y-3">
              {cards.map((card) => (
                <CardSelectionButton
                  key={card.cardId}
                  card={card}
                  isSelected={selectedCardId === card.cardId}
                  onSelect={() => handleCardSelection(card.cardId)}
                />
              ))}
            </div>
          )}

          <button
            onClick={() => setIsAddCardDialogOpen(true)}
            className="w-full rounded-lg border-2 border-dashed border-stone-300 p-4 text-sm font-semibold text-green-700 transition-all hover:border-green-700 hover:bg-green-50 active:bg-green-100"
          >
            + Add New Card
          </button>

          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" asChild>
              <Link
                to={`/turf/${turfId}/book/step-select-slot?${searchParams.toString()}`}
              >
                Back
              </Link>
            </Button>
            {isComplete ? (
              <Button
                variant="default"
                className="flex-1 bg-green-700 hover:bg-green-600"
                asChild
              >
                <Link
                  to={`/turf/${turfId}/book/step-3?${searchParams.toString()}`}
                >
                  Next
                </Link>
              </Button>
            ) : (
              <Button
                variant="default"
                className="flex-1 bg-green-700 hover:bg-green-600"
                disabled
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Card Dialog */}
      <AddCardDialog
        open={isAddCardDialogOpen}
        onOpenChange={setIsAddCardDialogOpen}
        username={username}
        onCardAdded={handleCardAdded}
      />
    </>
  );
}
