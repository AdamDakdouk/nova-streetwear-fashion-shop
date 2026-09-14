import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToCart, fetchCart, removeCartItem, updateCartItem } from "../api/cart.api";
import type { VariantSelection } from "../types";
import { useAuthStore } from "../store/authStore";

const CART_KEY = ["cart"];

export function useCart() {
  const isAuthenticated = Boolean(useAuthStore((s) => s.token));
  return useQuery({ queryKey: CART_KEY, queryFn: fetchCart, enabled: isAuthenticated });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      variantSelection,
      quantity,
    }: {
      productId: string;
      variantSelection: VariantSelection;
      quantity: number;
    }) => addToCart(productId, variantSelection, quantity),
    onSuccess: (data) => queryClient.setQueryData(CART_KEY, data),
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      updates,
    }: {
      itemId: string;
      updates: { quantity?: number; variantSelection?: VariantSelection };
    }) => updateCartItem(itemId, updates),
    onSuccess: (data) => queryClient.setQueryData(CART_KEY, data),
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onSuccess: (data) => queryClient.setQueryData(CART_KEY, data),
  });
}
