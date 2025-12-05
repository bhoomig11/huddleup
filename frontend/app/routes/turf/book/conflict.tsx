import { Link } from "react-router";
import { AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/conflict";

export default function BookingConflict({ params }: Route.ComponentProps) {
  const { turfId } = params;

  return (
    <main className="flex w-full flex-col items-center py-8">
      <div className="w-full max-w-2xl px-4">
        <div className="w-full">
          <div className="mb-8 flex flex-col items-center text-center">
            <AlertCircle className="mb-4 size-16 text-red-600" />
            <h1 className="mb-2 text-3xl font-bold text-stone-800">
              Booking Unavailable
            </h1>
            <p className="text-lg text-stone-600">
              This time slot has already been booked by another user.
            </p>
          </div>

          {/* Message */}
          <div className="mb-8 rounded-lg border border-stone-200 bg-stone-50 p-6 text-center">
            <p className="text-stone-700">
              Please choose a different time or date to continue with your
              booking.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to={`/turf/${turfId}/book/step-select-slot`}
              className="flex-1"
            >
              <Button
                variant="default"
                className="w-full bg-green-700 hover:bg-green-600"
              >
                Try Different Time
              </Button>
            </Link>
            <Link to="/turf/browse" className="flex-1">
              <Button variant="outline" className="w-full">
                Browse Other Turfs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
