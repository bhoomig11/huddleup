import { useMemo, useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
  useRevalidator,
  useRouteLoaderData,
} from "react-router";
import type { Route } from "./+types/step-select-card";
import type { CardDetail } from "~/types/card";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { AddCardDialog } from "~/routes/user/components/add-card";
import { CardSelectionButton } from "./components/card-selection-button";
import { clientLoader } from "./layout";

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

export default function SelectPaymentMethod() {
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();
  const layoutData = useRouteLoaderData<typeof clientLoader>(
    "routes/turf/book/layout"
  );

  const username = layoutData?.username;
  if (!username) {
    throw new Error("Username not found");
  }

  const turfId = layoutData?.turfDetails.turfId;
  if (!turfId) {
    throw new Error("Turf ID not found");
  }

  const cards = layoutData?.cards ?? [];
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
                  to={`/turf/${turfId}/book/step-review?${searchParams.toString()}`}
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
