import {
  fetchTurfDetails,
  fetchTurfImages,
  fetchTurfReviews,
} from "~/api/turf";
import type { Route } from "./+types/turf-detail";
import { data } from "react-router";
import { Link } from "react-router";
import type { TurfDetails, TurfReview } from "~/types/turf";
import {
  Clock,
  Ruler,
  LandPlot,
  ToyBrick,
  CircleSlash,
  CircleUser,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import TurfImageCarousel from "~/routes/turf/components/turf-image-carousel";
import { HuddleUpLogo } from "~/components/huddleup-logo";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const turfId = Number.parseInt(params.turfId);
  if (Number.isNaN(turfId)) {
    const invalidTurfIdMessage =
      "Invalid turf ID! Expected a number, received: " + params.turfId;
    throw data(invalidTurfIdMessage, { status: 400 });
  }

  const [detailsResponse, imagesResponse, reviewsResponse] = await Promise.all([
    fetchTurfDetails(turfId),
    fetchTurfImages(turfId),
    fetchTurfReviews(turfId),
  ]);

  if (!detailsResponse.ok) {
    throw data("Error fetching turf details", {
      status: detailsResponse.status,
    });
  }

  if (!imagesResponse.ok) {
    throw data("Error fetching turf images", { status: imagesResponse.status });
  }

  if (!reviewsResponse.ok) {
    throw data("Error fetching turf reviews", {
      status: reviewsResponse.status,
    });
  }

  const details = (await detailsResponse.json()) as Omit<
    TurfDetails,
    "images" | "reviews"
  >;
  const images = (await imagesResponse.json()) as TurfDetails["images"];
  const reviews = (await reviewsResponse.json()) as TurfDetails["reviews"];

  return { ...details, images, reviews } as TurfDetails;
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
    [turfDetails.address.state, turfDetails.address.zipcode].join(" "),
  ];

  return (
    <div className="min-h-screen w-full bg-stone-100">
      {/* Header */}
      <div className="h-20 w-full border-b border-stone-300/80 bg-stone-100 py-4">
        <header className="mx-auto flex max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <span className="text-green-700">
              <HuddleUpLogo />
            </span>
          </div>
          <div className="flex-1"></div>
        </header>
      </div>

      <main className="flex w-full flex-col items-center py-8">
        <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow">
          <div>
            <TurfImageCarousel
              turfId={turfDetails.turfId}
              images={turfDetails.images}
            />
          </div>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-row justify-between px-4 py-2">
              <div className="flex flex-col gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-stone-600">
                    {turfDetails.turfName}
                  </h1>
                  <p className="text-sm text-stone-400">
                    {addressParts.join(", ")}
                  </p>
                </div>

                <div className="flex flex-row items-baseline gap-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-600">
                    <LandPlot className="size-5 text-green-700" />
                    <p className="text-stone-600">{turfDetails.sportName}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-600">
                    <Clock className="size-5 text-green-700" />
                    <p className="text-stone-600">
                      {formatTurfOperationTime(turfDetails.opensAtLocalTime)}
                      {" - "}
                      {formatTurfOperationTime(turfDetails.closesAtLocalTime)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-600">
                    <Ruler className="size-5 text-green-700" />
                    <p className="text-stone-600">
                      {turfDetails.floorLength}ft × {turfDetails.floorWidth}ft
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-600">
                    <ToyBrick className="size-5 text-green-700" />
                    <p className="text-stone-600">
                      {turfDetails.floorMaterial}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-4">
                <div className="flex flex-none flex-row items-start gap-1">
                  <span className="font-medium text-stone-500">$</span>
                  <span className="text-5xl font-bold text-stone-600">
                    {turfDetails.hourlyRate.toFixed(2)}
                  </span>
                  <span className="font-medium text-stone-500">/hr</span>
                </div>
                <div>
                  <Button
                    size="lg"
                    className="bg-green-700 text-lg font-medium hover:bg-green-600"
                    asChild
                  >
                    <Link to={`/turf/${turfDetails.turfId}/book`}>
                      Book Now
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 px-4 py-2">
              <h2 className="text-xl font-bold text-stone-600">About</h2>
              <p className="text-stone-600">{turfDetails.turfDescription}</p>
            </div>

            <div className="flex flex-col gap-1 px-4 py-2">
              <div className="flex flex-row items-baseline justify-between">
                <h2 className="text-xl font-bold text-stone-600">Reviews</h2>

                {/* Average Rating */}
                <div className="flex flex-row items-baseline gap-1 pb-2">
                  <span className="self-center text-yellow-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span className="text-2xl font-bold text-stone-600">
                    {turfDetails.averageRating?.toFixed(1) ?? "-"}
                  </span>
                  <span className="text-sm text-stone-400">/ 5.0</span>
                  <span className="text-sm font-medium text-stone-500">
                    ({turfDetails.numberOfRatings})
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {turfDetails.reviews.length > 0 ? (
                  turfDetails.reviews.map((review) => (
                    <ReviewCard
                      key={`turf-${turfDetails.turfId}-review-${review.username}`}
                      review={review}
                    />
                  ))
                ) : (
                  <div className="flex flex-row items-center gap-2 rounded bg-stone-100 px-4 py-6">
                    <CircleSlash className="size-5 text-stone-500" />
                    <p className="text-sm font-medium text-stone-600">
                      No reviews yet. Be the first to review!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ReviewCard(props: { review: TurfReview }) {
  const { username, review, rating } = props.review;
  return (
    <div className="rounded-lg border border-stone-300/60 bg-white p-4 shadow-xs">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center gap-2">
          <CircleUser className="size-7 text-stone-500" />
          <p className="text-sm font-semibold text-stone-600">{username}</p>
          <span className="size-1 rounded-full bg-stone-700"></span>
          <div className="flex flex-row items-center gap-1">
            <span className="font-semibold text-stone-600">{rating}</span>
            <span className="flex flex-row items-center">
              {Array.from({ length: 5 }, (_, i) => i + 1).map(
                (currentRating) => (
                  <span
                    className={
                      currentRating > rating
                        ? "text-stone-400/50"
                        : "text-yellow-400"
                    }
                    key={`review-${username}-star-${currentRating}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )
              )}
            </span>
          </div>
        </div>
        <div className="">
          {review === null ? (
            <p className="text-sm text-stone-500 italic">No message provided</p>
          ) : (
            <p className="text-sm text-stone-700">{review}</p>
          )}
        </div>
      </div>
    </div>
  );
}
