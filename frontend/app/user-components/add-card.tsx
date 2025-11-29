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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="card-number">Card Number</Label>
            <Input
              id="card-number"
              type="text"
              placeholder="Enter card number"
              value={cardNumber}
              onChange={(e) =>
                setCardNumber(handleNumericInput(e.target.value))
              }
            />
          </div>

          {/* Name on Card */}
          <div className="space-y-2">
            <Label htmlFor="name-on-card">Name on Card</Label>
            <Input
              id="name-on-card"
              type="text"
              placeholder="Enter name on card"
              value={nameOnCard}
              onChange={(e) => setNameOnCard(e.target.value)}
            />
          </div>

          {/* Expiry Month and Year */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="expiry-month">Expiry Month (MM)</Label>
              <Input
                id="expiry-month"
                type="text"
                placeholder="MM"
                maxLength={2}
                value={expiryMonth}
                onChange={(e) =>
                  setExpiryMonth(handleNumericInput(e.target.value))
                }
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="expiry-year">Expiry Year (YYYY)</Label>
              <Input
                id="expiry-year"
                type="text"
                placeholder="YYYY"
                maxLength={4}
                value={expiryYear}
                onChange={(e) =>
                  setExpiryYear(handleNumericInput(e.target.value))
                }
              />
            </div>
          </div>

          {/* Address Line 1 */}
          <div className="space-y-2">
            <Label htmlFor="address-line-1">Address Line 1</Label>
            <Input
              id="address-line-1"
              type="text"
              placeholder="Enter address line 1"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
            />
          </div>

          {/* Address Line 2 */}
          <div className="space-y-2">
            <Label htmlFor="address-line-2">Address Line 2</Label>
            <Input
              id="address-line-2"
              type="text"
              placeholder="Enter address line 2 (optional)"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
            />
          </div>

          {/* Town, State, ZIP */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="town">Town</Label>
              <Input
                id="town"
                type="text"
                placeholder="Enter town"
                value={town}
                onChange={(e) => setTown(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                type="text"
                placeholder="State"
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="zip-code">ZIP Code</Label>
              <Input
                id="zip-code"
                type="text"
                placeholder="ZIP"
                maxLength={5}
                value={zipCode}
                onChange={(e) => setZipCode(handleNumericInput(e.target.value))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
