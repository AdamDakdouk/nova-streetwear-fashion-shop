import { Link } from "react-router-dom";
import { formatCurrency } from "../../lib/formatCurrency";

interface CartSummaryProps {
  itemCount: number;
  total: number;
  ctaLabel?: string;
  ctaTo?: string;
}

export function CartSummary({ itemCount, total, ctaLabel = "Proceed to Checkout", ctaTo = "/checkout" }: CartSummaryProps) {
  const ctaClasses =
    "focus-ring mt-5 flex h-12 w-full items-center justify-center rounded-full text-base font-medium transition-colors";

  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <h2 className="font-heading text-base font-semibold text-ink">Order Summary</h2>
      <div className="mt-4 flex justify-between text-sm text-muted">
        <span>
          Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})
        </span>
        <span className="tabular-nums">{formatCurrency(total)}</span>
      </div>
      <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-semibold text-ink">
        <span>Total</span>
        <span className="tabular-nums">{formatCurrency(total)}</span>
      </div>

      {itemCount === 0 ? (
        <button disabled className={`${ctaClasses} cursor-not-allowed bg-accent/50 text-white`}>
          {ctaLabel}
        </button>
      ) : (
        <Link to={ctaTo} className={`${ctaClasses} bg-accent text-white hover:bg-accent-hover`}>
          {ctaLabel}
        </Link>
      )}

      {itemCount === 0 && <p className="mt-2 text-center text-xs text-muted">Your cart is empty.</p>}
    </div>
  );
}
