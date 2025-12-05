import { add, format } from "date-fns";
import {
  ChevronDownIcon,
  LandPlot,
  Search,
  Calendar as CalendarIcon,
  Clock,
  X,
  ArrowUpDown,
  Check,
  Star,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { TimeGrid } from "./book/components/time-grid";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
import { searchTurfs, fetchAllFeatures } from "~/api/turf";
import { data, Link } from "react-router";
import type { TurfSummary, TurfFeature } from "~/types/turf";
import type { Route } from "./+types/browse-turfs";
import {
  formatTimeTo12Hour,
  toHourMinute,
} from "./book/components/time-grid-utils";
import { useTurfSearchParams } from "./hooks/use-turf-search-params";
import { Slider } from "~/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/lib/utils";
import { getFeatureIcon } from "~/config/turf-feature-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || undefined;
  const date = url.searchParams.get("date") || undefined;
  const fromTime = url.searchParams.get("fromTime") || undefined;
  const toTime = url.searchParams.get("toTime") || undefined;

  const [turfsResponse, featuresResponse] = await Promise.all([
    searchTurfs({
      query,
      date,
      fromTime,
      toTime,
    }),
    fetchAllFeatures(),
  ]);

  if (!turfsResponse.ok) {
    throw data("Error fetching turfs", { status: turfsResponse.status }); // TODO: Handle this better!
  }

  const turfs = (await turfsResponse.json()) as Array<TurfSummary>;
  const features = featuresResponse.ok
    ? ((await featuresResponse.json()) as Array<TurfFeature>)
    : [];

  return { turfs, features };
}

export default function BrowseTurfsPage({ loaderData }: Route.ComponentProps) {
  const turfSearchParams = useTurfSearchParams();
  const turfs = loaderData.turfs;
  const allFeatures = loaderData.features;

  const uniqueSports = useMemo(() => {
    const sports = new Set(turfs.map((t) => t.sportName));
    return Array.from(sports).sort();
  }, [turfs]);

  const minPrice = useMemo(() => {
    return Math.min(...turfs.map((t) => t.hourlyRate), 0);
  }, [turfs]);

  const maxPrice = useMemo(() => {
    return Math.max(...turfs.map((t) => t.hourlyRate), 1000);
  }, [turfs]);

  // Initialize price range from data if not set in URL (only once)
  useEffect(() => {
    const urlMinPrice = turfSearchParams.priceRange[0];
    const urlMaxPrice = turfSearchParams.priceRange[1];

    if (
      urlMinPrice === 0 &&
      urlMaxPrice === 1000 &&
      minPrice !== maxPrice &&
      minPrice >= 0 &&
      maxPrice > minPrice
    ) {
      turfSearchParams.handlePriceRangeChange([minPrice, maxPrice]);
    }
  }, [minPrice, maxPrice, turfSearchParams.handlePriceRangeChange]);

  // Filter and sort turfs
  const filteredAndSortedTurfs = useMemo(() => {
    const filtered = turfs.filter((turf) => {
      // Sport filter
      if (
        turfSearchParams.selectedSport &&
        turf.sportName !== turfSearchParams.selectedSport
      ) {
        return false;
      }

      // Price filter (use debounced value for efficiency)
      if (
        turf.hourlyRate < turfSearchParams.debouncedPriceRange[0] ||
        turf.hourlyRate > turfSearchParams.debouncedPriceRange[1]
      ) {
        return false;
      }

      // Rating filter
      if (
        turfSearchParams.minRating !== null &&
        (turf.averageRating ?? 0) < turfSearchParams.minRating
      ) {
        return false;
      }

      // Features filter - turf must have all selected features
      if (turfSearchParams.selectedFeatures.size > 0) {
        const turfFeatureNames = new Set(
          turf.features.map((f) => f.featureName)
        );
        for (const selectedFeature of turfSearchParams.selectedFeatures) {
          if (!turfFeatureNames.has(selectedFeature)) {
            return false;
          }
        }
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (turfSearchParams.sortBy) {
        case "name":
          return a.turfName.localeCompare(b.turfName);
        case "rating":
          return (b.averageRating ?? 0) - (a.averageRating ?? 0);
        case "price-low":
          return a.hourlyRate - b.hourlyRate;
        case "price-high":
          return b.hourlyRate - a.hourlyRate;
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    turfs,
    turfSearchParams.selectedSport,
    turfSearchParams.debouncedPriceRange,
    turfSearchParams.minRating,
    turfSearchParams.selectedFeatures,
    turfSearchParams.sortBy,
  ]);

  const hasActiveFilters =
    turfSearchParams.selectedSport !== null ||
    turfSearchParams.debouncedPriceRange[0] !== minPrice ||
    turfSearchParams.debouncedPriceRange[1] !== maxPrice ||
    turfSearchParams.minRating !== null ||
    turfSearchParams.selectedFeatures.size > 0;

  const handleClearFilters = () => {
    turfSearchParams.clearFilters();
    if (turfs.length > 0 && minPrice !== maxPrice) {
      turfSearchParams.handlePriceRangeChange([minPrice, maxPrice]);
    }
  };

  return (
    <main className="flex w-full flex-col items-center">
      <div className="grid h-20 grid-cols-[1fr_48rem_1fr] items-start gap-4 bg-stone-100 py-4">
        <div className="self-center text-2xl font-bold text-stone-600">
          <span>Browse Turfs</span>
        </div>
        <div className="flex h-12 w-3xl shrink-0 flex-row self-center justify-self-center overflow-hidden rounded border border-stone-300/80 has-[[data-slot='popover-trigger'][data-state='open']]:border-green-800 has-[[data-slot='popover-trigger'][data-state='open']]:ring has-[[data-slot='popover-trigger'][data-state='open']]:ring-green-800/50 has-[input:focus-visible]:border-green-800 has-[input:focus-visible]:ring has-[input:focus-visible]:ring-green-800/50">
          <InputGroup className="h-12 self-baseline rounded-none border-0 border-r border-stone-300/80 bg-white">
            <InputGroupInput
              type="text"
              className="h-12 rounded-none px-4 py-2 font-medium text-stone-600"
              placeholder="Search by name, location, or sport"
              value={turfSearchParams.query}
              onChange={(e) => turfSearchParams.setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  turfSearchParams.handleSearch();
                }
              }}
            />
            <InputGroupAddon>
              <Search className="size-5 text-stone-500" />
            </InputGroupAddon>
          </InputGroup>
          <DatePicker
            date={turfSearchParams.date}
            onDateChange={turfSearchParams.handleDateChange}
          />
          <TimeSlotPicker
            fromTime={turfSearchParams.fromTime}
            toTime={turfSearchParams.toTime}
            onFromTimeChange={turfSearchParams.handleFromTimeChange}
            onToTimeChange={turfSearchParams.handleToTimeChange}
          />
        </div>
        <div className="self-center">
          <Button
            variant="default"
            className="h-12 rounded border-stone-300/80 bg-green-700 text-white hover:bg-green-600 active:bg-green-700"
            onClick={turfSearchParams.handleSearch}
          >
            Search
          </Button>
        </div>
        {/* Left Sidebar - Filters */}
        <div className="flex flex-col gap-4 pr-8">
          <div className="flex h-9 items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-600">Filters</h2>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-7 gap-0.5 text-xs text-stone-500 hover:bg-stone-200/40 hover:text-stone-700"
              >
                <X className="mr-1 size-3" />
                Clear
              </Button>
            )}
          </div>

          {/* Sport Type Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-stone-600">
              Sport Type
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal"
                >
                  {turfSearchParams.selectedSport || "All Sports"}
                  <ChevronDownIcon className="ml-2 size-4 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                style={{ width: "var(--radix-dropdown-menu-trigger-width)" }}
              >
                <DropdownMenuItem
                  onClick={() => turfSearchParams.handleSportChange(null)}
                >
                  All Sports
                </DropdownMenuItem>
                {uniqueSports.map((sport) => (
                  <DropdownMenuItem
                    key={sport}
                    onClick={() => turfSearchParams.handleSportChange(sport)}
                  >
                    {sport}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-stone-600">
              Price Range
            </Label>
            <div className="px-2">
              <Slider
                value={turfSearchParams.priceRange}
                onValueChange={(value) =>
                  turfSearchParams.handlePriceRangeChange([
                    value[0],
                    value[1],
                  ] as [number, number])
                }
                min={minPrice}
                max={maxPrice}
                step={1}
              />
            </div>
            <div className="flex justify-between text-xs text-stone-500">
              <span>${turfSearchParams.priceRange[0].toFixed(2)}</span>
              <span>${turfSearchParams.priceRange[1].toFixed(2)}</span>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-stone-600">
              Minimum Rating
            </Label>
            <RadioGroup
              value={turfSearchParams.minRating?.toString() ?? ""}
              onValueChange={(value) => {
                turfSearchParams.handleMinRatingChange(
                  value ? Number(value) : null
                );
              }}
              className="flex flex-col gap-2"
            >
              {[5, 4, 3, 2, 1].map((rating) => {
                const isSelected = turfSearchParams.minRating === rating;
                return (
                  <div key={rating} className="relative">
                    <RadioGroupItem
                      value={rating.toString()}
                      id={`rating-${rating}`}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor={`rating-${rating}`}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-normal transition-all",
                        isSelected
                          ? "border-amber-400 bg-amber-50 text-amber-700 shadow-sm"
                          : "border-stone-300 bg-white text-stone-600 hover:border-stone-400 hover:bg-stone-50"
                      )}
                    >
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="size-4 fill-current text-yellow-400"
                          />
                        ))}
                      </div>
                      <span className="text-sm">
                        {rating === 5 ? "5 stars" : `${rating}+ stars`}
                      </span>
                      <span className="size-4 shrink-0">
                        {isSelected && (
                          <Check className="ml-auto size-4 text-amber-600" />
                        )}
                      </span>
                    </label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Features Filter */}
          {allFeatures.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-stone-600">
                Features
              </Label>
              <div className="space-y-2">
                {allFeatures.map((feature) => {
                  const isSelected = turfSearchParams.selectedFeatures.has(
                    feature.featureName
                  );
                  const Icon = getFeatureIcon(feature.featureName);
                  return (
                    <div
                      key={feature.featureName}
                      className="flex items-center space-x-3"
                    >
                      <Checkbox
                        id={`feature-${feature.featureName}`}
                        checked={isSelected}
                        onCheckedChange={() =>
                          turfSearchParams.handleFeatureToggle(
                            feature.featureName
                          )
                        }
                        className="size-5 border-2 border-stone-300 bg-white data-[state=checked]:border-green-700 data-[state=checked]:bg-green-700"
                      />
                      <label
                        htmlFor={`feature-${feature.featureName}`}
                        className="flex cursor-pointer items-center gap-2 text-sm font-normal text-stone-600"
                      >
                        <Icon className="size-4 shrink-0 text-green-700" />
                        <span>{feature.featureName}</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Center - Results */}
        <div className="flex flex-col gap-4">
          {/* Header with count and sorting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-stone-600">
                Search Results
              </h1>
              <span className="text-sm text-stone-500">
                ({filteredAndSortedTurfs.length})
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 gap-2">
                  <ArrowUpDown className="size-4" />
                  Sort:{" "}
                  {turfSearchParams.sortBy === "name"
                    ? "Name"
                    : turfSearchParams.sortBy === "rating"
                      ? "Rating"
                      : turfSearchParams.sortBy === "price-low"
                        ? "Price: Low to High"
                        : "Price: High to Low"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => turfSearchParams.handleSortChange("name")}
                >
                  Name
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => turfSearchParams.handleSortChange("rating")}
                >
                  Rating
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => turfSearchParams.handleSortChange("price-low")}
                >
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    turfSearchParams.handleSortChange("price-high")
                  }
                >
                  Price: High to Low
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <ul className="space-y-4 pb-8">
            {filteredAndSortedTurfs.map((turf) => (
              <li
                className="flex w-3xl flex-row overflow-hidden rounded-lg border border-stone-300/60 bg-white shadow"
                key={turf.turfId}
              >
                <div className="flex-none">
                  <img
                    className="h-full w-48 object-cover"
                    src={turf.imageUrl}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex flex-row gap-4 p-4">
                    <div className="flex flex-1 flex-col gap-0.5">
                      <h2 className="text-2xl leading-6 font-bold text-stone-600">
                        {turf.turfName}
                      </h2>
                      <div className="flex flex-row items-center gap-0.5">
                        <p className="text-sm text-stone-400">
                          {[
                            turf.address.streetLine1,
                            turf.address.streetLine2,
                            turf.address.town,
                            [turf.address.state, turf.address.zipcode]
                              .filter(Boolean)
                              .join(" "),
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
                    <div className="flex flex-row items-baseline gap-2">
                      <Link
                        to={`/turf/${turf.turfId}`}
                        className="flex h-9 items-center justify-center rounded px-3.5 py-1.5 text-sm font-semibold text-green-700 hover:bg-stone-300/30 active:bg-stone-300/60"
                      >
                        View Details
                      </Link>
                      <Link
                        to={`/turf/${turf.turfId}/book`}
                        className="flex h-9 items-center justify-center rounded bg-green-700 px-3.5 py-1.5 text-sm text-white hover:bg-green-600 active:bg-green-700"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Sidebar - Empty for now */}
        <div></div>
      </div>
    </main>
  );
}

type DatePickerProps = {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
};

function DatePicker({ date, onDateChange }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const validBookingStartDate = new Date();
  const validBookingEndDate = add(validBookingStartDate, { months: 2 });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="date-picker"
          className="h-12 min-w-40 justify-between rounded-none border-0 border-r border-stone-300/80 bg-white font-normal"
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4 shrink-0 text-stone-500" />
            <span className="truncate text-stone-600">
              {date ? format(date, "EEE, MMM dd") : "Select date"}
            </span>
          </div>
          <ChevronDownIcon className="size-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto overflow-hidden bg-white p-0"
        align="center"
      >
        <div className="p-4">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="label"
            numberOfMonths={2}
            onSelect={(selectedDate) => {
              onDateChange(selectedDate);
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
        </div>
      </PopoverContent>
    </Popover>
  );
}

type TimeSlotPickerProps = {
  fromTime: string | null;
  toTime: string | null;
  onFromTimeChange: (time: string | null) => void;
  onToTimeChange: (time: string | null) => void;
};

function TimeSlotPicker({
  fromTime,
  toTime,
  onFromTimeChange,
  onToTimeChange,
}: TimeSlotPickerProps) {
  const [open, setOpen] = useState(false);

  const displayText = () => {
    if (fromTime && toTime) {
      return `${formatTimeTo12Hour(toHourMinute(fromTime))} - ${formatTimeTo12Hour(toHourMinute(toTime))}`;
    }
    if (fromTime) {
      return `${formatTimeTo12Hour(toHourMinute(fromTime))} - ...`;
    }
    return "Select time";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="time-picker"
          className="h-12 min-w-48 justify-between rounded-none border-0 bg-white font-normal"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Clock className="size-4 shrink-0 text-stone-500" />
            <span className="truncate text-stone-600">{displayText()}</span>
          </div>
          <ChevronDownIcon className="ml-2 size-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto overflow-hidden bg-white p-0"
        align="center"
      >
        <div className="space-y-4 p-4">
          <div>
            <div className="mb-2 text-xs font-medium text-stone-500">From</div>
            <TimeGrid
              times={fromTimes}
              selectedTime={fromTime}
              onSelect={(time) => {
                onFromTimeChange(time);
              }}
            />
          </div>

          {fromTime && (
            <div>
              <div className="mb-2 text-xs font-medium text-stone-500">To</div>
              <TimeGrid
                times={toTimes.filter((t) => t > fromTime)}
                selectedTime={toTime}
                onSelect={(time) => {
                  onToTimeChange(time);
                  if (fromTime && time) {
                    setOpen(false);
                  }
                }}
              />
            </div>
          )}

          {(fromTime || toTime) && (
            <div className="flex justify-end gap-2 border-t border-stone-200 pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onFromTimeChange(null);
                  onToTimeChange(null);
                }}
                className="text-xs"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Constructs a time string in the 24-hours format "HH:MM:SS" (e.g. "14:27:00").
 *
 * @param hour the hour mark for the time (0-23)
 * @param minute the minute mark for the time (0-59)
 * @returns the constructed time string
 */
function create24HrTimeString(hour: number, minute: number): string {
  const hourString = hour.toString().padStart(2, "0"); // E.g. converts 3 to "03"
  const minuteString = minute.toString().padStart(2, "0");
  return `${hourString}:${minuteString}:00`;
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
