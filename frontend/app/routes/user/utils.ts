import { cn } from "~/lib/utils";

export const getInputClass = (value: string) =>
  cn(
    "bg-stone-50 border-stone-300/80 focus:bg-white focus:ring-2 focus:ring-green-700/80",
    value && value.trim() !== "" && "bg-white"
  );

