import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import {
  PERIOD_CONFIGS,
  formatTimeTo12Hour,
  groupTimesByPeriod,
  toHourMinute,
  getTimePeriod,
  type TimePeriodKey,
} from "./time-grid-utils";
import { useMemo, useState, useEffect } from "react";

interface TimeGridProps {
  times: string[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
  isLoading?: boolean;
}

export function TimeGrid({
  times,
  selectedTime,
  onSelect,
  isLoading = false,
}: TimeGridProps) {
  const grouped = useMemo(() => groupTimesByPeriod(times), [times]);

  const firstPeriodWithTimes = useMemo(() => {
    return PERIOD_CONFIGS.find((period) => grouped[period.key].length > 0);
  }, [grouped]);

  const selectedTimePeriodKey = useMemo(() => {
    if (!selectedTime) return null;
    return getTimePeriod(selectedTime);
  }, [selectedTime]);

  const [selectedPeriodKey, setSelectedPeriodKey] = useState(
    selectedTimePeriodKey ?? firstPeriodWithTimes?.key ?? PERIOD_CONFIGS[0].key
  );

  useEffect(() => {
    if (!isLoading && firstPeriodWithTimes) {
      const isCurrentPeriodAvailable = grouped[selectedPeriodKey].length > 0;
      if (!isCurrentPeriodAvailable) {
        setSelectedPeriodKey(firstPeriodWithTimes.key);
      }
    }
  }, [grouped, isLoading, firstPeriodWithTimes, selectedPeriodKey]);

  const handlePeriodChange = (value: string) => {
    setSelectedPeriodKey(value as TimePeriodKey);
  };

  return (
    <Tabs
      value={selectedPeriodKey}
      onValueChange={handlePeriodChange}
      className="w-full"
    >
      <TabsList className="grid h-auto w-full grid-cols-5 gap-1 p-1">
        {PERIOD_CONFIGS.map((period) => {
          const hasTimes = grouped[period.key].length > 0;
          const hasSelectedTime = selectedTimePeriodKey === period.key;
          const Icon = period.icon;
          return (
            <TabsTrigger
              key={period.key}
              value={period.key}
              disabled={isLoading || !hasTimes}
              className="flex h-auto flex-col items-center gap-1 px-2 py-3 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm sm:text-sm"
            >
              <Icon className="size-4 sm:size-5" />
              <div className="relative">
                {hasSelectedTime && (
                  <span
                    className="absolute -top-0.5 -right-2 size-1.5 rounded-full bg-green-600"
                    aria-label="Selected time in this period"
                  />
                )}
                <span className="font-medium">{period.label}</span>
              </div>
              <span className="text-[10px] text-muted-foreground sm:text-xs">
                {period.timeRange}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
      {PERIOD_CONFIGS.map((period) => {
        const periodTimes = grouped[period.key];
        const hasTimes = periodTimes.length > 0;

        return (
          <TabsContent key={period.key} value={period.key} className="mt-4">
            {isLoading ? (
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton
                    key={`skeleton-${period.key}-${i}`}
                    className="h-10 w-full"
                  />
                ))}
              </div>
            ) : hasTimes ? (
              <div className="grid grid-cols-4 gap-2">
                {periodTimes.map((time) => {
                  const isSelected = selectedTime === time;
                  return (
                    <Button
                      key={time}
                      variant={isSelected ? "default" : "outline"}
                      className={
                        isSelected
                          ? "bg-green-700 hover:bg-green-700"
                          : "hover:bg-stone-50"
                      }
                      onClick={() => onSelect(time)}
                    >
                      {formatTimeTo12Hour(toHourMinute(time))}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg bg-stone-50 p-4 text-center text-sm text-stone-500">
                No times available in this period
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
