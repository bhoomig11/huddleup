"use client";

import { add, format, startOfDay, parse } from "date-fns";
import {
  Loader2,
  Sunrise,
  SunDim,
  Sun,
  Sunset,
  Moon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams, data } from "react-router";
import type { Route } from "./+types/step-select-slot";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "~/components/ui/tabs";
import {
  fetchTurfDetails,
  fetchAvailableStartTimes,
  fetchAvailableEndTimes,
} from "~/api/turf";
import type { TurfDetails } from "~/types/turf";
import { saveBookingState } from "~/routes/turf/utils/booking-state";
import { authContext } from "~/middleware/auth-middleware";
import { redirectToLogin } from "~/utils/auth-errors";

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

export default function BookSelectSlot({
  loaderData,
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const {turfDetails} = loaderData;
  const turfId = turfDetails.turfId;

  // Initialize state from query params
  const getInitialDate = (): Date | undefined => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      const parsed = parse(dateParam, "yyyy-MM-dd", new Date());
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return undefined;
  };

  const [date, setDate] = useState<Date | undefined>(getInitialDate());
  const [fromTime, setFromTime] = useState<string | null>(
    searchParams.get("fromTime")
  );
  const [toTime, setToTime] = useState<string | null>(
    searchParams.get("toTime")
  );
  const [availableStartTimes, setAvailableStartTimes] = useState<string[]>([]);
  const [availableEndTimes, setAvailableEndTimes] = useState<string[]>([]);
  const [loadingStartTimes, setLoadingStartTimes] = useState(false);
  const [loadingEndTimes, setLoadingEndTimes] = useState(false);
  const [numberOfMonths, setNumberOfMonths] = useState(1);

  // Determine number of months to show based on viewport width
  useEffect(() => {
    const updateNumberOfMonths = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        // xl and above: show 3 months
        setNumberOfMonths(3);
      } else if (width >= 768) {
        // md to lg: show 2 months
        setNumberOfMonths(2);
      } else {
        // sm and below: show 1 month
        setNumberOfMonths(1);
      }
    };

    // Set initial value
    updateNumberOfMonths();

    // Update on resize
    window.addEventListener("resize", updateNumberOfMonths);
    return () => window.removeEventListener("resize", updateNumberOfMonths);
  }, []);

  // Update query params when state changes
  useEffect(() => {
    const newParams = new URLSearchParams();
    if (date) {
      newParams.set("date", format(date, "yyyy-MM-dd"));
    }
    if (fromTime) {
      newParams.set("fromTime", fromTime);
    }
    if (toTime) {
      newParams.set("toTime", toTime);
    }

    // Only update if params actually changed to avoid infinite loops
    const currentParams = searchParams.toString();
    const newParamsString = newParams.toString();
    if (currentParams !== newParamsString) {
      setSearchParams(newParams, { replace: true });
    }
  }, [date, fromTime, toTime, searchParams, setSearchParams]);

  // Fetch available start times when date is selected
  useEffect(() => {
    if (!date || !turfId) {
      setAvailableStartTimes([]);
      setFromTime(null);
      setToTime(null);
      setAvailableEndTimes([]);
      return;
    }

    setLoadingStartTimes(true);
    fetchAvailableStartTimes(turfId, date)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch available start times");
        }
        const times = (await response.json()) as string[];
        setAvailableStartTimes(times);
      })
      .catch((error) => {
        console.error("Error fetching start times:", error);
        setAvailableStartTimes([]);
      })
      .finally(() => {
        setLoadingStartTimes(false);
      });
  }, [date, turfId]);

  // Fetch available end times when start time is selected
  useEffect(() => {
    if (!date || !fromTime || !turfId) {
      setAvailableEndTimes([]);
      setToTime(null);
      setLoadingEndTimes(false);
      return;
    }

    const startTime = Date.now();
    const MIN_LOADING_TIME = 300; // Minimum 300ms loading time
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let isCancelled = false;

    setLoadingEndTimes(true);
    fetchAvailableEndTimes(turfId, date, fromTime)
      .then(async (response) => {
        if (isCancelled) return;
        
        if (!response.ok) {
          throw new Error("Failed to fetch available end times");
        }
        const times = (await response.json()) as string[];
        
        // Ensure minimum loading time has passed
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsed);
        
        timeoutId = setTimeout(() => {
          if (!isCancelled) {
            setAvailableEndTimes(times);
            setLoadingEndTimes(false);
          }
        }, remainingTime);
      })
      .catch((error) => {
        if (isCancelled) return;
        
        console.error("Error fetching end times:", error);
        
        // Ensure minimum loading time has passed even on error
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsed);
        
        timeoutId = setTimeout(() => {
          if (!isCancelled) {
            setAvailableEndTimes([]);
            setLoadingEndTimes(false);
          }
        }, remainingTime);
      });

    // Cleanup function to cancel pending timeouts
    return () => {
      isCancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [date, fromTime, turfId]);

  // Calculate valid booking date range (today to 2 months from now)
  const validBookingStartDate = startOfDay(new Date());
  const validBookingEndDate = add(validBookingStartDate, { months: 2 });

  // Format time for display (HH:mm:ss -> HH:mm)
  const formatTimeDisplay = (time: string) => {
    return time.substring(0, 5); // Extract HH:mm from HH:mm:ss
  };

  // Group times by period (covering all 24 hours)
  type TimePeriod = "earlyMorning" | "morning" | "afternoon" | "evening" | "night";

  interface PeriodConfig {
    key: TimePeriod;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    timeRange: string;
  }

  const periodConfigs: PeriodConfig[] = [
    {
      key: "earlyMorning",
      label: "Early Morning",
      icon: Sunrise,
      timeRange: "12:00 AM - 5:59 AM",
    },
    {
      key: "morning",
      label: "Morning",
      icon: SunDim,
      timeRange: "6:00 AM - 11:59 AM",
    },
    {
      key: "afternoon",
      label: "Afternoon",
      icon: Sun,
      timeRange: "12:00 PM - 4:59 PM",
    },
    {
      key: "evening",
      label: "Evening",
      icon: Sunset,
      timeRange: "5:00 PM - 8:59 PM",
    },
    {
      key: "night",
      label: "Night",
      icon: Moon,
      timeRange: "9:00 PM - 11:59 PM",
    },
  ];

  const getTimePeriod = (time: string): TimePeriod => {
    const [hour] = time.split(":").map(Number);
    if (hour >= 0 && hour < 6) return "earlyMorning";
    if (hour >= 6 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  };

  const groupTimesByPeriod = (
    times: string[]
  ): Record<TimePeriod, string[]> => {
    const grouped: Record<TimePeriod, string[]> = {
      earlyMorning: [],
      morning: [],
      afternoon: [],
      evening: [],
      night: [],
    };
    times.forEach((time) => {
      const period = getTimePeriod(time);
      grouped[period].push(time);
    });
    return grouped;
  };

  const renderTimeGrid = (
    times: string[],
    selectedTime: string | null,
    onSelect: (time: string) => void,
    isLoading: boolean = false
  ) => {
    const grouped = groupTimesByPeriod(times);

    // Filter out periods with no times (unless loading)
    const activePeriods = isLoading
      ? periodConfigs // Show all tabs when loading
      : periodConfigs.filter((p) => grouped[p.key].length > 0);

    // If loading and no times yet, show skeleton in all tabs
    if (isLoading && times.length === 0) {
      return (
        <Tabs defaultValue={periodConfigs[0]?.key} className="w-full">
          <TabsList className="grid w-full grid-cols-5 gap-1 h-auto p-1">
            {periodConfigs.map((period) => {
              const Icon = period.icon;
              return (
                <TabsTrigger
                  key={period.key}
                  value={period.key}
                  disabled={false}
                  className="flex flex-col items-center gap-1 h-auto py-3 px-2 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-medium">{period.label}</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    {period.timeRange}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          {periodConfigs.map((period) => (
            <TabsContent key={period.key} value={period.key} className="mt-4">
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton
                    key={`skeleton-${period.key}-${i}`}
                    className="h-10 w-full"
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      );
    }

    if (times.length === 0 && !isLoading) {
      return (
        <div className="rounded-lg bg-stone-50 p-4 text-center text-sm text-stone-500">
          No times available in this period
        </div>
      );
    }

    if (activePeriods.length === 0 && !isLoading) {
      return (
        <div className="rounded-lg bg-stone-50 p-4 text-center text-sm text-stone-500">
          No times available
        </div>
      );
    }

    // If only one period, don't show tabs
    if (activePeriods.length === 1) {
      const periodKey = activePeriods[0]!.key;
      const periodTimes = grouped[periodKey];
      
      return (
        <div className="grid grid-cols-4 gap-2">
          {isLoading && periodTimes.length === 0 ? (
            // Show skeleton buttons while loading
            Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={`skeleton-${i}`} className="h-10 w-full" />
            ))
          ) : (
            periodTimes.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <Button
                  key={time}
                  variant={isSelected ? "default" : "outline"}
                  className={
                    isSelected
                      ? "bg-green-700 hover:bg-green-600"
                      : "hover:bg-stone-50"
                  }
                  onClick={() => onSelect(time)}
                >
                  {formatTimeDisplay(time)}
                </Button>
              );
            })
          )}
        </div>
      );
    }

    return (
      <Tabs defaultValue={activePeriods[0]?.key} className="w-full">
        <TabsList className="grid w-full grid-cols-5 gap-1 h-auto p-1">
          {periodConfigs.map((period) => {
            const hasTimes = grouped[period.key].length > 0 || isLoading;
            const Icon = period.icon;
            return (
              <TabsTrigger
                key={period.key}
                value={period.key}
                disabled={!hasTimes && !isLoading}
                className="flex flex-col items-center gap-1 h-auto py-3 px-2 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium">{period.label}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  {period.timeRange}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {periodConfigs.map((period) => {
          const periodTimes = grouped[period.key];
          const hasTimes = periodTimes.length > 0;
          const showSkeletons = isLoading && !hasTimes;
          
          return (
            <TabsContent key={period.key} value={period.key} className="mt-4">
              <div className="grid grid-cols-4 gap-2">
                {showSkeletons ? (
                  // Show skeleton buttons while loading
                  Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton
                      key={`skeleton-${period.key}-${i}`}
                      className="h-10 w-full"
                    />
                  ))
                ) : hasTimes ? (
                  periodTimes.map((time) => {
                    const isSelected = selectedTime === time;
                    return (
                      <Button
                        key={time}
                        variant={isSelected ? "default" : "outline"}
                        className={
                          isSelected
                            ? "bg-green-700 hover:bg-green-600"
                            : "hover:bg-stone-50"
                        }
                        onClick={() => onSelect(time)}
                      >
                        {formatTimeDisplay(time)}
                      </Button>
                    );
                  })
                ) : null}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    );
  };

  const isComplete = date && fromTime && toTime;

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setFromTime(null);
    setToTime(null);
    setAvailableEndTimes([]);
  };

  const handleStartTimeSelect = (time: string) => {
    setFromTime(time);
    setToTime(null);
  };

  const handleNext = () => {
    if (!isComplete) return;

    // Save booking state (for other steps that need it)
    saveBookingState({
      turfId,
      date: format(date!, "yyyy-MM-dd"),
      fromTime: fromTime!,
      toTime: toTime!,
    });

    navigate(`/turf/${turfId}/book/step-2`);
  };

  const handleCancel = () => {
    navigate(`/turf/${turfId}`);
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
            {/* Operating Hours Info */}
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Operating Hours:</span>{" "}
                {turfDetails.opensAtLocalTime} - {turfDetails.closesAtLocalTime}
              </p>
            </div>

            {/* Date Selection - Inline Calendar */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-700">Date</label>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  captionLayout="label"
                  numberOfMonths={numberOfMonths}
                  onSelect={handleDateSelect}
                  defaultMonth={date ?? validBookingStartDate}
                  startMonth={validBookingStartDate}
                  endMonth={validBookingEndDate}
                  disabled={{
                    before: validBookingStartDate,
                    after: validBookingEndDate,
                  }}
                />
              </div>
            </div>

            {/* Start Time Selection */}
            {date && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700">
                  Start Time
                </label>
                {loadingStartTimes ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
                    <span className="ml-2 text-sm text-stone-500">
                      Loading available times...
                    </span>
                  </div>
                ) : availableStartTimes.length === 0 ? (
                  <div className="rounded-lg bg-yellow-50 p-3">
                    <p className="text-sm text-yellow-800">
                      No available start times for this date.
                    </p>
                  </div>
                ) : (
                  renderTimeGrid(
                    availableStartTimes,
                    fromTime,
                    handleStartTimeSelect
                  )
                )}
              </div>
            )}

            {/* End Time Selection */}
            {date && fromTime && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700">
                  End Time
                </label>
                {availableEndTimes.length === 0 && !loadingEndTimes ? (
                  <div className="rounded-lg bg-yellow-50 p-3">
                    <p className="text-sm text-yellow-800">
                      No available end times for the selected start time.
                    </p>
                  </div>
                ) : (
                  renderTimeGrid(
                    availableEndTimes,
                    toTime,
                    setToTime,
                    loadingEndTimes
                  )
                )}
              </div>
            )}

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={handleCancel}>
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

