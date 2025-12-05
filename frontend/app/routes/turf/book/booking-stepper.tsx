"use client";

import { Fragment } from "react";
import { Check } from "lucide-react";
import { useLocation } from "react-router";
import { cn } from "~/lib/utils";

interface Step {
  label: string;
  path: string;
}

const steps: Step[] = [
  { label: "Select Date & Time", path: "step-select-slot" },
  { label: "Payment Method", path: "step-select-card" },
  { label: "Review & Confirm", path: "step-review" },
];

export function BookingStepper() {
  const location = useLocation();
  const currentPath = location.pathname;

  const getCurrentStepIndex = () => {
    const index = steps.findIndex((step) => currentPath.includes(step.path));
    return index >= 0 ? index : 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="w-full px-8 py-6">
      <div
        className="grid place-items-center gap-2"
        style={{
          gridTemplateColumns: steps
            .map((_, index) => (index < steps.length - 1 ? "auto 1fr" : "auto"))
            .join(" "),
          gridTemplateRows: "auto auto",
        }}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          const circleColumn = index * 2 + 1;
          const connectorColumn = index * 2 + 2;

          return (
            <Fragment key={step.path}>
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  isCompleted && "border-green-700 bg-green-700 text-white",
                  isCurrent && "border-green-700 bg-green-700 text-white",
                  isUpcoming && "border-stone-300 bg-white text-stone-400"
                )}
                style={{
                  gridColumn: circleColumn,
                  gridRow: "1",
                }}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              <div
                className={cn(
                  "max-w-20 text-center text-xs font-medium",
                  isCurrent && "text-green-700",
                  isCompleted && "text-stone-600",
                  isUpcoming && "text-stone-400"
                )}
                style={{
                  gridColumn: circleColumn,
                  gridRow: "2",
                }}
              >
                {step.label}
              </div>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 self-center justify-self-stretch transition-colors",
                    isCompleted ? "bg-green-700" : "bg-stone-300"
                  )}
                  style={{
                    gridColumn: connectorColumn,
                    gridRow: "1",
                  }}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
