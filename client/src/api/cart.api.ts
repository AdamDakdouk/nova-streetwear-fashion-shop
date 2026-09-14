import { apiClient } from "./client";
import type { CartView, VariantSelection } from "../types";

export async function fetchCart(): Promise<CartView> {
  const { data } = await apiClient.get<CartView>("/cart");
  return data;
}

export async function addToCart(
  productId: string,
  variantSelection: VariantSelection,
  quantity: number
): Promise<CartView> {
  const { data } = await apiClient.post<CartView>("/cart", { productId, variantSelection, quantity });
  return data;
}

export async function updateCartItem(
  itemId: string,
  updates: { quantity?: number; variantSelection?: VariantSelection }
): Promise<CartView> {
  const { data } = await apiClient.patch<CartView>(`/cart/${itemId}`, updates);
  return data;
}

export async function removeCartItem(itemId: string): Promise<CartView> {
  const { data } = await apiClient.delete<CartView>(`/cart/${itemId}`);
  return data;
}
