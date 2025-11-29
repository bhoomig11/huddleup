"use client";

import { add, format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Command,
  CommandList,
  CommandGroup,
  CommandItem,
} from "~/components/ui/command";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function BookStep1() {
  const navigate = useNavigate();
  const params = useParams();
  const turfId = params.turfId;

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [fromTime, setFromTime] = useState<string | null>(null);
  const [toTime, setToTime] = useState<string | null>(null);

  const validBookingStartDate = new Date();
  const validBookingEndDate = add(validBookingStartDate, { months: 2 });

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const fromTimes = hours.reduce((times, hour) => {
    const startOfHour = `${hour.toString().padStart(2, "0")}:00`;
    const halfPastHour = `${hour.toString().padStart(2, "0")}:30`;
    return [...times, startOfHour, halfPastHour];
  }, [] as string[]);

  const toTimes = hours.reduce((times, hour) => {
    const beforeHalfPastHour = `${hour.toString().padStart(2, "0")}:29`;
    const beforeEndOfHour = `${hour.toString().padStart(2, "0")}:59`;
    return [...times, beforeHalfPastHour, beforeEndOfHour];
  }, [] as string[]);

  const isComplete = date && fromTime && toTime;

  const handleNext = () => {
    if (!isComplete) return;
    // Store booking data in session/context before navigating
    navigate(`/turf/${turfId}/book/step-2`);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Select Date & Time</CardTitle>
        <CardDescription>
          Choose when you&apos;d like to book this turf
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Selection */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {date ? format(date, "EEE, MMM dd, yyyy") : "Select date"}
                <ChevronDownIcon className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                onSelect={(selectedDate) => {
                  setDate(selectedDate);
                }}
                defaultMonth={date ?? validBookingStartDate}
                startMonth={validBookingStartDate}
                endMonth={validBookingEndDate}
                disabled={{
                  before: validBookingStartDate,
                  after: validBookingEndDate,
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Range Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700">From</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {fromTime ?? "Select time"}
                  <ChevronDownIcon className="size-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0" align="start">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {fromTimes.map((t) => (
                        <CommandItem
                          key={t}
                          onSelect={() => {
                            setFromTime(t);
                            setToTime(null);
                          }}
                        >
                          {t}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700">To</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  disabled={!fromTime}
                >
                  {toTime ?? "Select time"}
                  <ChevronDownIcon className="size-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0" align="start">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {toTimes.map((t) => (
                        <CommandItem
                          key={t}
                          disabled={!fromTime || t <= (fromTime ?? "")}
                          onSelect={() => {
                            setToTime(t);
                          }}
                        >
                          {t}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Summary */}
        {isComplete && (
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm text-stone-600">
              <span className="font-semibold">Selected:</span>{" "}
              {format(date, "EEEE, MMMM dd, yyyy")} from {fromTime} to {toTime}
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button
            variant="default"
            className="flex-1 bg-green-700 hover:bg-green-600"
            disabled={!isComplete}
            onClick={handleNext}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
