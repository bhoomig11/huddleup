import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { CheckCircle2, MapPin, Clock, CreditCard } from "lucide-react";
import type { Route } from "./+types/confirmation";

export default function BookingConfirmation({ params }: Route.ComponentProps) {
  const { turfId, bookingId } = params;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="size-8 text-green-600" />
          <div>
            <CardTitle>Booking Confirmed!</CardTitle>
            <CardDescription>
              Your turf booking has been successfully confirmed
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Confirmation Details */}
        <div className="space-y-3">
          <h3 className="font-semibold text-stone-700">Booking Details</h3>
          <div className="space-y-3 rounded-lg bg-green-50 p-4">
            <div className="space-y-2">
              <p className="text-sm text-stone-600">Booking ID</p>
              <p className="font-mono font-semibold text-stone-700">
                {bookingId}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-lg font-semibold text-stone-700">
                Booking confirmed successfully
              </p>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 size-4 shrink-0 text-green-700" />
                <div>
                  <p className="text-stone-600">Status</p>
                  <p className="font-medium text-stone-700">Confirmed</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-green-700" />
                <div>
                  <p className="text-stone-600">Turf ID</p>
                  <p className="font-medium text-stone-700">{turfId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="space-y-3">
          <h3 className="font-semibold text-stone-700">Payment Summary</h3>
          <div className="space-y-3 rounded-lg border border-stone-200 p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="size-5 text-stone-600" />
              <div className="flex-1">
                <p className="text-sm text-stone-600">Payment Method</p>
                <p className="font-medium text-stone-700">Confirmed</p>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span className="text-stone-700">Payment</span>
              <span className="text-lg text-green-700">Confirmed</span>
            </div>
          </div>
        </div>

        {/* Info Message */}
        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
          <p className="mb-1 font-medium">What&apos;s next?</p>
          <ul className="list-inside space-y-1">
            <li>• A confirmation email has been sent to your inbox</li>
            <li>• You can manage your booking from your profile</li>
            <li>• Show your booking ID at the venue for check-in</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <Link to={`/turf/${turfId}`} className="flex-1">
            <Button variant="outline" className="w-full">
              Back to Turf
            </Button>
          </Link>
          <Link to="/browse-turfs" className="flex-1">
            <Button
              variant="default"
              className="w-full bg-green-700 hover:bg-green-600"
            >
              Browse More Turfs
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
