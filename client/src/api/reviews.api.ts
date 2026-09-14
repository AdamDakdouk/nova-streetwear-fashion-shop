import { apiClient } from "./client";
import type { Review } from "../types";

export async function fetchReviews(productId: string): Promise<Review[]> {
  const { data } = await apiClient.get<Review[]>(`/products/${productId}/reviews`);
  return data;
}

export async function submitReview(
  productId: string,
  rating: number,
  comment: string
): Promise<Review> {
  const { data } = await apiClient.post<Review>(`/products/${productId}/reviews`, { rating, comment });
  return data;
}

export async function deleteReview(productId: string): Promise<void> {
  await apiClient.delete(`/products/${productId}/reviews`);
}
