import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCart } from "../hooks/useCart";
import { placeOrder } from "../api/orders.api";
import { formatCurrency } from "../lib/formatCurrency";
import { Button } from "../components/ui/Button";
import { PageSpinner } from "../components/ui/Spinner";
import { extractErrorMessage } from "../api/client";

export function CheckoutPage() {
  const { data: cart, isLoading } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const placeOrderMutation = useMutation({
    mutationFn: placeOrder,
    onSuccess: (order) => {
      queryClient.setQueryData(["cart"], { items: [], total: 0 });
      navigate(`/order-confirmation/${order._id}`);
    },
    onError: (err) => {
      setError(extractErrorMessage(err, "Could not place your order"));
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  if (isLoading) return <PageSpinner />;

  if (!cart || cart.items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-2xl font-bold text-ink">Checkout</h1>
      <p className="mt-1 text-sm text-muted">Review your order before confirming.</p>

      <div className="mt-6 rounded-lg border border-border bg-surface shadow-card">
        {cart.items.map((line) => (
          <div key={line.itemId} className="flex items-center gap-4 border-b border-border p-4 last:border-b-0">
            <img
              src={line.product.thumbnail}
              alt={line.product.title}
              className="h-16 w-16 flex-shrink-0 rounded-md object-cover"
            />
            <div className="flex-1">
              <p className="font-heading text-sm font-semibold text-ink">{line.product.title}</p>
              <p className="text-xs text-muted">
                {Object.entries(line.variantSelection)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(" · ")}{" "}
                &middot; Qty {line.quantity}
              </p>
            </div>
            <p className="text-sm font-semibold tabular-nums text-ink">{formatCurrency(line.subtotal)}</p>
          </div>
        ))}
        <div className="flex items-center justify-between p-4">
          <span className="font-heading text-base font-semibold text-ink">Total</span>
          <span className="text-lg font-bold tabular-nums text-ink">{formatCurrency(cart.total)}</span>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          className="flex-1"
          isLoading={placeOrderMutation.isPending}
          onClick={() => {
            setError(null);
            placeOrderMutation.mutate();
          }}
        >
          Place Order
        </Button>
        <Link to="/cart">
          <Button size="lg" variant="ghost" type="button">
            Back to Cart
          </Button>
        </Link>
      </div>
    </div>
  );
}
