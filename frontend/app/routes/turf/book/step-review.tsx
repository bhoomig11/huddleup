import { useMemo, useState } from "react";
import {
  Link,
  useSearchParams,
  useNavigate,
  useRouteLoaderData,
  redirect,
} from "react-router";
import type { Route } from "./+types/step-review";
import type { clientLoader as layoutLoader } from "./layout";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { format, parse } from "date-fns";
import { maskCardNumber } from "~/routes/user/utils";
import {
  toHourMinute,
  formatTimeTo12Hour,
  calculateDurationHours,
  formatDuration,
} from "./components/time-grid-utils";
import { CouponSelector } from "./components/coupon-selector";
import type { CouponSummary } from "~/api/coupon";

export async function clientLoader({
  params,
  request,
}: Route.ClientLoaderArgs) {
  const turfId = params.turfId;
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const dateParam = searchParams.get("date");
  const fromTime = searchParams.get("fromTime");
  const toTime = searchParams.get("toTime");

  // Redirect to first step if required booking parameters are missing
  if (!dateParam || !fromTime || !toTime) {
    throw redirect(`/turf/${turfId}/book/step-select-slot`);
  }

  return {};
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

export default function BookReview() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const layoutData = useRouteLoaderData<typeof layoutLoader>(
    "routes/turf/book/layout"
  );

  const turfDetails = layoutData?.turfDetails;
  if (!turfDetails) {
    throw new Error("Turf details not found");
  }

  const turfId = turfDetails.turfId;
  const cards = layoutData?.cards ?? [];

  const dateParam = searchParams.get("date");
  const fromTime = searchParams.get("fromTime");
  const toTime = searchParams.get("toTime");

  if (!dateParam || !fromTime || !toTime) {
    return null;
  }

  const date = useMemo(() => {
    if (!dateParam) return null;
    const parsed = parse(dateParam, "yyyy-MM-dd", new Date());
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [dateParam]);

  const formattedDate = useMemo(() => {
    if (!date) return "N/A";
    return format(date, "EEEE, MMMM d, yyyy");
  }, [date]);

  // Calculate duration
  const durationHours = useMemo(() => {
    if (!fromTime || !toTime) return 0;
    return calculateDurationHours(fromTime, toTime);
  }, [fromTime, toTime]);

  // Find selected card
  const validCardIds = useMemo(() => cards.map((card) => card.cardId), [cards]);
  const selectedCardId = useMemo(
    () => parseCardIdFromQuery(searchParams, validCardIds),
    [searchParams, validCardIds]
  );

  const selectedCard = useMemo(() => {
    if (!selectedCardId) return null;
    return cards.find((card) => card.cardId === selectedCardId) ?? null;
  }, [cards, selectedCardId]);

  const [selectedCoupon, setSelectedCoupon] = useState<CouponSummary | null>(
    null
  );
  const [isConfirming, setIsConfirming] = useState(false);

  // Calculate pricing
  const subtotal = useMemo(() => {
    return durationHours * turfDetails.hourlyRate;
  }, [durationHours, turfDetails.hourlyRate]);

  const discount = useMemo(() => {
    if (!selectedCoupon) return 0;
    return (subtotal * selectedCoupon.discountPercent) / 100;
  }, [subtotal, selectedCoupon]);

  const total = useMemo(() => {
    return subtotal - discount;
  }, [subtotal, discount]);

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

  const timeRange = useMemo(() => {
    if (!fromTime || !toTime) return "N/A";
    const fromTimeFormatted = formatTimeTo12Hour(toHourMinute(fromTime));
    const toTimeFormatted = formatTimeTo12Hour(toHourMinute(toTime));
    return `${fromTimeFormatted} to ${toTimeFormatted}`;
  }, [fromTime, toTime]);

  const formattedDuration = useMemo(() => {
    return formatDuration(durationHours);
  }, [durationHours]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Review & Confirm Booking</CardTitle>
        <CardDescription>
          Review your booking details and apply any coupons
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative overflow-hidden rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-stone-700">
                {turfDetails.turfName}
              </h2>
              <div className="mt-0.5 text-xs text-stone-500">
                <span>
                  {[
                    turfDetails.address.streetLine1,
                    turfDetails.address.town,
                    [turfDetails.address.state, turfDetails.address.zipcode]
                      .filter(Boolean)
                      .join(" "),
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            </div>
            <Link
              to={`/turf/${turfId}/book/step-select-slot?${searchParams.toString()}`}
              className="ml-4 shrink-0 text-xs font-medium text-green-700 hover:text-green-600 hover:underline"
            >
              Change date & time
            </Link>
          </div>

          {/* Divider line */}
          <div className="my-3 border-t border-stone-300"></div>

          {/* Date and Time Section */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 size-4 shrink-0 text-stone-500" />
              <div className="flex-1">
                <p className="text-[10px] font-medium tracking-wide text-stone-500 uppercase">
                  Date
                </p>
                <p className="text-sm font-bold text-stone-700">
                  {formattedDate}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-stone-500" />
              <div className="flex-1">
                <p className="text-[10px] font-medium tracking-wide text-stone-500 uppercase">
                  Time
                </p>
                <p className="text-sm font-bold text-stone-700">{timeRange}</p>
                <p className="text-xs text-stone-500">{formattedDuration}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section with Integrated Payment Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-stone-700">Pricing</h3>

          {/* Top Row: Rate and Payment Method */}
          <div className="space-y-2 border-b border-stone-200 pb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-600">Hourly Rate</span>
              <span className="font-medium text-stone-700">
                ${turfDetails.hourlyRate.toFixed(2)}/hr
              </span>
            </div>
            <div>
              <div className="flex justify-between">
                <span className="text-stone-600">Payment Method</span>
                {selectedCard ? (
                  <span className="font-medium text-stone-700">
                    {maskCardNumber(selectedCard.cardNumber)}
                  </span>
                ) : (
                  <Link
                    to={`/turf/${turfId}/book/step-select-card?${searchParams.toString()}`}
                    className="text-sm text-green-700 hover:text-green-600 hover:underline"
                  >
                    Select payment method
                  </Link>
                )}
              </div>
              {selectedCard && (
                <div className="mt-1 flex justify-end">
                  <Link
                    to={`/turf/${turfId}/book/step-select-card?${searchParams.toString()}`}
                    className="text-xs text-green-700 hover:text-green-600 hover:underline"
                  >
                    Change
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Middle Row: Calculation Breakdown */}
          {(subtotal > 0 || discount > 0) && (
            <div className="space-y-2 pb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-600">
                  {formattedDuration} × ${turfDetails.hourlyRate.toFixed(2)}/hr
                </span>
                <span className="font-medium text-stone-700">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-stone-600">
                    Discount ({selectedCoupon?.couponCode})
                  </span>
                  <span className="font-medium text-green-700">
                    -${discount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Bottom Row: Total Amount - Most Prominent */}
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-sm font-medium text-stone-600">Total Amount</p>
              {discount > 0 && (
                <p className="mt-1 text-xs text-stone-500">
                  You saved ${discount.toFixed(2)} with{" "}
                  {selectedCoupon?.couponCode}
                </p>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl text-stone-500">$</span>
              <span className="text-4xl font-bold text-green-700">
                {total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Coupon Section */}
        <CouponSelector onCouponChange={setSelectedCoupon} />

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1" asChild>
            <Link
              to={`/turf/${turfId}/book/step-select-card?${searchParams.toString()}`}
            >
              Back
            </Link>
          </Button>
          <Button
            variant="default"
            className="flex-1 bg-green-700 hover:bg-green-600"
            onClick={handleConfirmBooking}
            disabled={isConfirming || !selectedCard}
          >
            {isConfirming ? "Processing..." : "Confirm Booking"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
