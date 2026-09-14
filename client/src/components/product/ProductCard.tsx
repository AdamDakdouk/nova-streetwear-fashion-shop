import { useRef } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { formatCurrency } from "../../lib/formatCurrency";
import { findAxis, formatSizeList } from "../../lib/variantDisplay";
import { ColorSwatchDots } from "./ColorSwatchDots";
import { StarRating } from "./StarRating";
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from "../../hooks/useWishlist";
import { useAuthStore } from "../../store/authStore";
import { useAuthRequiredDialogStore } from "../../store/authRequiredDialogStore";
import { useToast } from "../ui/Toast";
import { Spinner } from "../ui/Spinner";
import { extractErrorMessage } from "../../api/client";
import type { ProductSummary } from "../../types";

export function ProductCard({ product }: { product: ProductSummary }) {
  const colorAxis = findAxis(product.variants, "Color");
  const colors = colorAxis?.options.map((o) => o.value) ?? [];
  const sizeList = formatSizeList(product.variants);

  const isAuthenticated = Boolean(useAuthStore((s) => s.token));
  const openAuthRequiredDialog = useAuthRequiredDialogStore((s) => s.open);
  const { data: wishlist } = useWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { showToast } = useToast();
  const mutationInFlight = useRef(false);

  const isInWishlist = wishlist?.some((p) => p._id === product._id) ?? false;
  const isPending = addToWishlist.isPending || removeFromWishlist.isPending;

  async function handleWishlistClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      openAuthRequiredDialog();
      return;
    }
    if (mutationInFlight.current) return;

    mutationInFlight.current = true;
    try {
      if (isInWishlist) {
        await removeFromWishlist.mutateAsync(product._id);
      } else {
        await addToWishlist.mutateAsync(product._id);
        showToast(`Added ${product.title} to your wishlist`);
      }
    } catch (err) {
      showToast(extractErrorMessage(err, "Could not update your wishlist"), "error");
    } finally {
      mutationInFlight.current = false;
    }
  }

  return (
    <Link
      to={`/products/${product._id}`}
      className="focus-ring group flex flex-col overflow-hidden rounded-xl border border-border/70 bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-popover"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-background">
        <img
          src={product.thumbnail}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <button
          onClick={handleWishlistClick}
          aria-label={isInWishlist ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
          aria-pressed={isInWishlist}
          className="focus-ring absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-card backdrop-blur transition-transform hover:scale-110"
        >
          {isPending ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <Heart
              className={`h-4 w-4 ${isInWishlist ? "text-accent" : "text-ink"}`}
              fill={isInWishlist ? "currentColor" : "none"}
              aria-hidden="true"
            />
          )}
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-heading text-sm font-semibold leading-snug text-ink">{product.title}</h3>

        {product.reviewCount > 0 && <StarRating rating={product.avgRating} reviewCount={product.reviewCount} />}
        {colors.length > 0 && <ColorSwatchDots colors={colors} />}
        {sizeList && <p className="text-xs tracking-wide text-muted">{sizeList}</p>}

        <p className="mt-auto pt-2 text-sm font-semibold tabular-nums text-ink">
          {formatCurrency(product.price)}
        </p>
      </div>
    </Link>
  );
}
