import { useEffect } from "react";
import { useFetcher } from "react-router";
import { format } from "date-fns";
import { TimeGrid } from "./time-grid";
import type { clientLoader } from "../../available-start-times";
import { useDebouncedLoading } from "../hooks/use-debounced-loading";

interface StartTimeGridProps {
  turfId: number;
  date: Date;
  selectedTime: string | null;
  onSelect: (time: string) => void;
}

export function StartTimeGrid({
  turfId,
  date,
  selectedTime,
  onSelect,
}: StartTimeGridProps) {
  const fetcher = useFetcher<typeof clientLoader>();

  useEffect(() => {
    const dateString = format(date, "yyyy-MM-dd");
    fetcher.load(`/turf/${turfId}/available-start-times?date=${dateString}`);
  }, [date, turfId]);

  const times = fetcher.data || [];
  const isLoading = fetcher.state !== "idle";
  const debouncedLoading = useDebouncedLoading(isLoading);

  return (
    <TimeGrid
      times={times}
      selectedTime={selectedTime}
      onSelect={onSelect}
      isLoading={debouncedLoading}
    />
  );
}
