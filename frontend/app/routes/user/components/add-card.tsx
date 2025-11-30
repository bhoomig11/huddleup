import { useState } from "react";
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

interface AddCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCardDialog({ open, onOpenChange }: AddCardDialogProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [town, setTown] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");

  // Helper function to allow only numeric input
  const handleNumericInput = (value: string) => {
    return value.replace(/\D/g, "");
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

  const handleCancel = () => {
    // Reset form
    setCardNumber("");
    setNameOnCard("");
    setExpiryMonth("");
    setExpiryYear("");
    setAddressLine1("");
    setAddressLine2("");
    setTown("");
    setState("");
    setZipCode("");
    onOpenChange(false);
  };

  const handleSave = () => {
    // TODO: Add API call to add card for the user
    // Reset form after save
    setCardNumber("");
    setNameOnCard("");
    setExpiryMonth("");
    setExpiryYear("");
    setAddressLine1("");
    setAddressLine2("");
    setTown("");
    setState("");
    setZipCode("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-stone-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-semibold text-stone-600">Add Payment Method</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="card-number" className="text-stone-600">Card Number</Label>
            <Input
              id="card-number"
              type="text"
              placeholder="Enter card number"
              value={cardNumber}
              className={getInputClass(cardNumber)}
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
                onChange={(e) =>
                  setExpiryYear(handleNumericInput(e.target.value))
                }
              />
            </div>
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
                onChange={(e) => setState(e.target.value)}
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
                onChange={(e) => setZipCode(handleNumericInput(e.target.value))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="text-stone-600" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-green-700" disabled={!isFormValid}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
