"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  turfId: number | string;
  images: string[];
  initialImage?: string;
};

export default function TurfImageCarousel({
  turfId,
  images: initialImages,
  initialImage,
}: Props) {
  const imgs =
    initialImages && initialImages.length > 0
      ? initialImages
      : initialImage
        ? [initialImage]
        : [];
  const [index, setIndex] = useState(0);

  const prev = () => {
    if (imgs.length === 0) return;
    setIndex((i) => (i - 1 + imgs.length) % imgs.length);
  };

  const next = () => {
    if (imgs.length === 0) return;
    setIndex((i) => (i + 1) % imgs.length);
  };

  const current = imgs[index];

  return (
    <div className="relative h-96 w-full overflow-hidden bg-stone-300">
      {current ? (
        <img
          src={current}
          alt={`turf-${turfId}-${index}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-stone-300 text-stone-600">
          No images available
        </div>
      )}

      {/* Left / Right Controls */}
      {imgs.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous image"
            className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={next}
            aria-label="Next image"
            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
          >
            <ChevronRight />
          </button>
        </>
      )}

      {/* Indicators */}
      {imgs.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {imgs.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to image ${i + 1}`}
              className={`h-2 w-8 rounded-full transition-all ${i === index ? "bg-white" : "bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
