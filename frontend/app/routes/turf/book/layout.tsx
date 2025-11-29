"use client";

import { ChevronLeft } from "lucide-react";
import { Outlet } from "react-router";

export default function BookLayout() {
  return (
    <div className="min-h-screen w-full bg-stone-100">
      {/* Header */}
      <div className="h-20 w-full border-b border-stone-300/80 bg-stone-100 py-4">
        <header className="mx-auto flex max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-stone-200 active:bg-stone-300">
              <ChevronLeft className="size-6 text-stone-700" />
            </button>
            <span className="bg-green-700 px-4 py-2 text-3xl font-bold tracking-wide text-white">
              HuddleUp
            </span>
          </div>
          <div className="flex-1"></div>
        </header>
      </div>

      <main className="flex w-full flex-col items-center py-8">
        <div className="w-full max-w-2xl px-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
