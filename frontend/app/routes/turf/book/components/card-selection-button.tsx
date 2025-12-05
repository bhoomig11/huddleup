import { CreditCard, CheckCircle2 } from "lucide-react";
import { formatExpiryDate, formatMaskedCardNumber } from "~/routes/user/utils";
import type { CardDetail } from "~/types/card";

interface CardSelectionButtonProps {
  card: CardDetail;
  isSelected: boolean;
  onSelect: () => void;
}

export function CardSelectionButton({
  card,
  isSelected,
  onSelect,
}: CardSelectionButtonProps) {
  const expiry = formatExpiryDate(card.expiryDate);
  const maskedNumber = formatMaskedCardNumber(card.cardNumber);

  return (
    <button
      onClick={onSelect}
      className={`relative flex w-full gap-4 rounded-lg border-2 p-4 transition-all ${
        isSelected
          ? "border-green-700 bg-green-50"
          : "border-stone-200 bg-white hover:border-stone-300"
      }`}
    >
      <CreditCard className="size-6 shrink-0 text-stone-600" />
      <div className="flex flex-1 flex-col text-left">
        <p className="font-semibold text-stone-700">{maskedNumber}</p>
        <p className="flex flex-row items-center gap-1.5 text-sm text-stone-500">
          <span>{card.nameOnCard}</span>
          <span className="inline-block size-1 rounded-full bg-stone-500"></span>
          <span>
            Expires {expiry.month}/{expiry.year}
          </span>
        </p>
      </div>
      {isSelected && (
        <CheckCircle2 className="size-6 shrink-0 self-center text-green-700" />
      )}
    </button>
  );
}
