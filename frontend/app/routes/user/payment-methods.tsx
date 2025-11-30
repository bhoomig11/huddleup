import { useState } from "react";
import { useParams, useRevalidator } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { AddCardDialog } from "~/routes/user/components/add-card";
import { ViewCardDialog } from "~/routes/user/components/view-card";
import { ProfileSidebar } from "~/routes/user/components/profile-sidebar";
import { getAllCardDetails, deleteCardDetail } from "~/api/user";
import { maskCardNumber } from "~/routes/user/utils";
import { data, redirect } from "react-router";
import type { CardDetail } from "~/types/card";
import type { Route } from "./+types/payment-methods";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const username = params.username;
  if (!username) {
    // throw data("Username is required", { status: 400 });
    throw redirect("/login");
  }

  const response = await getAllCardDetails(username);
  if (!response.ok) {
    // Let backend errors come through
    const errorData = await response.json().catch(() => ({}));
    throw data(
      errorData.message || "Error fetching card details",
      { status: response.status }
    );
  }
  const cards = (await response.json()) as Array<CardDetail>;
  return cards;
}

export default function PaymentMethodsPage({
  loaderData: cards,
}: Route.ComponentProps) {
  const { username } = useParams<{ username: string }>();
  const revalidator = useRevalidator();
  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false);
  const [viewCardDialogOpen, setViewCardDialogOpen] = useState<number | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleCardAdded = () => {
    // Refresh the cards list after adding a new card
    revalidator.revalidate();
  };

  const handleDeleteCard = async (cardId: number) => {
    if (!username) {
      return;
    }

    setDeletingCardId(cardId);
    setDeleteError(null);

    try {
      const response = await deleteCardDetail(username, cardId);

      if (!response.ok) {
        // Let backend errors come through
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to delete card: ${response.statusText}`
        );
      }

      // Success - refresh the cards list
      revalidator.revalidate();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete card"
      );
    } finally {
      setDeletingCardId(null);
    }
  };

  // Helper function to format expiry date from ISO string to MM/YYYY
  const formatExpiryDate = (expiryDate: string) => {
    const date = new Date(expiryDate);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());
    return { month, year };
  };

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="flex flex-row w-full max-w-7xl mx-auto">
        {/* ---------------- LEFT PANEL ---------------- */}
        <ProfileSidebar />

        {/* ---------------- RIGHT PANEL ---------------- */}
        <div className="basis-3/4 min-h-screen p-10">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-stone-600">Saved Cards</h2>

            {deleteError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {deleteError}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-auto p-0 text-red-800 hover:text-red-900"
                  onClick={() => setDeleteError(null)}
                >
                  ×
                </Button>
              </div>
            )}

            {cards.length === 0 ? (
              <p className="text-gray-500">No saved cards found.</p>
            ) : (
              cards.map((card, index) => {
                const expiry = formatExpiryDate(card.expiryDate);
                const isDeleting = deletingCardId === card.cardId;
                return (
                  <Card key={card.cardId} className="p-4">
                    <CardContent className="space-y-1">
                      <p className="font-medium text-gray-500">
                        Name on Card: {card.nameOnCard}
                      </p>
                      <p className="text-gray-500">
                        Card Number: {maskCardNumber(card.cardNumber)}
                      </p>
                      <p className="text-gray-500">
                        Expiry: {expiry.month}/{expiry.year}
                      </p>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewCardDialogOpen(index)}
                          disabled={isDeleting}
                        >
                          View Card
                        </Button>
                        <Button
                          size="sm"
                          className="bg-black text-white hover:bg-red-600 active:bg-red-700"
                          onClick={() => handleDeleteCard(card.cardId)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}

            <div className="flex justify-end">
              <Button 
                className="bg-green-700"
                onClick={() => setIsAddCardDialogOpen(true)}
              >
                Add Payment Method
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Card Dialog */}
      <AddCardDialog
        open={isAddCardDialogOpen}
        onOpenChange={setIsAddCardDialogOpen}
        username={username!}
        onCardAdded={handleCardAdded}
      />

      {/* View Card Dialogs */}
      {cards.map((card, index) => {
        const expiry = formatExpiryDate(card.expiryDate);
        return (
          <ViewCardDialog
            key={card.cardId}
            open={viewCardDialogOpen === index}
            onOpenChange={(open) => setViewCardDialogOpen(open ? index : null)}
            cardData={{
              cardNumber: card.cardNumber,
              nameOnCard: card.nameOnCard,
              expiryMonth: expiry.month,
              expiryYear: expiry.year,
              addressLine1: card.billingAddress.streetLine1,
              addressLine2: card.billingAddress.streetLine2,
              town: card.billingAddress.town,
              state: card.billingAddress.state,
              zipCode: card.billingAddress.zipcode,
            }}
          />
        );
      })}
    </main>
  );
}

