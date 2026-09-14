import { apiClient } from "./client";
import type { AdminProduct } from "../types";

export type ProductFormPayload = Omit<AdminProduct, "_id">;

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const { data } = await apiClient.get<AdminProduct[]>("/admin/products");
  return data;
}

export async function fetchAdminProduct(id: string): Promise<AdminProduct> {
  const { data } = await apiClient.get<AdminProduct>(`/admin/products/${id}`);
  return data;
}

export async function createAdminProduct(payload: ProductFormPayload): Promise<AdminProduct> {
  const { data } = await apiClient.post<AdminProduct>("/admin/products", payload);
  return data;
}

export async function updateAdminProduct(id: string, payload: ProductFormPayload): Promise<AdminProduct> {
  const { data } = await apiClient.put<AdminProduct>(`/admin/products/${id}`, payload);
  return data;
}

export async function deleteAdminProduct(id: string): Promise<void> {
  await apiClient.delete(`/admin/products/${id}`);
}

export async function uploadAdminImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  const { data } = await apiClient.post<{ url: string }>("/admin/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
}
