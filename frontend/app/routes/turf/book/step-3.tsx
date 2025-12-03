"use client";

import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { AlertCircle, CreditCard, Tag } from "lucide-react";

// Available coupons
const AVAILABLE_COUPONS = [
  { code: "WELCOME10", discount: 10, description: "10% off on first booking" },
  {
    code: "WEEKDAY15",
    discount: 15,
    description: "15% off on weekday bookings",
  },
  {
    code: "BUNDLE20",
    discount: 20,
    description: "20% off on 3+ hour bookings",
  },
  { code: "FRIEND5", discount: 5, description: "$5 off referral discount" },
];

export default function BookStep3() {
  const navigate = useNavigate();
  const params = useParams();
  const turfId = params.turfId;

  const [couponCode, setCouponCode] = useState("");
  const [openCouponDialog, setOpenCouponDialog] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  // Mock selected card - will be passed from step-2
  const selectedCard = {
    id: "card-1",
    brand: "Visa",
    last4: "4242",
    expiry: "12/26",
  };

  // Mock booking details - will be fetched from context/state
  const bookingDetails = {
    turfName: "Central Sports Complex",
    date: "Friday, December 13, 2025",
    timeRange: "14:00 to 17:00",
    duration: 3,
    hourlyRate: 50.0,
  };

  const subtotal = bookingDetails.duration * bookingDetails.hourlyRate;
  const discount = appliedCoupon
    ? (subtotal * appliedCoupon.discount) / 100
    : 0;
  const tax = (subtotal - discount) * 0.1; // 10% tax
  const total = subtotal - discount + tax;

  const handleApplyCoupon = (couponToApply: string) => {
    const selectedCoupon = AVAILABLE_COUPONS.find(
      (c) => c.code.toUpperCase() === couponToApply.toUpperCase()
    );
    if (selectedCoupon) {
      setAppliedCoupon({
        code: selectedCoupon.code,
        discount: selectedCoupon.discount,
      });
      setCouponCode("");
      setOpenCouponDialog(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handleBack = () => {
    navigate(`/turf/${turfId}/book/step-2`);
  };

  const handleConfirmBooking = async () => {
    setIsConfirming(true);
    try {
      // TODO: Replace with actual API call
      // Simulate API request
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo: randomly choose success or conflict
      const isConflict = Math.random() > 0.7; // 30% chance of conflict

      if (isConflict) {
        navigate(`/turf/${turfId}/book/conflict`);
      } else {
        navigate(`/turf/${turfId}/book/confirmation`);
      }
    } catch (error) {
      console.error("Booking error:", error);
      // Handle error appropriately
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Review & Confirm Booking</CardTitle>
        <CardDescription>
          Review your booking details and apply any coupons
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Booking Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-stone-700">Booking Summary</h3>
            <Link
              to={`/turf/${turfId}/book/step-select-slot`}
              className="text-sm font-medium text-green-700 hover:text-green-600 hover:underline"
            >
              Change
            </Link>
          </div>
          <div className="space-y-2 rounded-lg bg-stone-50 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">{bookingDetails.turfName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Date:</span>
              <span className="font-medium text-stone-700">
                {bookingDetails.date}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Time:</span>
              <span className="font-medium text-stone-700">
                {bookingDetails.timeRange}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Duration:</span>
              <span className="font-medium text-stone-700">
                {bookingDetails.duration} hours
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Rate:</span>
              <span className="text-stone-700">
                ${bookingDetails.hourlyRate}/hr
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-stone-700">Payment Method</h3>
            <Link
              to={`/turf/${turfId}/book/step-2`}
              className="text-sm font-medium text-green-700 hover:text-green-600 hover:underline"
            >
              Change
            </Link>
          </div>
          <div className="rounded-lg border border-stone-200 p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="size-5 text-stone-600" />
              <div className="flex-1">
                <p className="font-medium text-stone-700">
                  {selectedCard.brand} ending in {selectedCard.last4}
                </p>
                <p className="text-sm text-stone-600">
                  Expires {selectedCard.expiry}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Coupon Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-stone-700">Apply Coupon</h3>
          {!appliedCoupon ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => handleApplyCoupon(couponCode)}
                  disabled={!couponCode.trim()}
                >
                  Apply
                </Button>
              </div>

              {/* Coupon List Dialog */}
              <Dialog
                open={openCouponDialog}
                onOpenChange={setOpenCouponDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Tag className="mr-2 size-4 text-green-700" />
                    <span className="flex-1 text-left">
                      View available coupons
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Available Coupons</DialogTitle>
                    <DialogDescription>
                      Select a coupon to apply to your booking
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[400px] space-y-2 overflow-y-auto">
                    {AVAILABLE_COUPONS.map((coupon) => (
                      <button
                        key={coupon.code}
                        onClick={() => handleApplyCoupon(coupon.code)}
                        className="flex w-full items-start justify-between rounded-lg border border-stone-200 bg-white p-3 text-left transition-all hover:border-green-700 hover:bg-green-50"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-stone-700">
                            {coupon.code}
                          </p>
                          <p className="text-sm text-stone-600">
                            {coupon.description}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 text-right">
                          <span className="font-bold text-green-700">
                            {coupon.discount}%
                          </span>
                          <span className="text-xs text-stone-500">off</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border-2 border-green-700 bg-green-50 p-3">
              <div>
                <p className="font-medium text-green-900">
                  {appliedCoupon.code}
                </p>
                <p className="text-sm text-green-700">
                  {appliedCoupon.discount}% discount applied
                </p>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-sm font-semibold text-green-700 hover:text-green-900"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3">
          <h3 className="font-semibold text-stone-700">Price Breakdown</h3>
          <div className="space-y-3 rounded-lg border border-stone-200 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Subtotal</span>
              <span className="text-stone-700">${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Discount</span>
                <span className="font-medium text-green-700">
                  -${discount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Tax (10%)</span>
              <span className="text-stone-700">${tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span className="text-stone-700">Total</span>
              <span className="text-lg text-green-700">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Info Alert */}
        <div className="flex gap-3 rounded-lg bg-blue-50 p-3">
          <AlertCircle className="size-5 shrink-0 text-blue-600" />
          <p className="text-sm text-blue-900">
            You will be charged ${total.toFixed(2)} to your selected card. A
            confirmation email will be sent.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleBack}
            disabled={isConfirming}
          >
            Back
          </Button>
          <Button
            variant="default"
            className="flex-1 bg-green-700 hover:bg-green-600"
            onClick={handleConfirmBooking}
            disabled={isConfirming}
          >
            {isConfirming ? "Processing..." : "Confirm Booking"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
