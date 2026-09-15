import { useQuery } from "@tanstack/react-query";
import { fetchOrders } from "../api/orders.api";

/** The signed-in shopper's purchase history, newest first. */
export function useOrders() {
  return useQuery({ queryKey: ["orders"], queryFn: fetchOrders });
}
