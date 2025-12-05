import { useState } from "react";
import { Clock, ChevronDownIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { TimeGrid } from "../book/components/time-grid";
import {
  formatTimeTo12Hour,
  toHourMinute,
} from "../book/components/time-grid-utils";
import { cn } from "~/lib/utils";

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

type TimeSlotPickerProps = {
  fromTime: string | null;
  toTime: string | null;
  onFromTimeChange: (time: string | null) => void;
  onToTimeChange: (time: string | null) => void;
  /**
   * Custom className for the trigger button
   */
  triggerClassName?: string;
  /**
   * Alignment of the popover content. Defaults to "center".
   */
  align?: "start" | "center" | "end";
  /**
   * Custom time slots to use instead of the default ones.
   * If provided, these will be used for both "from" and "to" selections.
   */
  customTimeSlots?: string[];
};

export function TimeSlotPicker({
  fromTime,
  toTime,
  onFromTimeChange,
  onToTimeChange,
  triggerClassName,
  align = "center",
  customTimeSlots,
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

  // Use custom time slots if provided, otherwise use the default fromTimes/toTimes
  const availableFromTimes = customTimeSlots || fromTimes;
  const availableToTimes = customTimeSlots || toTimes;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="time-picker"
          className={cn(
            "justify-between font-normal",
            triggerClassName || "h-12 min-w-48 rounded-none border-0 bg-white"
          )}
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
        align={align}
      >
        <div className="space-y-4 p-4">
          <div>
            <div className="mb-2 text-xs font-medium text-stone-500">From</div>
            <TimeGrid
              times={availableFromTimes}
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
                times={availableToTimes.filter((t) => t > fromTime)}
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
