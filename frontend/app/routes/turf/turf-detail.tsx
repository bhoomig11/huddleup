import {
  addTurfReview,
  deleteTurfReview,
  fetchTurfDetails,
  fetchTurfImages,
  fetchTurfReviews,
  updateTurfReview,
} from "~/api/turf";
import { getLatestUserTurfBooking } from "~/api/user";
import type { BookingSummary } from "~/types/booking";
import type { Route } from "./+types/turf-detail";
import { data, redirect } from "react-router";
import { Link } from "react-router";
import type { TurfDetails, TurfReview } from "~/types/turf";
import {
  Clock,
  Ruler,
  LandPlot,
  ToyBrick,
  CircleSlash,
  Info,
  IdCard,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import TurfImageCarousel from "~/routes/turf/components/turf-image-carousel";
import { ReviewCard } from "~/routes/turf/components/review-card";
import { authContext } from "~/middleware/auth-middleware";
import { useAppUser } from "~/providers/app-user-provider";

export async function clientLoader({
  context,
  params,
}: Route.ClientLoaderArgs) {
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
  const reviews = (await reviewsResponse.json()) as Array<TurfReview>;

  const auth = context.get(authContext);
  let userReview: TurfDetails["userReview"] = null;
  const otherReviews = reviews.filter((review) => {
    const isUserReview = review.username === auth?.username;
    if (isUserReview) {
      userReview = review;
    }
    return !isUserReview;
  });

  let canUserReview = false;
  let latestBooking: BookingSummary | null = null;
  if (auth?.username && userReview === null) {
    try {
      const latestBookingResponse = await getLatestUserTurfBooking(
        auth.username,
        turfId
      );
      if (latestBookingResponse.ok) {
        const latestBookingData = (await latestBookingResponse.json()) as {
          latestBooking: BookingSummary | null;
        };
        latestBooking = latestBookingData.latestBooking;
        canUserReview = latestBooking !== null;
      }
    } catch (error) {
      console.error("Error fetching latest booking:", error);
      canUserReview = false;
    }
  }

  return {
    ...details,
    images,
    userReview,
    otherReviews,
    canUserReview,
    latestBooking,
  } as TurfDetails;
}

export async function clientAction({
  context,
  params,
  request,
}: Route.ClientActionArgs) {
  const auth = context.get(authContext);
  if (auth === null) {
    throw data("Please log in to perform this action", { status: 401 });
  }

  const turfId = Number.parseInt(params.turfId);
  if (Number.isNaN(turfId)) {
    const invalidTurfIdMessage =
      "Invalid turf ID! Expected a number, received: " + params.turfId;
    throw data(invalidTurfIdMessage, { status: 400 });
  }

  const method = request.method;
  const formData = await request.formData();

  if (method === "DELETE") {
    const response = await deleteTurfReview(turfId);
    if (!response.ok) {
      throw data("Error deleting review", { status: response.status });
    }
    return redirect(`/turf/${turfId}`);
  }

  const rating = Number.parseInt(formData.get("rating")?.toString() ?? "0");
  const review = formData.get("review")?.toString() || null;

  if (method === "PUT") {
    const response = await updateTurfReview(turfId, { rating, review });
    if (!response.ok) {
      throw data("Error updating review", { status: response.status });
    }
    return redirect(`/turf/${turfId}`);
  } else {
    const response = await addTurfReview(turfId, { rating, review });
    if (!response.ok) {
      throw data("Error adding review", { status: response.status });
    }
    return redirect(`/turf/${turfId}`);
  }
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

function formatBookingDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

export default function TurfDetailPage({
  loaderData: turfDetails,
}: Route.ComponentProps) {
  const appUser = useAppUser();
  const isAuthenticated = appUser.username !== null;
  const addressParts = [
    turfDetails.address.streetLine1,
    turfDetails.address.streetLine2,
    turfDetails.address.town,
    [turfDetails.address.state, turfDetails.address.zipcode].join(" "),
  ];

  return (
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
                  <p className="text-stone-600">{turfDetails.floorMaterial}</p>
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
                  <Link to={`/turf/${turfDetails.turfId}/book`}>Book Now</Link>
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
            <div>
              {turfDetails.userReview === null ? (
                !isAuthenticated ? (
                  <div className="flex flex-row items-center gap-2 rounded bg-stone-100 px-4 py-6">
                    <IdCard className="size-5 text-stone-500" />
                    <p className="text-sm font-medium text-stone-600">
                      Please <Link className="text-green-700 hover:underline hover:underline-offset-2 hover:decoration-green-700" to="/login">log in</Link> to leave a review.
                    </p>
                  </div>
                ) : turfDetails.canUserReview ? (
                  <ReviewCard
                    isUserReview={true}
                    review={null}
                    turfId={turfDetails.turfId}
                    canAddReview={true}
                    latestBooking={turfDetails.latestBooking}
                  />
                ) : (
                  <div className="flex flex-row items-center gap-2 rounded bg-green-100 px-4 py-6">
                    <Info className="size-5 text-green-700" />
                    <p className="text-sm font-medium text-stone-600">
                      You'll be able to leave a review after you've visited this
                      turf! Book a session and come back to share your
                      experience.
                    </p>
                  </div>
                )
              ) : (
                <ReviewCard
                  isUserReview={true}
                  review={turfDetails.userReview}
                  turfId={turfDetails.turfId}
                />
              )}
            </div>
            <div className="flex flex-col gap-4 pt-4">
              {turfDetails.otherReviews.length > 0 ? (
                turfDetails.otherReviews.map((review) => (
                  <ReviewCard
                    turfId={turfDetails.turfId}
                    key={`turf-${turfDetails.turfId}-review-${review.username}`}
                    isUserReview={false}
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
  );
}

