import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProduct,
  fetchAdminProducts,
  ProductFormPayload,
  updateAdminProduct,
} from "../api/admin.api";

const ADMIN_PRODUCTS_KEY = ["admin", "products"];

export function useAdminProducts() {
  return useQuery({ queryKey: ADMIN_PRODUCTS_KEY, queryFn: fetchAdminProducts });
}

export function useAdminProduct(id: string | undefined) {
  return useQuery({
    queryKey: [...ADMIN_PRODUCTS_KEY, id],
    queryFn: () => fetchAdminProduct(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateAdminProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductFormPayload) => createAdminProduct(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_KEY }),
  });
}

export function useUpdateAdminProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductFormPayload }) => updateAdminProduct(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_KEY }),
  });
}

export function useDeleteAdminProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdminProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_KEY }),
  });
}
