import { apiClient } from "./client";
import type { Product } from "../types";

export async function fetchWishlist(): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>("/wishlist");
  return data;
}

export async function addToWishlist(productId: string): Promise<Product[]> {
  const { data } = await apiClient.post<Product[]>("/wishlist", { productId });
  return data;
}

export async function removeFromWishlist(productId: string): Promise<Product[]> {
  const { data } = await apiClient.delete<Product[]>(`/wishlist/${productId}`);
  return data;
}
