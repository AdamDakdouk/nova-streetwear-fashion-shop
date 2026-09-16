import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { fetchOrder } from "../api/orders.api";
import { formatCurrency } from "../lib/formatCurrency";
import { Button } from "../components/ui/Button";
import { PageSpinner } from "../components/ui/Spinner";

export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => fetchOrder(orderId as string),
    enabled: Boolean(orderId),
    retry: false,
  });

  if (isLoading) return <PageSpinner />;

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-heading text-xl font-bold text-ink">Order not found</h1>
        <p className="mt-2 text-sm text-muted">We couldn't find that order. It may not belong to your account.</p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <CheckCircle2 className="h-12 w-12 text-success" aria-hidden="true" />
        <h1 className="mt-4 font-heading text-2xl font-bold text-ink">Order confirmed</h1>
        <p className="mt-1 text-sm text-muted">
          Order <span className="font-medium text-ink">#{order._id.slice(-8).toUpperCase()}</span> &middot;{" "}
          {new Date(order.placedAt).toLocaleString()}
        </p>
      </div>

      <div className="mt-8 rounded-lg border border-border bg-surface shadow-card">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between border-b border-border p-4 last:border-b-0">
            <div>
              <p className="font-heading text-sm font-semibold text-ink">{item.title}</p>
              <p className="text-xs text-muted">
                {Object.entries(item.variantSelection)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(" · ")}{" "}
                &middot; Qty {item.quantity}
              </p>
            </div>
            <p className="text-sm font-semibold tabular-nums text-ink">{formatCurrency(item.subtotal)}</p>
          </div>
        ))}
        <div className="flex items-center justify-between p-4">
          <span className="font-heading text-base font-semibold text-ink">Total</span>
          <span className="text-lg font-bold tabular-nums text-ink">{formatCurrency(order.total)}</span>
        </div>
      </div>

      {(order.shippingAddress || order.payment) && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {order.shippingAddress && (
            <div className="rounded-lg border border-border bg-surface p-4">
              <h2 className="font-heading text-sm font-semibold text-ink">Delivering to</h2>
              <address className="mt-2 text-sm not-italic leading-relaxed text-muted">
                {order.shippingAddress.fullName}
                <br />
                {order.shippingAddress.line1}
                {order.shippingAddress.line2 && (
                  <>
                    <br />
                    {order.shippingAddress.line2}
                  </>
                )}
                <br />
                {order.shippingAddress.city} {order.shippingAddress.postalCode}
                <br />
                {order.shippingAddress.country}
                <br />
                {order.shippingAddress.phone}
              </address>
            </div>
          )}

          {order.payment && (
            <div className="rounded-lg border border-border bg-surface p-4">
              <h2 className="font-heading text-sm font-semibold text-ink">Paid with</h2>
              <p className="mt-2 text-sm text-muted">
                {order.payment.brand} ending in {order.payment.last4}
              </p>
              <p className="mt-2 text-xs text-muted">Simulated payment — no card was charged.</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Link to="/">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}
