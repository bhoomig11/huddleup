import { fetchTurfDetails, fetchTurfImages } from "~/api/turf";
import type { Route } from "./+types/turf-detail";
import { data } from "react-router";
import { Link } from "react-router";
import type { TurfDetails } from "~/types/turf";
import { ChevronLeft, MapPin, Clock, Ruler } from "lucide-react";
import { Button } from "~/components/ui/button";
import TurfImageCarousel from "~/routes/turf/components/turf-image-carousel";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const turfId = Number.parseInt(params.turfId);
  if (Number.isNaN(turfId)) {
    const invalidTurfIdMessage =
      "Invalid turf ID! Expected a number, received: " + params.turfId;
    throw data(invalidTurfIdMessage, { status: 400 });
  }

  const [detailsResponse, imagesResponse] = await Promise.all([
    fetchTurfDetails(turfId),
    fetchTurfImages(turfId),
  ]);

  if (!detailsResponse.ok) {
    throw data("Error fetching turf details", {
      status: detailsResponse.status,
    });
  }

  if (!imagesResponse.ok) {
    throw data("Error fetching turf images", { status: imagesResponse.status });
  }

  const details = (await detailsResponse.json()) as Omit<TurfDetails, "images">;
  const images = (await imagesResponse.json()) as TurfDetails["images"];

  return { ...details, images } as TurfDetails;
}

function formatTurfOperationTime(time24Hr: string): string {
  const [hourIn24Hr, minute] = time24Hr.split(":").map(Number);
  const hourIn12Hr =
    hourIn24Hr > 12 ? hourIn24Hr - 12 : hourIn24Hr === 0 ? 12 : hourIn24Hr;

  const hh = hourIn12Hr.toString().padStart(2, "0");
  const mm = minute.toString().padStart(2, "0");
  const ampm = hourIn24Hr >= 12 ? "PM" : "AM";
  const formattedTime = `${hh}:${mm} ${ampm}`;
  return formattedTime;
}

export default function TurfDetailPage({
  loaderData: turfDetails,
}: Route.ComponentProps) {
  const addressParts = [
    turfDetails.address.streetLine1,
    turfDetails.address.streetLine2,
    turfDetails.address.town,
    turfDetails.address.zipcode,
  ];

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

      <main className="flex w-full flex-col items-center">
        <div className="w-full max-w-4xl">
          {/* Hero Image Section (carousel) */}
          <TurfImageCarousel
            turfId={turfDetails.turfId}
            images={
              (turfDetails as unknown as { images?: string[] }).images ?? []
            }
            initialImage={
              "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&h=600&fit=crop"
            }
          />
          <div className="-mt-20 mb-10 px-6">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              {turfDetails.turfName}
            </h1>
          </div>

          {/* Content Section */}
          <div className="bg-white p-8">
            {/* Quick Info */}
            <div className="mb-8 grid grid-cols-4 gap-4">
              <div className="rounded-lg border border-stone-200 p-4">
                <div className="text-xs font-medium text-stone-500">Sport</div>
                <div className="mt-1 text-lg font-bold text-stone-700">
                  {turfDetails.sportName}
                </div>
              </div>
              <div className="rounded-lg border border-stone-200 p-4">
                <div className="text-xs font-medium text-stone-500">
                  Hourly Rate
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-lg font-bold text-stone-700">
                    ${turfDetails.hourlyRate.toFixed(2)}
                  </span>
                  <span className="text-xs text-stone-400">/hr</span>
                </div>
              </div>
              <div className="rounded-lg border border-stone-200 p-4">
                <div className="text-xs font-medium text-stone-500">Rating</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-yellow-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span className="font-bold text-stone-700">
                    {turfDetails.averageRating?.toFixed(1) ?? "-"}
                  </span>
                  <span className="text-xs text-stone-400">
                    ({turfDetails.numberOfRatings})
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-stone-200 p-4">
                <div className="text-xs font-medium text-stone-500">Size</div>
                <div className="mt-1 text-lg font-bold text-stone-700">
                  {turfDetails.floorLength}ft × {turfDetails.floorWidth}ft
                </div>
              </div>
            </div>

            {/* Location & Hours */}
            <div className="mb-8 grid grid-cols-2 gap-6">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                  <MapPin className="size-5 text-green-700" />
                  Location
                </h3>
                <p className="mt-2 text-sm text-stone-600">
                  {addressParts.join(", ")}
                </p>
              </div>
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                  <Clock className="size-5 text-green-700" />
                  Operating Hours
                </h3>
                <p className="mt-2 text-sm text-stone-600">
                  {formatTurfOperationTime(turfDetails.opensAtLocalTime)} -{" "}
                  {formatTurfOperationTime(turfDetails.closesAtLocalTime)}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="mb-8 h-px bg-stone-200" />

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-stone-700">About</h2>
              <p className="mt-3 text-stone-600">
                {turfDetails.turfDescription}
              </p>
            </div>

            {/* Specifications */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-stone-700">
                Specifications
              </h2>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-stone-50 p-4">
                  <div className="flex items-center gap-2">
                    <Ruler className="size-5 text-green-700" />
                    <span className="text-sm text-stone-600">Dimensions</span>
                  </div>
                  <p className="mt-2 font-semibold text-stone-700">
                    {turfDetails.floorLength}ft × {turfDetails.floorWidth}ft
                  </p>
                </div>
                <div className="rounded-lg bg-stone-50 p-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className="size-5 text-green-700"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="text-sm text-stone-600">Surface</span>
                  </div>
                  <p className="mt-2 font-semibold text-stone-700">
                    {turfDetails.floorMaterial}
                  </p>
                </div>
                <div className="rounded-lg bg-stone-50 p-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className="size-5 text-green-700"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z" />
                    </svg>
                    <span className="text-sm text-stone-600">Sport</span>
                  </div>
                  <p className="mt-2 font-semibold text-stone-700">
                    {turfDetails.sportName}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4">
              <Button
                variant="ghost"
                className="flex-1 rounded border border-green-700 px-6 py-3 font-semibold text-green-700 hover:bg-green-50 active:bg-green-100"
              >
                Add to Favorites
              </Button>
              <Button
                asChild
                className="flex-1 rounded bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-600 active:bg-green-700"
              >
                <Link to={`/turf/${turfDetails.turfId}/book`}>Book Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
