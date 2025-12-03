"use client";

import { Check } from "lucide-react";
import { useLocation } from "react-router";
import { cn } from "~/lib/utils";

interface Step {
  id: string;
  label: string;
  path: string;
}

const steps: Step[] = [
  { id: "1", label: "Select Date & Time", path: "step-select-slot" },
  { id: "2", label: "Payment Method", path: "step-2" },
  { id: "3", label: "Review & Confirm", path: "step-3" },
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
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                    isCompleted &&
                      "bg-green-700 border-green-700 text-white",
                    isCurrent &&
                      "bg-green-700 border-green-700 text-white",
                    isUpcoming &&
                      "bg-white border-stone-300 text-stone-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center max-w-[100px]",
                    isCurrent && "text-green-700",
                    isCompleted && "text-stone-600",
                    isUpcoming && "text-stone-400"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 transition-colors",
                    isCompleted ? "bg-green-700" : "bg-stone-300"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

