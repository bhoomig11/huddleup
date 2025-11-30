import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { getInputClass } from "~/routes/user/utils";
import { addCardDetail } from "~/api/user";

interface AddCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  onCardAdded?: () => void;
}

export function AddCardDialog({
  open,
  onOpenChange,
  username,
  onCardAdded,
}: AddCardDialogProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [town, setTown] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setError(null);
    }
  }, [open]);

  // Helper function to allow only numeric input
  const handleNumericInput = (value: string) => {
    return value.replace(/\D/g, "");
  };

  // Helper function to allow only English alphabets (letters)
  const handleAlphabeticInput = (value: string) => {
    return value.replace(/[^A-Za-z]/g, "").toUpperCase();
  };

  // Check if all required fields are filled
  const isFormValid =
    cardNumber.trim() !== "" &&
    nameOnCard.trim() !== "" &&
    expiryMonth.trim() !== "" &&
    expiryYear.trim() !== "" &&
    addressLine1.trim() !== "" &&
    town.trim() !== "" &&
    state.trim() !== "" &&
    zipCode.trim() !== "";

  const resetForm = () => {
    setCardNumber("");
    setNameOnCard("");
    setExpiryMonth("");
    setExpiryYear("");
    setAddressLine1("");
    setAddressLine2("");
    setTown("");
    setState("");
    setZipCode("");
    setError(null);
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSave = async () => {
    if (!isFormValid) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await addCardDetail(
        username,
        cardNumber,
        nameOnCard,
        expiryMonth,
        expiryYear,
        {
          streetLine1: addressLine1,
          streetLine2: addressLine2,
          town,
          state,
          zipcode: zipCode,
        }
      );

      if (!response.ok) {
        // Let backend errors come through
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to add card: ${response.statusText}`
        );
      }

      // Success - reset form, close dialog, and refresh cards
      resetForm();
      onOpenChange(false);
      if (onCardAdded) {
        onCardAdded();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add card");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-stone-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-semibold text-stone-600">Add Payment Method</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="card-number" className="text-stone-600">Card Number</Label>
            <Input
              id="card-number"
              type="text"
              placeholder="Enter card number"
              value={cardNumber}
              className={getInputClass(cardNumber)}
              disabled={isSubmitting}
              onChange={(e) =>
                setCardNumber(handleNumericInput(e.target.value))
              }
            />
          </div>

          {/* Name on Card */}
          <div className="space-y-2">
            <Label htmlFor="name-on-card" className="text-stone-600">Name on Card</Label>
            <Input
              id="name-on-card"
              type="text"
              placeholder="Enter name on card"
              value={nameOnCard}
              className={getInputClass(nameOnCard)}
              disabled={isSubmitting}
              onChange={(e) => setNameOnCard(e.target.value)}
            />
          </div>

          {/* Expiry Month and Year */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="expiry-month" className="text-stone-600">Expiry Month (MM)</Label>
              <Input
                id="expiry-month"
                type="text"
                placeholder="MM"
                maxLength={2}
                value={expiryMonth}
                className={getInputClass(expiryMonth)}
                disabled={isSubmitting}
                onChange={(e) =>
                  setExpiryMonth(handleNumericInput(e.target.value))
                }
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="expiry-year" className="text-stone-600">Expiry Year (YYYY)</Label>
              <Input
                id="expiry-year"
                type="text"
                placeholder="YYYY"
                maxLength={4}
                value={expiryYear}
                className={getInputClass(expiryYear)}
                disabled={isSubmitting}
                onChange={(e) =>
                  setExpiryYear(handleNumericInput(e.target.value))
                }
              />
            </div>
          </div>

          {/* Billing Address Header */}
          <div className="pt-2">
            <h3 className="text-lg font-semibold text-stone-600">Billing Address</h3>
          </div>

          {/* Address Line 1 */}
          <div className="space-y-2">
            <Label htmlFor="address-line-1" className="text-stone-600">Address Line 1</Label>
            <Input
              id="address-line-1"
              type="text"
              placeholder="Enter address line 1"
              value={addressLine1}
              className={getInputClass(addressLine1)}
              disabled={isSubmitting}
              onChange={(e) => setAddressLine1(e.target.value)}
            />
          </div>

          {/* Address Line 2 */}
          <div className="space-y-2">
            <Label htmlFor="address-line-2" className="text-stone-600">Address Line 2</Label>
            <Input
              id="address-line-2"
              type="text"
              placeholder="Enter address line 2 (optional)"
              value={addressLine2}
              className={getInputClass(addressLine2)}
              disabled={isSubmitting}
              onChange={(e) => setAddressLine2(e.target.value)}
            />
          </div>

          {/* Town, State, ZIP */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="town" className="text-stone-600">Town</Label>
              <Input
                id="town"
                type="text"
                placeholder="Enter town"
                value={town}
                className={getInputClass(town)}
                disabled={isSubmitting}
                onChange={(e) => setTown(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="state" className="text-stone-600">State</Label>
              <Input
                id="state"
                type="text"
                placeholder="State"
                maxLength={2}
                value={state}
                className={getInputClass(state)}
                disabled={isSubmitting}
                onChange={(e) => setState(handleAlphabeticInput(e.target.value))}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="zip-code" className="text-stone-600">ZIP Code</Label>
              <Input
                id="zip-code"
                type="text"
                placeholder="ZIP"
                maxLength={5}
                value={zipCode}
                className={getInputClass(zipCode)}
                disabled={isSubmitting}
                onChange={(e) => setZipCode(handleNumericInput(e.target.value))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="text-stone-600"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-green-700"
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
