import { apiClient } from "./client";
import type { Product, ProductSummary } from "../types";

export async function fetchProducts(): Promise<ProductSummary[]> {
  const { data } = await apiClient.get<ProductSummary[]>("/products");
  return data;
}

export async function fetchProduct(id: string): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/${id}`);
  return data;
}
