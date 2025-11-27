import { add, format } from "date-fns";
import { ChevronDownIcon, LandPlot, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
// import { Input } from "~/components/ui/input";
// import { Label } from "~/components/ui/label";
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

const turfs = [
  {
    name: "Greenline Soccer Arena",
    sport: "Soccer",
    addressStreet1: "1420 W Addison St",
    addressStreet2: "Suite 3B",
    addressTown: "Chicago",
    addressState: "IL",
    addressZipCode: "60613",
    averageRating: 4.6,
    numberOfRatings: 128,
    pricePerHour: 110.24,
    imgUrl:
      "https://outdoors.cometoboston.com/images/Soccer/SoccerFieldHeader1200x500-L.png",
  },
  {
    name: "Riverfront Soccer Dome",
    sport: "Soccer",
    addressStreet1: "88 Riverside Park Dr",
    addressStreet2: "Building A",
    addressTown: "Portland",
    addressState: "OR",
    addressZipCode: "97205",
    averageRating: 4.3,
    numberOfRatings: 76,
    pricePerHour: 95.46,
    imgUrl:
      "https://www.aturf.com/wp-content/uploads/2021/11/sahlens-flash-field-corner-kick-sunset-listing.jpg",
  },
  {
    name: "Bayview Soccer Complex",
    sport: "Soccer",
    addressStreet1: "410 Bayview Blvd",
    addressStreet2: "Field 2",
    addressTown: "Tampa",
    addressState: "FL",
    addressZipCode: "33607",
    averageRating: 4.1,
    numberOfRatings: 54,
    pricePerHour: 85.49,
    imgUrl: "https://luthernorse.com/images/2021/12/3/Soccer_Pitch_III.jpg",
  },
  {
    name: "Desert Ridge Soccer Park",
    sport: "Soccer",
    addressStreet1: "2300 N Desert Ridge Dr",
    addressStreet2: "Turf Complex",
    addressTown: "Phoenix",
    addressState: "AZ",
    addressZipCode: "85050",
    averageRating: 4.4,
    numberOfRatings: 97,
    pricePerHour: 100.5,
    imgUrl:
      "https://angelosports.com/images/2024/9/23/Drone_overhead_facing_west_sunset_9-21-24.jpg",
  },
  {
    name: "Brooklyn Five-a-Side Hub",
    sport: "Soccer",
    addressStreet1: "55 Wythe Ave",
    addressStreet2: "Level 2",
    addressTown: "Brooklyn",
    addressState: "NY",
    addressZipCode: "11249",
    averageRating: 4.7,
    numberOfRatings: 188,
    pricePerHour: 135,
    imgUrl:
      "https://putnamcountyparks.com/wp-content/uploads/2022/04/Soccer-Field-Aerial-3.jpg",
  },
  {
    name: "Golden Gate Soccer Loft",
    sport: "Soccer",
    addressStreet1: "1010 Mission St",
    addressStreet2: "Rooftop Field",
    addressTown: "San Francisco",
    addressState: "CA",
    addressZipCode: "94103",
    averageRating: 4.8,
    numberOfRatings: 212,
    pricePerHour: 150,
    imgUrl:
      "https://xtremeparkadventures.com/wp-content/uploads/2023/06/pexels-anastasia-shuraeva-9519543-scaled.jpg",
  },
  {
    name: "Lone Star Soccer Yard",
    sport: "Soccer",
    addressStreet1: "700 Trinity St",
    addressStreet2: "Pitch 1",
    addressTown: "Austin",
    addressState: "TX",
    addressZipCode: "78701",
    averageRating: 4.2,
    numberOfRatings: 61,
    pricePerHour: 90,
    imgUrl:
      "https://lh4.googleusercontent.com/4-qGGBAsbeLQItOvJ0Cb8_jGIJWsC0JQHAIOjuhBS5JHfbbyy58KrCIPciezF5rV07mxpBGrx1ybD0me9xXpC4cXMygpUjuPs9dUpM9uaw-YUdnXIkxegmzIl0rrVXqW8cDL7niOb-wRB4WAzk9R3OU",
  },
  {
    name: "Emerald City Soccer Center",
    sport: "Soccer",
    addressStreet1: "2600 Rainier Ave S",
    addressStreet2: "Indoor Field",
    addressTown: "Seattle",
    addressState: "WA",
    addressZipCode: "98144",
    averageRating: 4.5,
    numberOfRatings: 143,
    pricePerHour: 120,
    imgUrl:
      "https://soccer5usa.com/wp-content/uploads/2024/08/TW-FIELD-4-7V7-1024x683.jpg",
  },

  {
    name: "Downtown Hoops Pavilion",
    sport: "Basketball",
    addressStreet1: "220 Tremont St",
    addressStreet2: "Court 1",
    addressTown: "Boston",
    addressState: "MA",
    addressZipCode: "02116",
    averageRating: 4.7,
    numberOfRatings: 142,
    pricePerHour: 85,
  },
  {
    name: "Lakeside Hardwood Arena",
    sport: "Basketball",
    addressStreet1: "900 Lakeside Ave",
    addressStreet2: "Gym A",
    addressTown: "Cleveland",
    addressState: "OH",
    addressZipCode: "44114",
    averageRating: 4.3,
    numberOfRatings: 73,
    pricePerHour: 70,
  },
  {
    name: "SoMa Streetball Center",
    sport: "Basketball",
    addressStreet1: "480 7th St",
    addressStreet2: "Level 1",
    addressTown: "San Francisco",
    addressState: "CA",
    addressZipCode: "94103",
    averageRating: 4.6,
    numberOfRatings: 159,
    pricePerHour: 95,
  },
  {
    name: "Midtown Skyline Courts",
    sport: "Basketball",
    addressStreet1: "350 W 34th St",
    addressStreet2: "Rooftop Deck",
    addressTown: "New York",
    addressState: "NY",
    addressZipCode: "10001",
    averageRating: 4.9,
    numberOfRatings: 221,
    pricePerHour: 140,
  },
  {
    name: "Windy City Hoops Lab",
    sport: "Basketball",
    addressStreet1: "1200 S State St",
    addressStreet2: "Court 2",
    addressTown: "Chicago",
    addressState: "IL",
    addressZipCode: "60605",
    averageRating: 4.1,
    numberOfRatings: 58,
    pricePerHour: 65,
  },
  {
    name: "Music City Indoor Courts",
    sport: "Basketball",
    addressStreet1: "600 Broadway",
    addressStreet2: "Lower Gym",
    addressTown: "Nashville",
    addressState: "TN",
    addressZipCode: "37203",
    averageRating: 4.4,
    numberOfRatings: 101,
    pricePerHour: 80,
  },
  {
    name: "Mile High Hoops House",
    sport: "Basketball",
    addressStreet1: "1800 Blake St",
    addressStreet2: "Court 3",
    addressTown: "Denver",
    addressState: "CO",
    addressZipCode: "80202",
    averageRating: 4.2,
    numberOfRatings: 69,
    pricePerHour: 75,
  },
  {
    name: "South Beach Courts",
    sport: "Basketball",
    addressStreet1: "50 Ocean Dr",
    addressStreet2: "Indoor Arena",
    addressTown: "Miami Beach",
    addressState: "FL",
    addressZipCode: "33139",
    averageRating: 4.8,
    numberOfRatings: 193,
    pricePerHour: 130,
  },

  {
    name: "Beacon Pickleball Club",
    sport: "Pickleball",
    addressStreet1: "12 Park Dr",
    addressStreet2: "Courts 1–4",
    addressTown: "Boston",
    addressState: "MA",
    addressZipCode: "02215",
    averageRating: 4.8,
    numberOfRatings: 134,
    pricePerHour: 55,
  },
  {
    name: "Austin Paddle Yard",
    sport: "Pickleball",
    addressStreet1: "2500 E 6th St",
    addressStreet2: "Level 3 Terrace",
    addressTown: "Austin",
    addressState: "TX",
    addressZipCode: "78702",
    averageRating: 4.5,
    numberOfRatings: 71,
    pricePerHour: 50,
  },
  {
    name: "Rain City Pickle Park",
    sport: "Pickleball",
    addressStreet1: "89 Maple Leaf Way",
    addressStreet2: "Court A",
    addressTown: "Seattle",
    addressState: "WA",
    addressZipCode: "98115",
    averageRating: 4.2,
    numberOfRatings: 39,
    pricePerHour: 40,
  },
  {
    name: "Harborlight Pickleball Deck",
    sport: "Pickleball",
    addressStreet1: "5 Pier Point Ln",
    addressStreet2: "Rooftop Courts",
    addressTown: "San Diego",
    addressState: "CA",
    addressZipCode: "92101",
    averageRating: 4.9,
    numberOfRatings: 192,
    pricePerHour: 75,
  },
  {
    name: "Rocky Mountain Paddle Hub",
    sport: "Pickleball",
    addressStreet1: "134 Summit Ave",
    addressStreet2: "Suite 200",
    addressTown: "Boulder",
    addressState: "CO",
    addressZipCode: "80302",
    averageRating: 4.0,
    numberOfRatings: 46,
    pricePerHour: 38,
  },
  {
    name: "Sun Valley Pickle Courts",
    sport: "Pickleball",
    addressStreet1: "410 Canyon Blvd",
    addressStreet2: "Court 2",
    addressTown: "Boise",
    addressState: "ID",
    addressZipCode: "83702",
    averageRating: 3.9,
    numberOfRatings: 29,
    pricePerHour: 35,
  },
  {
    name: "Great Lakes Paddle Loft",
    sport: "Pickleball",
    addressStreet1: "25 Harborview Rd",
    addressStreet2: "Indoor Courts",
    addressTown: "Milwaukee",
    addressState: "WI",
    addressZipCode: "53202",
    averageRating: 4.6,
    numberOfRatings: 83,
    pricePerHour: 60,
  },
  {
    name: "Desert Springs Pickleball",
    sport: "Pickleball",
    addressStreet1: "11 Oasis Blvd",
    addressStreet2: "Rec Center Courts",
    addressTown: "Las Vegas",
    addressState: "NV",
    addressZipCode: "89119",
    averageRating: 4.4,
    numberOfRatings: 57,
    pricePerHour: 45,
  },
];

export default function BrowseTurfsPage() {
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
              {/* <Input
                type="text"
                className="h-12 self-baseline rounded-none border-0 border-r border-stone-300/80 bg-white px-4 py-2 font-medium text-teal-800"
              /> */}
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
          {turfs
            .filter(({ sport }) => sport === "Soccer")
            .map((turf) => (
              <li
                className="flex w-3xl flex-row overflow-hidden rounded-lg border border-stone-300/60 bg-white shadow"
                key={turf.name}
              >
                <div className="flex-none">
                  <img className="h-full w-48 object-cover" src={turf.imgUrl} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-row gap-4 p-4">
                    <div className="flex flex-1 flex-col gap-0.5">
                      <h2 className="text-2xl leading-6 font-bold text-stone-600">
                        {turf.name}
                      </h2>
                      <div className="flex flex-row items-center gap-0.5">
                        {/* <MapPin className="size-5 text-stone-500" /> */}
                        <p className="text-sm text-stone-400">
                          {[
                            turf.addressStreet1,
                            turf.addressTown,
                            turf.addressState,
                            turf.addressZipCode,
                          ].join(", ")}
                        </p>
                      </div>
                      <div className="mt-3 flex flex-row items-center gap-1.5">
                        <LandPlot className="size-5 text-stone-500" />
                        <p className="text-lg font-bold text-stone-500">
                          {turf.sport}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-none flex-row items-start gap-1">
                      <span className="font-medium text-stone-500">$</span>
                      <span className="text-4xl font-bold text-stone-600">
                        {turf.pricePerHour.toFixed(2)}
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
                          {turf.averageRating}
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
