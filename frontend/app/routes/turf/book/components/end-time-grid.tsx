import { useEffect } from "react";
import { useFetcher } from "react-router";
import { TimeGrid } from "./time-grid";
import type { clientLoader } from "../../available-end-times";
import { useDebouncedLoading } from "../hooks/use-debounced-loading";
import { formatDateToLocalString } from "../utils/date-utils";

interface EndTimeGridProps {
  turfId: number;
  date: Date;
  startTime: string;
  selectedTime: string | null;
  onSelect: (time: string) => void;
}

export function EndTimeGrid({
  turfId,
  date,
  startTime,
  selectedTime,
  onSelect,
}: EndTimeGridProps) {
  const fetcher = useFetcher<typeof clientLoader>();

  useEffect(() => {
    const dateString = formatDateToLocalString(date);
    fetcher.load(
      `/turf/${turfId}/available-end-times?date=${dateString}&startTime=${encodeURIComponent(startTime)}`
    );
  }, [date, startTime, turfId]);

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
