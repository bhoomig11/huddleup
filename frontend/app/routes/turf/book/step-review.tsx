import { useMemo, useState } from "react";
import {
  Link,
  useSearchParams,
  useRouteLoaderData,
  redirect,
  useSubmit,
  useNavigation,
  data,
} from "react-router";
import type { Route } from "./+types/step-review";
import type { clientLoader as layoutLoader } from "./layout";
import type { BookingResponse } from "~/types/booking";
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
import { bookTurf } from "~/api/turf";

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

export async function clientAction({
  params,
  request,
}: Route.ClientActionArgs) {
  const turfId = Number.parseInt(params.turfId, 10);
  if (Number.isNaN(turfId)) {
    return data(
      {
        ok: false,
        error: "Invalid turf ID",
      },
      { status: 400 }
    );
  }

  const formData = await request.formData();

  const date = formData.get("date");
  const startTime = formData.get("startTime");
  const endTime = formData.get("endTime");
  const cardId = formData.get("cardId");
  const couponId = formData.get("couponId");

  // Validate required fields
  if (!date || !startTime || !endTime || !cardId) {
    return data(
      {
        ok: false,
        error: "Missing required booking details",
      },
      { status: 400 }
    );
  }

  // Parse cardId
  const cardIdNum = Number.parseInt(cardId.toString(), 10);
  if (Number.isNaN(cardIdNum)) {
    return data(
      {
        ok: false,
        error: "Invalid card ID",
      },
      { status: 400 }
    );
  }

  // Parse couponId (optional)
  let couponIdNum: number | null = null;
  if (couponId && couponId.toString().trim() !== "") {
    const parsed = Number.parseInt(couponId.toString(), 10);
    if (Number.isNaN(parsed)) {
      return data(
        {
          ok: false,
          error: "Invalid coupon ID",
        },
        { status: 400 }
      );
    }
    couponIdNum = parsed;
  }

  try {
    const response = await bookTurf(turfId, {
      date: date.toString(),
      startTime: startTime.toString(),
      endTime: endTime.toString(),
      cardId: cardIdNum,
      couponId: couponIdNum,
    });

    if (response.ok) {
      const bookingResponse = (await response.json()) as BookingResponse;
      const bookingId = bookingResponse.bookingId;

      throw redirect(`/turf/${turfId}/book/${bookingId}/confirmation`);
    } else if (response.status === 409) {
      // Conflict, e.g., time slot already booked - redirect to conflict page with requested details
      const conflictParams = new URLSearchParams({
        date: date.toString(),
        startTime: startTime.toString(),
        endTime: endTime.toString(),
      });
      throw redirect(
        `/turf/${turfId}/book/conflict?${conflictParams.toString()}`
      );
    } else {
      // Other error - return error data
      const errorData = await response.json().catch(() => ({}));
      return data(
        {
          ok: false,
          error:
            errorData.message || "Failed to confirm booking. Please try again.",
        },
        { status: response.status }
      );
    }
  } catch (error) {
    // If it's a redirect, re-throw it
    if (
      error instanceof Response &&
      error.status >= 300 &&
      error.status < 400
    ) {
      throw error;
    }
    // Otherwise, return error
    console.error("Booking error:", error);
    return data(
      {
        ok: false,
        error: "An unexpected error occurred during booking. Please try again.",
      },
      { status: 500 }
    );
  }
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

export default function BookReview({ actionData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const submit = useSubmit();
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

  const isSubmitting = navigation.state === "submitting";
  const errorMessage =
    actionData && "error" in actionData ? actionData.error : null;

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

  const timeRange = useMemo(() => {
    if (!fromTime || !toTime) return "N/A";
    const fromTimeFormatted = formatTimeTo12Hour(toHourMinute(fromTime));
    const toTimeFormatted = formatTimeTo12Hour(toHourMinute(toTime));
    return `${fromTimeFormatted} to ${toTimeFormatted}`;
  }, [fromTime, toTime]);

  const formattedDuration = useMemo(() => {
    return formatDuration(durationHours);
  }, [durationHours]);

  const handleConfirmBooking = () => {
    if (!selectedCardId || !dateParam || !fromTime || !toTime) {
      return;
    }

    submit(
      {
        date: dateParam,
        startTime: fromTime,
        endTime: toTime,
        cardId: selectedCardId,
        ...(selectedCoupon?.couponId && {
          couponId: selectedCoupon.couponId,
        }),
      },
      { method: "POST" }
    );
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

        {/* Error Message */}
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="size-4"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

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
            disabled={isSubmitting || !selectedCard}
          >
            {isSubmitting ? "Processing..." : "Confirm Booking"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
