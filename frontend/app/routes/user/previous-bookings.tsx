import { useState } from "react";
import { format, intervalToDuration } from "date-fns";
import { redirect, useParams, useRevalidator, useNavigate } from "react-router";
import { LandPlot, Clock, CreditCard, DollarSign } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { ProfileSidebar } from "~/routes/user/components/profile-sidebar";
import { FileComplaintDialog } from "~/routes/user/components/file-complaint";
import { getUserPreviousBookings } from "~/api/user";
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

  const response = await getUserPreviousBookings(username);
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
  const navigate = useNavigate();
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

  // Helper function to calculate and format duration
  const formatDuration = (startTimeLocal: string, endTimeLocal: string) => {
    const start = new Date(startTimeLocal);
    const end = new Date(endTimeLocal);
    const duration = intervalToDuration({ start, end });

    const parts: string[] = [];
    if (duration.hours && duration.hours > 0) {
      parts.push(`${duration.hours}h`);
    }
    if (duration.minutes && duration.minutes > 0) {
      parts.push(`${duration.minutes}m`);
    }

    return parts.join(" ") || "0m";
  };

  // Helper function to check if complaint exists
  const hasComplaint = (booking: BookingSummary) => {
    return (
      booking.complaintSubject !== null &&
      booking.complaintSubject !== undefined
    );
  };

  return (
    <main className="min-h-screen bg-stone-100">
      <div className="mx-auto flex w-full max-w-7xl flex-row">
        {/* LEFT PANEL */}
        <ProfileSidebar />

        {/* RIGHT PANEL */}
        <div className="min-h-screen basis-3/4 p-10">
          <div className="space-y-6">
            <h1 className="text-lg font-bold text-stone-600 mb-5">Previous Bookings</h1>

            {bookings.length === 0 ? (
              <h2 className="text-xl font-semibold text-stone-500/90">
                No previous bookings found
              </h2>
            ) : (
              bookings.map((booking) => {
              const startDateTime = formatDateTime(booking.startTimeLocal);
              const endDateTime = formatDateTime(booking.endTimeLocal);
              const duration = formatDuration(
                booking.startTimeLocal,
                booking.endTimeLocal
              );

              return (
                <Card key={booking.bookingId} className="p-4">
                  <CardContent>
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <p className="font-medium text-stone-500">
                          Booking ID: {booking.bookingId}
                        </p>
                        <div className="flex items-center gap-2 text-stone-500">
                          <LandPlot className="size-5 text-green-700" />
                          <p className="text-stone-500">{booking.turfName}</p>
                        </div>
                        <div className="flex items-center gap-2 text-stone-500">
                          <Clock className="size-5 text-green-700" />
                          <p className="text-stone-500">
                            {startDateTime.date} | {startDateTime.time} - {endDateTime.time} ({duration})
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-stone-500">
                          <CreditCard className="size-5 text-green-700" />
                          <p className="text-stone-500">{booking.maskedCardNumber}</p>
                        </div>
                        <div className="flex items-center gap-2 text-stone-500">
                          <DollarSign className="size-5 text-green-700" />
                          <p className="text-stone-500">${booking.amount.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          className="rounded bg-green-700 text-white hover:bg-green-600 active:bg-green-700"
                          onClick={() => {
                            navigate(`/turf/${booking.turfId}`);
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
            })
            )}
          </div>
        </div>
      </div>

      {/* File Complaint Dialog */}
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
