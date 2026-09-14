import { Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { CartLineItem } from "../components/cart/CartLineItem";
import { CartSummary } from "../components/cart/CartSummary";
import { EmptyState } from "../components/ui/EmptyState";
import { PageSpinner } from "../components/ui/Spinner";
import { Button } from "../components/ui/Button";

export function CartPage() {
  const { data: cart, isLoading } = useCart();

  if (isLoading) return <PageSpinner />;

  const items = cart?.items ?? [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {items.length > 0 && (
        <Link
          to="/"
          className="focus-ring mb-4 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Products
        </Link>
      )}
      <h1 className="font-heading text-2xl font-bold text-ink">Your Cart</h1>

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Browse the catalog and add something you like."
            action={
              <Link to="/">
                <Button className="mt-2">Continue Shopping</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {items.map((line) => (
              <CartLineItem key={line.itemId} line={line} />
            ))}
          </div>
          <div>
            <div className="lg:sticky lg:top-24">
              <CartSummary itemCount={itemCount} total={cart!.total} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
