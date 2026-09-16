import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useProduct } from "../hooks/useProducts";
import { useAddToCart } from "../hooks/useCart";
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from "../hooks/useWishlist";
import { VariantSelector } from "../components/product/VariantSelector";
import { StarRating } from "../components/product/StarRating";
import { ReviewSection } from "../components/product/ReviewSection";
import { QuantityStepper } from "../components/ui/QuantityStepper";
import { Button } from "../components/ui/Button";
import { PageSpinner, Spinner } from "../components/ui/Spinner";
import { formatCurrency } from "../lib/formatCurrency";
import { isSelectionComplete, resolveAvailableStock } from "../lib/stock";
import { findAxis } from "../lib/variantDisplay";
import { useAuthStore } from "../store/authStore";
import { useAuthRequiredDialogStore } from "../store/authRequiredDialogStore";
import { useToast } from "../components/ui/Toast";
import { extractErrorMessage } from "../api/client";
import type { Product, VariantSelection } from "../types";

//Picks the first in-stock option for every axis 
function defaultSelection(product: Product): VariantSelection {
  const selection: VariantSelection = {};
  for (const axis of product.variants) {
    const firstInStock = axis.options.find((o) => o.stock > 0) ?? axis.options[0];
    if (firstInStock) selection[axis.name] = firstInStock.value;
  }
  return selection;
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id);
  const navigate = useNavigate();
  const isAuthenticated = Boolean(useAuthStore((s) => s.token));
  const openAuthRequiredDialog = useAuthRequiredDialogStore((s) => s.open);
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { data: wishlist } = useWishlist();
  const { showToast } = useToast();
  const wishlistMutationInFlight = useRef(false);

  const [selection, setSelection] = useState<VariantSelection>({});
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setSelection(defaultSelection(product));
      setActiveImage(0);
      setQuantity(1);
    }
  }, [product]);

  const availableStock = useMemo(() => {
    if (!product) return 0;
    return resolveAvailableStock(product.variants, product.totalStock, selection);
  }, [product, selection]);

  const selectionComplete = product ? isSelectionComplete(product.variants, selection) : false;
  const canAddToCart = product ? (product.variants.length === 0 || selectionComplete) && availableStock > 0 : false;

  const gallery = useMemo(() => {
    if (!product) return [];
    const colorAxis = findAxis(product.variants, "Color");
    const selectedColor = colorAxis?.options.find((o) => o.value === selection.Color);
    return selectedColor?.images && selectedColor.images.length > 0 ? selectedColor.images : product.images;
  }, [product, selection.Color]);

  if (isLoading) return <PageSpinner />;
  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-ink">Product not found.</p>
      </div>
    );
  }

  const isInWishlist = wishlist?.some((p) => p._id === product._id) ?? false;

  function requireAuthThen(action: () => void) {
    if (!isAuthenticated) {
      openAuthRequiredDialog();
      return;
    }
    action();
  }

  function showPrevImage() {
    setActiveImage((i) => (i === 0 ? gallery.length - 1 : i - 1));
  }

  function showNextImage() {
    setActiveImage((i) => (i === gallery.length - 1 ? 0 : i + 1));
  }

  function handleColorChange(next: VariantSelection) {
    setSelection(next);
    setActiveImage(0);
  }

  function handleAddToCart() {
    requireAuthThen(async () => {
      try {
        await addToCart.mutateAsync({ productId: product!._id, variantSelection: selection, quantity });
        showToast(`Added ${product!.title} to your cart`);
      } catch (err) {
        showToast(extractErrorMessage(err, "Could not add to cart"), "error");
      }
    });
  }

  function handleToggleWishlist() {
// Guard against rapid double-clicks so we don't fire duplicate mutation requests before React re-renders.
    if (wishlistMutationInFlight.current) return;

    requireAuthThen(async () => {
      wishlistMutationInFlight.current = true;
      try {
        if (isInWishlist) {
          await removeFromWishlist.mutateAsync(product!._id);
          showToast(`Removed ${product!.title} from your wishlist`);
        } else {
          await addToWishlist.mutateAsync(product!._id);
          showToast(`Added ${product!.title} to your wishlist`);
        }
      } catch (err) {
        showToast(extractErrorMessage(err, "Could not update your wishlist"), "error");
      } finally {
        wishlistMutationInFlight.current = false;
      }
    });
  }

  return (
    <div>
      <div className="sticky top-24 z-30 border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <button
            onClick={() => navigate(-1)}
            className="focus-ring inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="group relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-background">
            <img
              key={gallery[activeImage]}
              src={gallery[activeImage]}
              alt={product.title}
              className="h-full w-full object-cover"
            />
            {gallery.length > 1 && (
              <>
                <button
                  onClick={showPrevImage}
                  aria-label="Previous image"
                  className="focus-ring absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink opacity-100 shadow-popover transition-opacity hover:bg-white lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={showNextImage}
                  aria-label="Next image"
                  className="focus-ring absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink opacity-100 shadow-popover transition-opacity hover:bg-white lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
              {gallery.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-pressed={activeImage === i}
                  className={`focus-ring h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 bg-background ${
                    activeImage === i ? "border-ink" : "border-transparent"
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">{product.category}</p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-ink">{product.title}</h1>
          <div className="mt-2">
            <StarRating rating={product.avgRating} reviewCount={product.reviewCount} size="md" />
          </div>
          <p className="mt-2 text-xl font-semibold tabular-nums text-ink">{formatCurrency(product.price)}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted">{product.description}</p>

          <p className="mt-4 text-sm font-medium" aria-live="polite">
            {availableStock > 0 ? (
              <span className="text-success">{availableStock} in stock</span>
            ) : (
              <span className="text-danger">Out of stock</span>
            )}
          </p>

          {product.variants.length > 0 && (
            <div className="mt-6">
              <VariantSelector axes={product.variants} selection={selection} onChange={handleColorChange} />
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <QuantityStepper
              value={quantity}
              max={Math.max(availableStock, 1)}
              onChange={setQuantity}
              disabled={availableStock === 0}
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="flex-1"
              disabled={!canAddToCart}
              isLoading={addToCart.isPending}
              onClick={handleAddToCart}
            >
              {availableStock === 0 ? "Out of stock" : "Add to Cart"}
            </Button>
            <button
              type="button"
              onClick={handleToggleWishlist}
              disabled={addToWishlist.isPending || removeFromWishlist.isPending}
              className={`focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-full border px-6 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                isInWishlist
                  ? "border-accent bg-accent-light text-accent"
                  : "border-border bg-transparent text-ink hover:bg-black/5"
              }`}
            >
              {addToWishlist.isPending || removeFromWishlist.isPending ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Heart className="h-4 w-4" aria-hidden="true" fill={isInWishlist ? "currentColor" : "none"} />
              )}
              {isInWishlist ? "Added to Wishlist" : "Add to Wishlist"}
            </button>
          </div>

          {!selectionComplete && product.variants.length > 0 && (
            <p className="mt-2 text-xs text-muted">
              Select {product.variants.map((a) => a.name.toLowerCase()).join(" and ")} to add to cart.
            </p>
          )}
        </div>
      </div>

        <ReviewSection productId={product._id} />
      </div>
    </div>
  );
}
