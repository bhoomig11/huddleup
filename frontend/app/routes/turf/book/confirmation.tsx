import { useMemo } from "react";
import { Link } from "react-router";
import { format, parseISO } from "date-fns";
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/confirmation";
import { getUserBooking } from "~/api/user";
import { fetchTurfDetails } from "~/api/turf";
import { data } from "react-router";
import { authContext } from "~/middleware/auth-middleware";
import { redirectToLogin } from "~/utils/auth-errors";
import type { BookingSummary } from "~/types/booking";
import type { TurfDetails } from "~/types/turf";
import { formatDuration } from "./components/time-grid-utils";
import { formatMaskedCardNumber } from "~/routes/user/utils";

export async function clientLoader({
  context,
  params,
  request,
}: Route.ClientLoaderArgs) {
  const auth = context.get(authContext);
  if (auth === null) {
    const currentPath = new URL(request.url).pathname;
    redirectToLogin(currentPath);
  }

  const bookingId = Number.parseInt(params.bookingId ?? "");
  if (Number.isNaN(bookingId)) {
    throw data("Invalid booking ID", { status: 400 });
  }

  const turfId = Number.parseInt(params.turfId ?? "");
  if (Number.isNaN(turfId)) {
    throw data("Invalid turf ID", { status: 400 });
  }

  const username = auth!.username;

  const [bookingResponse, turfResponse] = await Promise.all([
    getUserBooking(username, bookingId),
    fetchTurfDetails(turfId),
  ]);

  if (!bookingResponse.ok) {
    if (bookingResponse.status === 404) {
      throw data("Booking not found", { status: 404 });
    }
    throw data("Error fetching booking details", {
      status: bookingResponse.status,
    });
  }

  if (!turfResponse.ok) {
    throw data("Error fetching turf details", {
      status: turfResponse.status,
    });
  }

  const booking = (await bookingResponse.json()) as BookingSummary;
  const turfDetails = (await turfResponse.json()) as TurfDetails;

  return { booking, turfDetails };
}

export default function BookingConfirmation({
  loaderData,
  params,
}: Route.ComponentProps) {
  const { booking, turfDetails } = loaderData;
  const { turfId } = params;

  const startDate = useMemo(() => {
    if (!booking.startTimeLocal) return null;
    try {
      const parsed = parseISO(booking.startTimeLocal);
      if (isNaN(parsed.getTime())) {
        console.error(
          "Invalid date parsed from startTimeLocal:",
          booking.startTimeLocal
        );
        return null;
      }
      return parsed;
    } catch (error) {
      console.error(
        "Error parsing startTimeLocal:",
        booking.startTimeLocal,
        error
      );
      return null;
    }
  }, [booking.startTimeLocal]);

  const endDate = useMemo(() => {
    if (!booking.endTimeLocal) return null;
    try {
      const parsed = parseISO(booking.endTimeLocal);
      if (isNaN(parsed.getTime())) {
        console.error(
          "Invalid date parsed from endTimeLocal:",
          booking.endTimeLocal
        );
        return null;
      }
      return parsed;
    } catch (error) {
      console.error("Error parsing endTimeLocal:", booking.endTimeLocal, error);
      return null;
    }
  }, [booking.endTimeLocal]);

  // Format date
  const formattedDate = useMemo(() => {
    if (!startDate || isNaN(startDate.getTime())) return "Invalid date";
    try {
      return format(startDate, "EEEE, MMMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  }, [startDate]);

  // Format time range
  const timeRange = useMemo(() => {
    if (
      !startDate ||
      !endDate ||
      isNaN(startDate.getTime()) ||
      isNaN(endDate.getTime())
    ) {
      return "Invalid time";
    }
    try {
      const startTime = format(startDate, "hh:mm a");
      const endTime = format(endDate, "hh:mm a");
      return `${startTime} to ${endTime}`;
    } catch (error) {
      console.error("Error formatting time range:", error);
      return "Invalid time";
    }
  }, [startDate, endDate]);

  // Calculate duration
  const durationHours = useMemo(() => {
    if (
      !startDate ||
      !endDate ||
      isNaN(startDate.getTime()) ||
      isNaN(endDate.getTime())
    ) {
      return 0;
    }
    const diffMs = endDate.getTime() - startDate.getTime();
    return diffMs / (1000 * 60 * 60);
  }, [startDate, endDate]);

  const formattedDuration = useMemo(() => {
    return formatDuration(durationHours);
  }, [durationHours]);

  // Format address
  const addressString = useMemo(() => {
    const addr = turfDetails.address;
    return [
      addr.streetLine1,
      addr.town,
      [addr.state, addr.zipcode].filter(Boolean).join(" "),
    ]
      .filter(Boolean)
      .join(", ");
  }, [turfDetails.address]);

  // Format masked card number
  const formattedCardNumber = useMemo(() => {
    if (!booking.maskedCardNumber) return null;
    return formatMaskedCardNumber(booking.maskedCardNumber);
  }, [booking.maskedCardNumber]);

  return (
    <main className="flex w-full flex-col items-center py-8">
      <div className="w-full max-w-2xl px-4">
        <div className="w-full">
          {/* Success Header */}
          <div className="mb-6 flex items-center gap-3">
            <CheckCircle2 className="size-10 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-stone-800">
                Booking Confirmed!
              </h1>
              <p className="text-stone-600">
                Your turf booking has been successfully confirmed
              </p>
            </div>
          </div>

          {/* Complete Ticket Stub - All Information */}
          <div className="relative overflow-hidden rounded-lg border border-stone-300 bg-white p-6 shadow-sm">
            {/* Header with Turf Name and Booking ID */}
            <div className="mb-6 flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-stone-800">
                  {booking.turfName}
                </h2>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-stone-600">
                  <MapPin className="size-3.5 shrink-0" />
                  <span>{addressString}</span>
                </div>
              </div>
              <div className="ml-6 shrink-0 text-right">
                <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">
                  Booking ID
                </p>
                <p className="font-mono text-lg font-bold text-stone-800">
                  #{booking.bookingId}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="mb-6 border-t border-stone-300"></div>

            {/* Date and Time - Highlighted */}
            <div className="mb-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 rounded-md bg-green-100 p-2">
                    <Calendar className="size-5 text-green-700" />
                  </div>
                  <div className="flex-1">
                    <p className="mb-1 text-xs font-medium tracking-wide text-stone-500 uppercase">
                      Date
                    </p>
                    <p className="text-xl font-bold text-stone-800">
                      {formattedDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 rounded-md bg-green-100 p-2">
                    <Clock className="size-5 text-green-700" />
                  </div>
                  <div className="flex-1">
                    <p className="mb-1 text-xs font-medium tracking-wide text-stone-500 uppercase">
                      Time
                    </p>
                    <p className="text-xl font-bold text-stone-800">
                      {timeRange}
                    </p>
                    <p className="mt-1 text-sm text-stone-600">
                      {formattedDuration}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="mb-4 border-t border-stone-300"></div>

            {/* Payment Information - De-emphasized */}
            <div className="space-y-2.5 text-sm">
              {formattedCardNumber && (
                <div className="flex items-center justify-between text-stone-600">
                  <div className="flex items-center gap-2">
                    <CreditCard className="size-4 text-stone-400" />
                    <span>Payment Method</span>
                  </div>
                  <span className="font-mono font-medium text-stone-700">
                    {formattedCardNumber}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 text-stone-600">
                <div className="flex items-center gap-2">
                  <DollarSign className="size-4 text-stone-400" />
                  <span>Total Paid</span>
                </div>
                <span className="font-semibold text-stone-800">
                  ${booking.amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Info Message */}
          <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-900">
            <p className="mb-1 font-semibold">What&apos;s next?</p>
            <ul className="list-inside space-y-1 text-green-800">
              <li>• Your booking is confirmed and ready to use</li>
              <li>• You can view and manage this booking from your profile</li>
              <li>
                • Show your booking ID (#{booking.bookingId}) at the venue for
                check-in
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div className="mt-6 flex gap-3">
            <Link to={`/turf/${turfId}`} className="flex-1">
              <Button variant="outline" className="w-full">
                Back to Turf
              </Button>
            </Link>
            <Link to="/turf/browse" className="flex-1">
              <Button
                variant="default"
                className="w-full bg-green-700 hover:bg-green-600"
              >
                Browse More Turfs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
