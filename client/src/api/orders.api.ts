import { apiClient } from "./client";
import type { Order } from "../types";

export async function placeOrder(): Promise<Order> {
  const { data } = await apiClient.post<{ order: Order }>("/orders");
  return data.order;
}

export async function fetchOrder(id: string): Promise<Order> {
  const { data } = await apiClient.get<{ order: Order }>(`/orders/${id}`);
  return data.order;
}

export async function fetchOrders(): Promise<Order[]> {
  const { data } = await apiClient.get<{ orders: Order[] }>("/orders");
  return data.orders;
}
