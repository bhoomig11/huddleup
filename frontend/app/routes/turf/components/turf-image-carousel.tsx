"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "~/lib/utils";

type Props = {
  turfId: number;
  images: string[];
};

export default function TurfImageCarousel({ turfId, images }: Props) {
  const [index, setIndex] = useState(0);

  const goToPrevImage = () => {
    if (images.length === 0) return;
    setIndex((i) => (i - 1 + images.length) % images.length);
  };

  const goToNextImage = () => {
    if (images.length === 0) return;
    setIndex((i) => (i + 1) % images.length);
  };

  const current = index >= 0 && index < images.length ? images[index] : null;

  return (
    <div className="relative h-96 w-full overflow-hidden bg-stone-300">
      {current !== null ? (
        <img
          src={current}
          alt={`turf-${turfId}-${index}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-stone-300 font-medium text-stone-600">
          No images available
        </div>
      )}

      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevImage}
            aria-label="Previous image"
            className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={goToNextImage}
            aria-label="Next image"
            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
          >
            <ChevronRight />
          </button>
        </>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to image ${i + 1}`}
              className={cn(
                "h-1.5 w-7 rounded-full transition-all",
                i === index ? "bg-white" : "bg-white/40"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
