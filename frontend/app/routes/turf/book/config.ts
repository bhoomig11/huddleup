import { Sunrise, SunDim, Sun, Sunset, Moon } from "lucide-react";

export const TIME_PERIODS = [
  {
    key: "earlyMorning",
    label: "Early Morning",
    icon: Sunrise,
    startTime: "00:00",
    endTime: "05:59",
  },
  {
    key: "morning",
    label: "Morning",
    icon: SunDim,
    startTime: "06:00",
    endTime: "11:59",
  },
  {
    key: "afternoon",
    label: "Afternoon",
    icon: Sun,
    startTime: "12:00",
    endTime: "16:59",
  },
  {
    key: "evening",
    label: "Evening",
    icon: Sunset,
    startTime: "17:00",
    endTime: "20:59",
  },
  {
    key: "night",
    label: "Night",
    icon: Moon,
    startTime: "21:00",
    endTime: "23:59",
  },
] as const;

export type TimePeriod = (typeof TIME_PERIODS)[number];
