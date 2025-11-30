import { useState } from "react";
import { format } from "date-fns";
import { redirect, useParams, useRevalidator } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { ProfileSidebar } from "~/routes/user/components/profile-sidebar";
import { FileComplaintDialog } from "~/routes/user/components/file-complaint";
import { getAllUserBookings } from "~/api/user";
import { data } from "react-router";
import type { BookingSummary } from "~/types/booking";
import type { Route } from "./+types/previous-bookings";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const username = params.username;
  if (!username) {
    // TODO: backend error should be displayed to the user - handled by the procedure or no?
    // throw data("Username is required", { status: 400 });
    throw redirect("/login");
  }

  const response = await getAllUserBookings(username);
  if (!response.ok) {
    throw data("Error fetching bookings", { status: response.status });
  }
  const bookings = (await response.json()) as Array<BookingSummary>;
  return bookings;
}

export default function PreviousBookingsPage({
  loaderData: bookings,
}: Route.ComponentProps) {
  const { username } = useParams<{ username: string }>();
  const revalidator = useRevalidator();
  const [openComplaintDialog, setOpenComplaintDialog] = useState<number | null>(
    null
  );

  const handleComplaintFiled = () => {
    // Refresh the bookings data after filing a complaint
    revalidator.revalidate();
  };

  // Helper function to format date and time
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: format(date, "MM/dd/yyyy"),
      time: format(date, "h:mm a"),
    };
  };

  // Helper function to check if complaint exists
  const hasComplaint = (booking: BookingSummary) => {
    return (
      booking.complaintSubject !== null &&
      booking.complaintSubject !== undefined
    );
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-row">
        {/* Left Panel */}
        <ProfileSidebar />

        {/* Right Panel */}
        <div className="min-h-screen basis-3/4 p-10">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-stone-600">Previous Bookings</h2>

            {bookings.map((booking) => {
              const dateTime = formatDateTime(booking.startTimeUtc);

              return (
                <Card key={booking.bookingId} className="p-4">
                  <CardContent>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-stone-500">
                          Booking ID: {booking.bookingId}
                        </p>
                        <p className="text-stone-500">
                          Turf Name: {booking.turfName}
                        </p>
                        <p className="text-stone-500">
                          Date: {dateTime.date} | {dateTime.time}
                        </p>
                        <p className="text-stone-500">
                          Duration: {booking.durationMins} minutes
                        </p>
                        <p className="text-stone-500">
                          Card Number: {booking.maskedCardNumber}
                        </p>
                        <p className="text-stone-500">
                          Amount Paid: ${booking.amount.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          className="rounded bg-green-700 text-white hover:bg-green-600 active:bg-green-700"
                          onClick={() => {
                            // TODO: reroute to the turf's page where booking was made to add a review
                          }}
                        >
                          Add a review
                        </Button>
                        <Button
                          size="sm"
                          className="rounded bg-green-700 text-white hover:bg-green-600 active:bg-green-700"
                          onClick={() =>
                            setOpenComplaintDialog(booking.bookingId)
                          }
                        >
                          {hasComplaint(booking)
                            ? "View Complaint"
                            : "File Complaint"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* File Complaint Dialogs */}
      {bookings.map((booking) => {
        const complaint = hasComplaint(booking)
          ? {
              subject: booking.complaintSubject!,
              description: booking.complaintDescription ?? "",
              isResolved: booking.complaintResolvedAtUtc !== null,
            }
          : null;

        return (
          <FileComplaintDialog
            key={booking.bookingId}
            open={openComplaintDialog === booking.bookingId}
            onOpenChange={(open) =>
              setOpenComplaintDialog(open ? booking.bookingId : null)
            }
            username={username!}
            bookingId={booking.bookingId}
            existingComplaint={complaint}
            onComplaintFiled={handleComplaintFiled}
          />
        );
      })}
    </main>
  );
}
