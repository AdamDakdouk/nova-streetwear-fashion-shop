import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteReview, fetchReviews, submitReview } from "../api/reviews.api";

export function useReviews(productId: string | undefined) {
  return useQuery({
    queryKey: ["products", productId, "reviews"],
    queryFn: () => fetchReviews(productId as string),
    enabled: Boolean(productId),
  });
}

export function useSubmitReview(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment: string }) =>
      submitReview(productId, rating, comment),
    // Invalidating the "products" prefix cascades to the list, this product's
    // detail, and this product's review list — all three carry rating data.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteReview(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteReview(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}
