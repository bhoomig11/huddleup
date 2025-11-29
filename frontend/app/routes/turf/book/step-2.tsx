"use client";

import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { CreditCard, CheckCircle2 } from "lucide-react";

export default function BookStep2() {
  const navigate = useNavigate();
  const params = useParams();
  const turfId = params.turfId;

  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  // Mock cards - will be replaced with actual API call
  const cards = [
    {
      id: "card-1",
      last4: "4242",
      brand: "Visa",
      expiryMonth: 12,
      expiryYear: 25,
    },
    {
      id: "card-2",
      last4: "5555",
      brand: "Mastercard",
      expiryMonth: 8,
      expiryYear: 26,
    },
  ];

  const handleNext = () => {
    if (!selectedCard) return;
    navigate(`/turf/${turfId}/book/step-3`);
  };

  const handleBack = () => {
    navigate(`/turf/${turfId}/book/step-1`);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Select Payment Method</CardTitle>
        <CardDescription>Choose a card to pay with</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cards List */}
        <div className="space-y-3">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => setSelectedCard(card.id)}
              className={`relative flex w-full items-center gap-4 rounded-lg border-2 p-4 transition-all ${
                selectedCard === card.id
                  ? "border-green-700 bg-green-50"
                  : "border-stone-200 bg-white hover:border-stone-300"
              }`}
            >
              <CreditCard className="size-6 shrink-0 text-stone-600" />
              <div className="flex flex-1 flex-col text-left">
                <p className="font-semibold text-stone-700">
                  {card.brand} ending in {card.last4}
                </p>
                <p className="text-sm text-stone-500">
                  Expires {card.expiryMonth}/{card.expiryYear}
                </p>
              </div>
              {selectedCard === card.id && (
                <CheckCircle2 className="size-6 shrink-0 text-green-700" />
              )}
            </button>
          ))}
        </div>

        {/* Add New Card Option */}
        <button className="w-full rounded-lg border-2 border-dashed border-stone-300 p-4 text-sm font-semibold text-green-700 transition-all hover:border-green-700 hover:bg-green-50 active:bg-green-100">
          + Add New Card
        </button>

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={handleBack}>
            Back
          </Button>
          <Button
            variant="default"
            className="flex-1 bg-green-700 hover:bg-green-600"
            disabled={!selectedCard}
            onClick={handleNext}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
