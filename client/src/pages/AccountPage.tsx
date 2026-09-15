import { Link } from "react-router-dom";
import { LogOut, Mail, Package, User as UserIcon } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useLogoutDialogStore } from "../store/logoutDialogStore";
import { useOrders } from "../hooks/useOrders";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { PageSpinner } from "../components/ui/Spinner";
import { formatCurrency } from "../lib/formatCurrency";
import type { Order } from "../types";

function OrderCard({ order }: { order: Order }) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="rounded-lg border border-border bg-surface shadow-card">
      <div className="flex flex-col gap-1 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-heading text-sm font-semibold text-ink">
            Order #{order._id.slice(-8).toUpperCase()}
          </p>
          <p className="text-xs text-muted">
            {new Date(order.placedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            &middot; {itemCount} item{itemCount === 1 ? "" : "s"}
            {order.payment && (
              <>
                {" "}
                &middot; {order.payment.brand} ending {order.payment.last4}
              </>
            )}
          </p>
        </div>
        <p className="text-base font-bold tabular-nums text-ink">{formatCurrency(order.total)}</p>
      </div>

      <ul className="divide-y divide-border">
        {order.items.map((item, i) => {
          const variants = Object.entries(item.variantSelection)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" · ");

          return (
            <li key={i} className="flex items-start justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {variants && <>{variants} &middot; </>}Qty {item.quantity} &middot;{" "}
                  {formatCurrency(item.unitPrice)} each
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                {formatCurrency(item.subtotal)}
              </p>
            </li>
          );
        })}
      </ul>

      {order.shippingAddress && (
        <p className="border-t border-border px-4 py-3 text-xs text-muted">
          Delivered to {order.shippingAddress.fullName}, {order.shippingAddress.line1},{" "}
          {order.shippingAddress.city} {order.shippingAddress.postalCode}, {order.shippingAddress.country}
        </p>
      )}
    </div>
  );
}

export function AccountPage() {
  const user = useAuthStore((s) => s.user);
  const openLogoutDialog = useLogoutDialogStore((s) => s.open);
  const { data: orders, isLoading } = useOrders();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-2xl font-bold text-ink">My Account</h1>

      <section className="mt-6 rounded-lg border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-light">
              <UserIcon className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="font-heading text-base font-semibold text-ink">{user?.name}</p>
              <p className="flex items-center gap-1.5 text-sm text-muted">
                <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{user?.email}</span>
              </p>
            </div>
          </div>

          <button
            onClick={openLogoutDialog}
            className="focus-ring flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-danger hover:bg-danger/5"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
          </button>
        </div>
      </section>

      <h2 className="mt-10 font-heading text-lg font-semibold text-ink">Purchase history</h2>
      <p className="mt-1 text-sm text-muted">Orders you've successfully placed, most recent first.</p>

      <div className="mt-4">
        {isLoading ? (
          <PageSpinner />
        ) : orders && orders.length > 0 ? (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="Once you complete a purchase, it'll show up here with the full details."
            action={
              <Link to="/" className="mt-2 inline-block">
                <Button>Start Shopping</Button>
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
