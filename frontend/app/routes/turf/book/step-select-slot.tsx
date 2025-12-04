"use client";

import { add, format, startOfDay, parse } from "date-fns";
import { useMemo } from "react";
import { Link, useSearchParams, data } from "react-router";
import type { Route } from "./+types/step-select-slot";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "~/components/ui/card";
import { fetchTurfDetails } from "~/api/turf";
import type { TurfDetails } from "~/types/turf";
import { authContext } from "~/middleware/auth-middleware";
import { redirectToLogin } from "~/utils/auth-errors";
import { StartTimeGrid } from "./components/start-time-grid";
import { EndTimeGrid } from "./components/end-time-grid";
import { useResponsiveCalendarMonths } from "./hooks/use-responsive-calendar-months";
import { Clock } from "lucide-react";

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

  const turfId = Number.parseInt(params.turfId ?? "");
  if (Number.isNaN(turfId)) {
    const invalidTurfIdMessage =
      "Invalid turf ID! Expected a number, received: " + params.turfId;
    throw data(invalidTurfIdMessage, { status: 400 });
  }

  const response = await fetchTurfDetails(turfId);
  if (!response.ok) {
    throw data("Error fetching turf details", {
      status: response.status,
    });
  }

  const turfDetails = (await response.json()) as TurfDetails;
  return { turfDetails };
}

export default function BookSelectSlot({ loaderData }: Route.ComponentProps) {
  const { turfDetails } = loaderData;

  const [searchParams, setSearchParams] = useSearchParams();
  const numberOfMonths = useResponsiveCalendarMonths();

  // Memoize based on actual string values to prevent unnecessary re-renders
  const dateParam = searchParams.get("date");
  const date = useMemo(() => {
    if (!dateParam) return null;
    const parsed = parse(dateParam, "yyyy-MM-dd", new Date());
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [dateParam]);

  const fromTime = searchParams.get("fromTime");
  const toTime = searchParams.get("toTime");

  const validBookingStartDate = startOfDay(new Date());
  const validBookingEndDate = add(validBookingStartDate, { months: 2 });

  const isComplete = date !== null && fromTime !== null && toTime !== null;

  const updateSearchParams = (updates: {
    date?: Date | null;
    fromTime?: string | null;
    toTime?: string | null;
  }) => {
    const newParams = new URLSearchParams(searchParams);
    let hasChanges = false;

    if ("date" in updates) {
      const newDateString = updates.date
        ? format(updates.date, "yyyy-MM-dd")
        : null;
      const currentDateString = searchParams.get("date");
      if (newDateString !== currentDateString) {
        hasChanges = true;
        if (newDateString) {
          newParams.set("date", newDateString);
        } else {
          newParams.delete("date");
        }
      }
    }

    if ("fromTime" in updates) {
      const currentFromTime = searchParams.get("fromTime");
      if (updates.fromTime !== currentFromTime) {
        hasChanges = true;
        if (updates.fromTime) {
          newParams.set("fromTime", updates.fromTime);
        } else {
          newParams.delete("fromTime");
        }
      }
    }

    if ("toTime" in updates) {
      const currentToTime = searchParams.get("toTime");
      if (updates.toTime !== currentToTime) {
        hasChanges = true;
        if (updates.toTime) {
          newParams.set("toTime", updates.toTime);
        } else {
          newParams.delete("toTime");
        }
      }
    }

    if (hasChanges) {
      setSearchParams(newParams, { preventScrollReset: true, replace: true });
    }
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      updateSearchParams({
        date: selectedDate,
        fromTime: null,
        toTime: null,
      });
    } else {
      updateSearchParams({
        date: null,
        fromTime: null,
        toTime: null,
      });
    }
  };

  const handleStartTimeSelect = (time: string) => {
    updateSearchParams({
      fromTime: time,
      toTime: null,
    });
  };

  const handleEndTimeSelect = (time: string) => {
    updateSearchParams({ toTime: time });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Select Date & Time</CardTitle>
        <CardDescription>
          Choose when you&apos;d like to book {turfDetails.turfName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2 rounded-lg bg-green-50 p-4">
          <div>
            <span className="text-green-700">
              <Clock className="size-5" />
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-green-700">
              Operating Hours
            </div>
            <div className="text-sm text-stone-700">
              {turfDetails.opensAtLocalTime} - {turfDetails.closesAtLocalTime}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-stone-700">Date</h2>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={date ?? undefined}
              captionLayout="label"
              numberOfMonths={numberOfMonths}
              onSelect={handleDateSelect}
              defaultMonth={validBookingStartDate}
              startMonth={validBookingStartDate}
              endMonth={validBookingEndDate}
              showOutsideDays={true}
              disabled={{
                before: validBookingStartDate,
                after: validBookingEndDate,
              }}
            />
          </div>
        </div>

        {date && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-stone-700">Start Time</h2>
            <StartTimeGrid
              turfId={turfDetails.turfId}
              date={date}
              selectedTime={fromTime}
              onSelect={handleStartTimeSelect}
            />
          </div>
        )}

        {date && fromTime && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-stone-700">End Time</h2>
            <EndTimeGrid
              turfId={turfDetails.turfId}
              date={date}
              startTime={fromTime}
              selectedTime={toTime}
              onSelect={handleEndTimeSelect}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="gap-4">
        <Button variant="outline" className="flex-1" asChild>
          <Link to={`/turf/${turfDetails.turfId}`}>Cancel</Link>
        </Button>
        {isComplete ? (
          <Button
            variant="default"
            className="flex-1 bg-green-700 hover:bg-green-600"
            asChild
          >
            <Link
              to={`/turf/${turfDetails.turfId}/book/step-select-card?${searchParams.toString()}`}
            >
              Next
            </Link>
          </Button>
        ) : (
          <Button
            variant="default"
            className="flex-1 bg-green-700 hover:bg-green-600"
            disabled
          >
            Next
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
