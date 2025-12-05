import { useSearchParams } from "react-router";
import { CircleUser, Pencil, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { TurfReview } from "~/types/turf";
import type { BookingSummary } from "~/types/booking";
import { ReviewEditor } from "./review-editor";
import { StarDisplay } from "./star-display";
import { DeleteReviewDialog } from "./delete-review-dialog";

function formatBookingDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

interface ReviewCardProps {
  review: TurfReview | null;
  isUserReview: boolean;
  turfId: number;
  canAddReview?: boolean;
  latestBooking?: BookingSummary | null;
}

export function ReviewCard(props: ReviewCardProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const isEditing = props.isUserReview && searchParams.get("edit") === "review";
  const isAdding = props.isUserReview && searchParams.get("add") === "review";

  const handleEdit = () => {
    setSearchParams(
      { edit: "review" },
      { preventScrollReset: true, replace: true }
    );
  };

  const handleAdd = () => {
    setSearchParams(
      { add: "review" },
      { preventScrollReset: true, replace: true }
    );
  };

  const handleCancel = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("edit");
    newParams.delete("add");
    setSearchParams(newParams, { preventScrollReset: true, replace: true });
  };

  // Show editor for add mode
  if (isAdding && props.review === null) {
    return (
      <ReviewEditor
        onCancel={handleCancel}
        initialRating="0"
        initialReview=""
        isUpdate={false}
      />
    );
  }

  // Show editor for edit mode
  if (isEditing && props.review !== null) {
    return (
      <ReviewEditor
        onCancel={handleCancel}
        initialRating={props.review.rating.toString()}
        initialReview={props.review.review || ""}
        isUpdate={true}
      />
    );
  }

  // Show "Leave a Review" prompt when user can add but hasn't
  if (props.review === null && props.canAddReview) {
    return (
      <div className="flex flex-col gap-4 rounded-lg border border-green-200 bg-green-50/50 p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <p className="text-base font-semibold text-stone-700">
            Hey there! 👋
          </p>
          <p className="text-sm text-stone-600">
            According to our records, you visited this turf on{" "}
            {props.latestBooking && (
              <span className="font-semibold text-green-700">
                {formatBookingDate(props.latestBooking.startTimeLocal)}
              </span>
            )}
            . We hope you had an amazing time! 🎉
          </p>
          <p className="text-sm text-stone-600">
            Care to share your experience with others? Your review helps fellow
            players discover great turfs!
          </p>
        </div>
        <div className="flex flex-row justify-end">
          <Button
            onClick={handleAdd}
            className="bg-green-700 hover:bg-green-600"
          >
            Leave a Review
          </Button>
        </div>
      </div>
    );
  }

  // Show existing review
  if (props.review === null) {
    return null;
  }

  const { username, review, rating } = props.review;

  return (
    <div
      className={cn(
        "rounded-lg border bg-white p-5 shadow-sm",
        props.isUserReview
          ? "border-green-600/75 outline-1 outline-green-600/40"
          : "border-stone-300/60"
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-2">
            <CircleUser className="size-7 text-stone-500" />
            <div className="flex flex-row items-baseline gap-2">
              <p className="text-sm font-semibold text-stone-600">{username}</p>
              {props.isUserReview && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-600">
                  You
                </span>
              )}
            </div>
            <span className="size-1 rounded-full bg-stone-700"></span>
            <div className="flex flex-row items-center gap-1">
              <span className="font-semibold text-stone-600">{rating}</span>
              <StarDisplay rating={rating} size="sm" />
            </div>
          </div>
          {props.isUserReview && (
            <div className="flex flex-row gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                aria-label="Edit review"
                className="group h-8"
              >
                <Pencil className="size-4 text-stone-600 group-hover:text-stone-700" />
              </Button>
              <DeleteReviewDialog>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Delete review"
                  className="group h-8"
                >
                  <Trash2 className="size-4 text-red-600 group-hover:text-red-700" />
                </Button>
              </DeleteReviewDialog>
            </div>
          )}
        </div>
        <div className="">
          {review === null ? (
            <p className="text-sm text-stone-500 italic">No message provided</p>
          ) : (
            <p className="text-sm leading-relaxed text-stone-700">{review}</p>
          )}
        </div>
      </div>
    </div>
  );
}
