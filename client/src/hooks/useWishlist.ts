import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToWishlist, fetchWishlist, removeFromWishlist } from "../api/wishlist.api";
import { useAuthStore } from "../store/authStore";

const WISHLIST_KEY = ["wishlist"];

export function useWishlist() {
  const isAuthenticated = Boolean(useAuthStore((s) => s.token));
  return useQuery({ queryKey: WISHLIST_KEY, queryFn: fetchWishlist, enabled: isAuthenticated });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => addToWishlist(productId),
    onSuccess: (data) => queryClient.setQueryData(WISHLIST_KEY, data),
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => removeFromWishlist(productId),
    onSuccess: (data) => queryClient.setQueryData(WISHLIST_KEY, data),
  });
}
