import { Link } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";
import { useAddToCart } from "../hooks/useCart";
import { useRemoveFromWishlist, useWishlist } from "../hooks/useWishlist";
import { EmptyState } from "../components/ui/EmptyState";
import { PageSpinner } from "../components/ui/Spinner";
import { Button } from "../components/ui/Button";
import { formatCurrency } from "../lib/formatCurrency";
import { useToast } from "../components/ui/Toast";
import { extractErrorMessage } from "../api/client";
import type { Product } from "../types";

function WishlistCard({ product }: { product: Product }) {
  const addToCart = useAddToCart();
  const removeFromWishlist = useRemoveFromWishlist();
  const { showToast } = useToast();

  const hasVariants = product.variants.length > 0;

  async function handleMoveToCart() {
    if (hasVariants) return; // needs a variant choice first — handled via "View" link
    try {
      await addToCart.mutateAsync({ productId: product._id, variantSelection: {}, quantity: 1 });
      showToast(`Moved ${product.title} to your cart`);
    } catch (err) {
      showToast(extractErrorMessage(err, "Could not add to cart"), "error");
    }
  }

  async function handleRemove() {
    try {
      await removeFromWishlist.mutateAsync(product._id);
    } catch (err) {
      showToast(extractErrorMessage(err, "Could not remove item"), "error");
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <Link to={`/products/${product._id}`} className="focus-ring aspect-square w-full overflow-hidden bg-black/5">
        <img src={product.thumbnail} alt={product.title} loading="lazy" className="h-full w-full object-cover" />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link to={`/products/${product._id}`} className="focus-ring font-heading text-sm font-semibold text-ink">
          {product.title}
        </Link>
        <p className="text-sm font-semibold tabular-nums text-ink">{formatCurrency(product.price)}</p>

        <div className="mt-auto flex gap-2 pt-2">
          {hasVariants ? (
            <Link to={`/products/${product._id}`} className="flex-1">
              <Button size="sm" className="w-full">
                Choose Options
              </Button>
            </Link>
          ) : (
            <Button size="sm" className="flex-1" isLoading={addToCart.isPending} onClick={handleMoveToCart}>
              Move to Cart
            </Button>
          )}
          <button
            onClick={handleRemove}
            aria-label={`Remove ${product.title} from wishlist`}
            className="focus-ring flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-border text-muted hover:bg-danger/5 hover:text-danger"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function WishlistPage() {
  const { data: products, isLoading } = useWishlist();

  if (isLoading) return <PageSpinner />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-2xl font-bold text-ink">Your Wishlist</h1>

      {!products || products.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save items you love and find them here later."
            action={
              <Link to="/">
                <Button className="mt-2">Browse Products</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <WishlistCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
