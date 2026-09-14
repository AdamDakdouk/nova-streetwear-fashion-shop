import { useQuery } from "@tanstack/react-query";
import { fetchProduct, fetchProducts } from "../api/products.api";

export function useProducts() {
  return useQuery({ queryKey: ["products"], queryFn: fetchProducts });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => fetchProduct(id as string),
    enabled: Boolean(id),
  });
}
