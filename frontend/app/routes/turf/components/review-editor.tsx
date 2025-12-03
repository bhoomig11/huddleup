import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSubmit } from "react-router";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { cn } from "~/lib/utils";
import { StarRating } from "./star-rating";

const reviewFormSchema = z.object({
  rating: z.string().regex(/^[1-5]$/, "Rating cannot be empty"),
  review: z.string(),
});

interface ReviewEditorProps {
  onCancel: () => void;
  initialRating?: string;
  initialReview?: string;
  isUpdate?: boolean;
}

export function ReviewEditor({
  onCancel,
  initialRating = "0",
  initialReview = "",
  isUpdate = false,
}: ReviewEditorProps) {
  const form = useForm<z.infer<typeof reviewFormSchema>>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: initialRating,
      review: initialReview,
    },
    values: {
      rating: initialRating,
      review: initialReview,
    },
  });

  const submit = useSubmit();
  function onSubmit(data: z.infer<typeof reviewFormSchema>) {
    submit(data, {
      method: isUpdate ? "PUT" : "POST",
      replace: true,
      preventScrollReset: true,
    });
  }

  return (
    <div className="rounded-lg border border-stone-300/60 bg-white p-4 shadow">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <FieldGroup>
            <Controller
              name="rating"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="rating"
                    className="font-semibold text-stone-600"
                  >
                    Rating
                  </FieldLabel>
                  <div className="flex flex-row items-center gap-2">
                    <span
                      className={cn(
                        "text-2xl font-bold",
                        fieldState.isDirty ? "text-green-700" : "text-stone-500"
                      )}
                    >
                      {field.value}
                    </span>
                    <StarRating
                      value={Number.parseInt(field.value || "0")}
                      onChange={(value: number) =>
                        field.onChange(value.toString())
                      }
                      fieldName="rating"
                      totalStars={5}
                    />
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </div>
        <div className="flex flex-col gap-2">
          <FieldGroup>
            <Controller
              name="review"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex flex-row items-baseline gap-2">
                    <FieldLabel
                      htmlFor="review"
                      className="font-semibold text-stone-600"
                    >
                      Message
                    </FieldLabel>
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-500">
                      Optional
                    </span>
                  </div>
                  <Textarea
                    {...field}
                    id="review"
                    aria-invalid={fieldState.invalid}
                    placeholder="Share your experience at this turf... What did you like? Any tips for other players?"
                    className="text-stone-600"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </div>
        <div className="flex flex-row justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              onCancel();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-green-700 hover:bg-green-600"
            disabled={!form.formState.isValid}
          >
            {isUpdate ? "Update Review" : "Submit Review"}
          </Button>
        </div>
      </form>
    </div>
  );
}
