import { useState } from "react";
import { add, format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

type DatePickerProps = {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  /**
   * Number of months to display in the calendar. Defaults to 2 for browse page, 1 for landing page.
   */
  numberOfMonths?: number;
  /**
   * Custom className for the trigger button
   */
  triggerClassName?: string;
  /**
   * Alignment of the popover content. Defaults to "center".
   */
  align?: "start" | "center" | "end";
};

export function DatePicker({
  date,
  onDateChange,
  numberOfMonths = 2,
  triggerClassName,
  align = "center",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const validBookingStartDate = new Date();
  const validBookingEndDate = add(validBookingStartDate, { months: 2 });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="date-picker"
          className={cn(
            "justify-between font-normal",
            triggerClassName ||
              "h-12 min-w-40 rounded-none border-0 border-r border-stone-300/80 bg-white"
          )}
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
        align={align}
      >
        <div className="p-4">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="label"
            numberOfMonths={numberOfMonths}
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
