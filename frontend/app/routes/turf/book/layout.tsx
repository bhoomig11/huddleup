"use client";

import { Outlet } from "react-router";
import { BookingStepper } from "./booking-stepper";

export default function BookLayout() {
  return (
    <main className="flex w-full flex-col items-center py-8">
      <div className="w-full max-w-4xl px-4">
        <BookingStepper />
        <Outlet />
      </div>
    </main>
  );
}
