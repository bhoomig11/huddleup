import { add, format } from "date-fns";
import { ChevronDownIcon, LandPlot, Search } from "lucide-react";
import { useState } from "react";
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
import { findTurfs } from "~/api/turf";
import { data } from "react-router";
import type { TurfSummary } from "~/types/turf";
import type { Route } from "./+types/browse-turfs";

export async function clientLoader() {
  const response = await findTurfs();
  if (!response.ok) {
    throw data("Error fetching turfs", { status: response.status }); // TODO: Handle this better!
  }
  const turfs = (await response.json()) as Array<TurfSummary>;
  return turfs;
}

export default function BrowseTurfsPage({
  loaderData: turfs,
}: Route.ComponentProps) {
  return (
    <div className="w-screen bg-stone-100">
      <div className="h-20 w-full border-b border-stone-300/80 bg-stone-100 py-4">
        <header className="mx-auto grid max-w-7xl grid-cols-[1fr_48rem_1fr]">
          <div className="self-center justify-self-start">
            <span className="bg-green-700 px-4 py-2 text-3xl font-bold tracking-wide text-white">
              HuddleUp
            </span>
          </div>
          <div className="flex h-12 w-3xl flex-row gap-4">
            <div className="flex h-12 flex-1 flex-row self-baseline justify-self-center overflow-hidden rounded border border-stone-300/80 has-[[data-slot='popover-trigger'][data-state='open']]:border-green-800 has-[[data-slot='popover-trigger'][data-state='open']]:ring has-[[data-slot='popover-trigger'][data-state='open']]:ring-green-800/50 has-[input:focus-visible]:border-green-800 has-[input:focus-visible]:ring has-[input:focus-visible]:ring-green-800/50">
              <InputGroup className="h-12 self-baseline rounded-none border-0 border-r border-stone-300/80 bg-white">
                <InputGroupInput
                  type="text"
                  className="h-12 rounded-none px-4 py-2 font-medium text-stone-600"
                  placeholder="Enter city, state, or zip code"
                />
                <InputGroupAddon>
                  <Search className="size-5 text-stone-500" />
                </InputGroupAddon>
              </InputGroup>
              <DatePicker />
              <TimeSlotPicker />
            </div>
            <div className="flex-none">
              <Button
                variant="default"
                className="h-12 w-24 self-baseline rounded border-stone-300/80 bg-green-700 text-white hover:bg-green-600 active:bg-green-700"
              >
                Search
              </Button>
            </div>
          </div>
          <div className="self-baseline justify-self-end"></div>
        </header>
      </div>
      <main className="flex w-full flex-col items-center">
        <div className="w-3xl py-4">
          <h1 className="text-lg font-bold text-stone-600">Search Results</h1>
        </div>
        <ul className="space-y-4 pb-8">
          {turfs.map((turf) => (
            <li
              className="flex w-3xl flex-row overflow-hidden rounded-lg border border-stone-300/60 bg-white shadow"
              key={turf.turfId}
            >
              <div className="flex-none">
                <img className="h-full w-48 object-cover" src={turf.imageUrl} />
              </div>
              <div className="flex-1">
                <div className="flex flex-row gap-4 p-4">
                  <div className="flex flex-1 flex-col gap-0.5">
                    <h2 className="text-2xl leading-6 font-bold text-stone-600">
                      {turf.turfName}
                    </h2>
                    <div className="flex flex-row items-center gap-0.5">
                      {/* <MapPin className="size-5 text-stone-500" /> */}
                      <p className="text-sm text-stone-400">
                        {[
                          turf.address.streetLine1,
                          turf.address.streetLine2,
                          turf.address.town,
                          turf.address.zipcode,
                        ].join(", ")}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-row items-center gap-1.5">
                      <LandPlot className="size-5 text-stone-500" />
                      <p className="text-lg font-bold text-stone-500">
                        {turf.sportName}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-none flex-row items-start gap-1">
                    <span className="font-medium text-stone-500">$</span>
                    <span className="text-4xl font-bold text-stone-600">
                      {turf.hourlyRate.toFixed(2)}
                    </span>
                    <span className="font-medium text-stone-500">/hr</span>
                  </div>
                </div>
                <div className="flex flex-row items-baseline justify-between bg-stone-100/60 p-4">
                  <div>
                    <div className="flex flex-row items-baseline gap-1">
                      <span className="self-center text-yellow-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-6"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                      <span className="text-2xl font-bold text-stone-600">
                        {turf.averageRating?.toFixed(1) ?? "-"}
                      </span>
                      <span className="text-sm text-stone-400">/ 5.0</span>
                      <span className="text-sm font-medium text-stone-500">
                        ({turf.numberOfRatings})
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row gap-2">
                    <Button
                      variant="ghost"
                      className="px-3.5 py-1.5 font-semibold text-green-700 hover:bg-stone-300/30 active:bg-stone-300/60"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="default"
                      className="rounded bg-green-700 px-3.5 py-1.5 text-white hover:bg-green-600 active:bg-green-700"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

function DatePicker() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  const validBookingStartDate = new Date();
  const validBookingEndDate = add(validBookingStartDate, { months: 2 });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="date-picker"
          className="h-12 w-32 justify-between rounded-none border-0 border-r border-stone-300/80 bg-white font-normal"
        >
          {date ? format(date, "EEE, MMM dd") : "Select date"}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto overflow-hidden bg-white p-0"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          captionLayout="dropdown"
          onSelect={(date) => {
            setDate(date);
            setOpen(false);
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
  );
}

/**
 * Constructs a time string in the 24-hours format "HH:MM" (e.g. "14:27").
 *
 * @param hour the hour mark for the time (0-23)
 * @param minute the minute mark for the time (0-59)
 * @returns the constructed time string
 */
function create24HrTimeString(hour: number, minute: number): string {
  const hourString = hour.toString().padStart(2, "0"); // E.g. converts 3 to "03"
  const minuteString = minute.toString().padStart(2, "0");
  return `${hourString}:${minuteString}`;
}

const hours = Array.from({ length: 24 }, (_, i) => i);

const fromTimes = hours.reduce((times, hour) => {
  const startOfHour = create24HrTimeString(hour, 0);
  const halfPastHour = create24HrTimeString(hour, 30);
  return [...times, startOfHour, halfPastHour];
}, [] as string[]);

const toTimes = hours.reduce((times, hour) => {
  const beforeHalfPastHour = create24HrTimeString(hour, 29);
  const beforeEndOfHour = create24HrTimeString(hour, 59);
  return [...times, beforeHalfPastHour, beforeEndOfHour];
}, [] as string[]);

function TimeSlotPicker() {
  const [open, setOpen] = useState(false);
  const [fromTime, setFromTime] = useState<string | null>(null);
  const [toTime, setToTime] = useState<string | null>(null);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="time-picker"
          className="h-12 w-40 justify-between rounded-none border-0 bg-white"
        >
          {fromTime ? `${fromTime} to ${toTime ?? "..."}` : "Select time"}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto overflow-hidden bg-white p-0"
        align="start"
      >
        <div className="w-72 p-2">
          <div className="flex flex-row gap-3">
            <div>
              <div className="px-1 pb-1 text-xs font-medium text-stone-500">
                From
              </div>
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
            </div>

            <div>
              <div className="px-1 pb-1 text-xs font-medium text-stone-500">
                To
              </div>
              <Command>
                <CommandList>
                  <CommandGroup>
                    {toTimes.map((t) => (
                      <CommandItem
                        key={t}
                        disabled={!fromTime || t <= (fromTime ?? "")}
                        onSelect={() => {
                          setToTime(t);
                          setOpen(false);
                        }}
                      >
                        {t}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>

            <div className="flex justify-end">
              <Button
                variant="ghost"
                className="text-sm"
                onClick={() => {
                  setFromTime(null);
                  setToTime(null);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
