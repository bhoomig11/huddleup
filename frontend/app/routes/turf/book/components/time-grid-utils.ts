import { TIME_PERIODS, type TimePeriod } from "../config";

export type TimePeriodKey = TimePeriod["key"];

export type PeriodConfig = TimePeriod & {
  timeRange: string;
};

/**
 * Extracts the hour and minute portion from a time string (HH:mm or HH:mm:ss)
 * Returns time in HH:mm format
 */
export function toHourMinute(time: string): string {
  return time.substring(0, 5); // Extract HH:mm from HH:mm or HH:mm:ss
}

/**
 * Formats a time string (HH:mm) to 12-hour display format
 * e.g., formatTimeTo12Hour("06:00") -> "6:00 AM"
 */
export function formatTimeTo12Hour(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  let displayHour = hours % 12;
  if (displayHour === 0) displayHour = 12;

  return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Formats a time range from 24-hour start/end times to a display string
 * e.g., formatTimeRange("00:00", "05:59") -> "12:00 AM - 5:59 AM"
 */
function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTimeTo12Hour(startTime)} - ${formatTimeTo12Hour(endTime)}`;
}

export const PERIOD_CONFIGS: PeriodConfig[] = TIME_PERIODS.map((config) => ({
  ...config,
  timeRange: formatTimeRange(config.startTime, config.endTime),
}));

/**
 * Determines which time period a given time (HH:mm or HH:mm:ss) falls into
 */
export function getTimePeriod(time: string): TimePeriodKey {
  const normalizedTime = toHourMinute(time);

  const period: TimePeriod =
    PERIOD_CONFIGS.find(
      (config) =>
        normalizedTime >= config.startTime && normalizedTime <= config.endTime
    ) ?? PERIOD_CONFIGS[0];
  return period.key;
}

/**
 * Groups times by their time period
 */
export function groupTimesByPeriod(
  times: string[]
): Record<TimePeriodKey, string[]> {
  const grouped = {} as Record<TimePeriodKey, string[]>;

  for (const config of PERIOD_CONFIGS) {
    grouped[config.key] = [];
  }

  if (times.length === 0) {
    return grouped;
  }

  // Since times are sorted and periods are in chronological order,
  // we can do a single pass: iterate through times and advance period index as needed
  let currentPeriodIndex = 0;

  for (const time of times) {
    const normalizedTime = toHourMinute(time);

    // Advance period index until we find the period that contains this time
    while (
      currentPeriodIndex < PERIOD_CONFIGS.length - 1 &&
      normalizedTime > PERIOD_CONFIGS[currentPeriodIndex].endTime
    ) {
      currentPeriodIndex++;
    }

    const period = PERIOD_CONFIGS[currentPeriodIndex];
    if (
      normalizedTime >= period.startTime &&
      normalizedTime <= period.endTime
    ) {
      grouped[period.key].push(time);
    }
  }

  return grouped;
}
