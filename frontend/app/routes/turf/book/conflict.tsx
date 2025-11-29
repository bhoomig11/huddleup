"use client";

import { Link, useParams } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { AlertCircle, Clock } from "lucide-react";

// Mock conflict details - will come from error response
const MOCK_CONFLICT = {
  turfName: "Central Sports Complex",
  requestedDate: "Friday, December 13, 2025",
  requestedTimeRange: "14:00 to 17:00",
  conflictReason: "This time slot has already been booked by another user",
  availableSlots: [
    { time: "10:00 to 13:00", status: "Available" },
    { time: "17:00 to 20:00", status: "Available" },
    { time: "20:00 to 23:00", status: "Available" },
  ],
};

export default function BookingConflict() {
  const params = useParams();
  const turfId = params.turfId;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <AlertCircle className="size-8 text-red-600" />
          <div>
            <CardTitle>Booking Unavailable</CardTitle>
            <CardDescription>
              We couldn&apos;t complete your booking at this time
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Conflict Details */}
        <div className="space-y-3">
          <h3 className="font-semibold text-stone-700">What Happened</h3>
          <div className="space-y-3 rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-900">
              {MOCK_CONFLICT.conflictReason}
            </p>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium text-stone-700">
                {MOCK_CONFLICT.turfName}
              </p>
              <div className="flex gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 size-4 shrink-0 text-red-600" />
                  <div>
                    <p className="text-stone-600">Requested Time</p>
                    <p className="font-medium text-stone-700">
                      {MOCK_CONFLICT.requestedDate}
                    </p>
                    <p className="text-stone-600">
                      {MOCK_CONFLICT.requestedTimeRange}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Available Slots */}
        <div className="space-y-3">
          <h3 className="font-semibold text-stone-700">Available Time Slots</h3>
          <div className="space-y-2">
            {MOCK_CONFLICT.availableSlots.map((slot, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3"
              >
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-green-700" />
                  <span className="font-medium text-stone-700">
                    {slot.time}
                  </span>
                </div>
                <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                  {slot.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* What to do next */}
        <div className="rounded-lg bg-stone-100 p-4 text-sm text-stone-900">
          <p className="mb-2 font-medium">What you can do:</p>
          <ul className="list-inside space-y-1">
            <li>• Choose a different time slot above</li>
            <li>• Try booking for a different date</li>
            <li>• Browse other available turfs</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <Link to={`/turf/${turfId}/book/step-1`} className="flex-1">
            <Button variant="outline" className="w-full">
              Try Again
            </Button>
          </Link>
          <Link to="/browse-turfs" className="flex-1">
            <Button
              variant="default"
              className="w-full bg-green-700 hover:bg-green-600"
            >
              Browse Other Turfs
            </Button>
          </Link>
        </div>

        {/* Contact Support */}
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-center text-sm text-stone-600">
          <p>
            Need help?{" "}
            <Link
              to="/support"
              className="font-medium text-green-700 hover:underline"
            >
              Contact support
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
