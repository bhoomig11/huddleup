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
import { getInputClass, maskCardNumber } from "~/routes/user/utils";

interface ViewCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardData: {
    cardNumber: string;
    nameOnCard: string;
    expiryMonth: string;
    expiryYear: string;
    addressLine1: string;
    addressLine2: string;
    town: string;
    state: string;
    zipCode: string;
  };
}

export function ViewCardDialog({ open, onOpenChange, cardData }: ViewCardDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-stone-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-semibold text-stone-600">Card Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="view-card-number" className="text-stone-600">
              Card Number
            </Label>
            <Input
              id="view-card-number"
              type="text"
              value={maskCardNumber(cardData.cardNumber)}
              className={getInputClass(maskCardNumber(cardData.cardNumber))}
              disabled
            />
          </div>

          {/* Name on Card */}
          <div className="space-y-2">
            <Label htmlFor="view-name-on-card" className="text-stone-600">
              Name on Card
            </Label>
            <Input
              id="view-name-on-card"
              type="text"
              value={cardData.nameOnCard}
              className={getInputClass(cardData.nameOnCard)}
              disabled
            />
          </div>

          {/* Expiry Month and Year */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="view-expiry-month" className="text-stone-600">
                Expiry Month (MM)
              </Label>
              <Input
                id="view-expiry-month"
                type="text"
                value={cardData.expiryMonth}
                className={getInputClass(cardData.expiryMonth)}
                disabled
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="view-expiry-year" className="text-stone-600">
                Expiry Year (YYYY)
              </Label>
              <Input
                id="view-expiry-year"
                type="text"
                value={cardData.expiryYear}
                className={getInputClass(cardData.expiryYear)}
                disabled
              />
            </div>
          </div>

          {/* Billing Address Header */}
          <div className="pt-2">
            <h3 className="text-lg font-semibold text-stone-600">Billing Address</h3>
          </div>

          {/* Address Line 1 */}
          <div className="space-y-2">
            <Label htmlFor="view-address-line-1" className="text-stone-600">
              Address Line 1
            </Label>
            <Input
              id="view-address-line-1"
              type="text"
              value={cardData.addressLine1}
              className={getInputClass(cardData.addressLine1)}
              disabled
            />
          </div>

          {/* Address Line 2 */}
          <div className="space-y-2">
            <Label htmlFor="view-address-line-2" className="text-stone-600">
              Address Line 2
            </Label>
            <Input
              id="view-address-line-2"
              type="text"
              value={cardData.addressLine2}
              className={getInputClass(cardData.addressLine2)}
              disabled
            />
          </div>

          {/* Town, State, ZIP */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="view-town" className="text-stone-600">
                Town
              </Label>
              <Input
                id="view-town"
                type="text"
                value={cardData.town}
                className={getInputClass(cardData.town)}
                disabled
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="view-state" className="text-stone-600">
                State
              </Label>
              <Input
                id="view-state"
                type="text"
                value={cardData.state}
                className={getInputClass(cardData.state)}
                disabled
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="view-zip-code" className="text-stone-600">
                ZIP Code
              </Label>
              <Input
                id="view-zip-code"
                type="text"
                value={cardData.zipCode}
                className={getInputClass(cardData.zipCode)}
                disabled
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="text-stone-600"
            onClick={handleClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

