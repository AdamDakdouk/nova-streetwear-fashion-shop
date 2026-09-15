import { FormEvent, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { useReviews, useSubmitReview, useDeleteReview } from "../../hooks/useReviews";
import { useAuthStore } from "../../store/authStore";
import { useAuthRequiredDialogStore } from "../../store/authRequiredDialogStore";
import { useToast } from "../ui/Toast";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { StarPicker } from "./StarPicker";
import { StarRating } from "./StarRating";
import { extractErrorMessage } from "../../api/client";

export function ReviewSection({ productId }: { productId: string }) {
  const { data: reviews, isLoading } = useReviews(productId);
  const user = useAuthStore((s) => s.user);
  const openAuthRequiredDialog = useAuthRequiredDialogStore((s) => s.open);
  const submitReview = useSubmitReview(productId);
  const deleteReview = useDeleteReview(productId);
  const { showToast } = useToast();

  const myReview = reviews?.find((r) => r.user === user?.id);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setRating(myReview?.rating ?? 0);
    setComment(myReview?.comment ?? "");
  }, [myReview?._id, myReview?.rating, myReview?.comment]);

  // The form is for writing a review, not for displaying one you already wrote.
  // Once it exists it belongs in the list with everyone else's, and the form
  // comes back only when you choose to edit — otherwise your review appears
  // twice, and the form's "Update Review" button reads like unsaved work.
  const isFormOpen = !myReview || isEditing;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      openAuthRequiredDialog();
      return;
    }
    try {
      await submitReview.mutateAsync({ rating, comment });
      setIsEditing(false);
      showToast(myReview ? "Review updated" : "Thanks for your review!");
    } catch (err) {
      showToast(extractErrorMessage(err, "Could not submit your review"), "error");
    }
  }

  async function handleDelete() {
    try {
      await deleteReview.mutateAsync();
      setIsEditing(false);
      setRating(0);
      setComment("");
      showToast("Review removed");
    } catch (err) {
      showToast(extractErrorMessage(err, "Could not remove your review"), "error");
    }
  }

  function cancelEditing() {
    setRating(myReview?.rating ?? 0);
    setComment(myReview?.comment ?? "");
    setIsEditing(false);
  }

  // Your own review first — after posting it, it's the thing you're looking for.
  const orderedReviews = reviews
    ? [...reviews].sort((a, b) => Number(b._id === myReview?._id) - Number(a._id === myReview?._id))
    : [];

  return (
    <section className="mt-16 border-t border-border pt-10">
      <h2 className="font-heading text-xl font-bold text-ink">Reviews</h2>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mt-6 max-w-lg rounded-lg border border-border bg-surface p-5">
          <p className="text-sm font-medium text-ink">{myReview ? "Edit your review" : "Write a review"}</p>
          <div className="mt-2">
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts (optional)"
            rows={3}
            maxLength={500}
            className="focus-ring mt-3 w-full rounded-md border border-border p-3 text-sm"
          />
          <div className="mt-3 flex items-center gap-4">
            <Button type="submit" isLoading={submitReview.isPending} disabled={rating === 0}>
              {myReview ? "Save Changes" : "Submit Review"}
            </Button>
            {myReview && (
              <button
                type="button"
                onClick={cancelEditing}
                className="focus-ring rounded-md text-sm font-medium text-muted hover:text-ink"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="mt-8 flex flex-col gap-6">
        {isLoading && (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        )}

        {!isLoading && reviews?.length === 0 && (
          <p className="text-sm text-muted">No reviews yet — be the first to share your thoughts.</p>
        )}

        {orderedReviews.map((review) => {
          const isMine = review._id === myReview?._id;

          return (
            <div key={review._id} className="border-b border-border pb-6 last:border-b-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
                    {review.userName}
                    {isMine && (
                      <span className="rounded-full bg-accent-light px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                        Your review
                      </span>
                    )}
                  </p>
                  <div className="mt-1">
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                </div>
                <p className="flex-shrink-0 text-xs text-muted">
                  {new Date(review.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>

              {review.comment && <p className="mt-2 text-sm leading-relaxed text-muted">{review.comment}</p>}

              {isMine && !isEditing && (
                <div className="mt-3 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="focus-ring inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-ink hover:text-accent"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteReview.isPending}
                    className="focus-ring rounded-md text-sm font-medium text-danger hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
