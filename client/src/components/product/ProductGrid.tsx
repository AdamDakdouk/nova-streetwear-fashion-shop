import { PackageSearch } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "../ui/EmptyState";
import type { ProductSummary } from "../../types";

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border/70 bg-surface">
      <div className="aspect-[3/4] w-full animate-pulse bg-background" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-black/5" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-black/5" />
      </div>
    </div>
  );
}

interface ProductGridProps {
  products?: ProductSummary[];
  isLoading: boolean;
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="animate-fade-in">
        <EmptyState
          icon={PackageSearch}
          title="No products found"
          description="Check back soon — new arrivals are on the way."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, i) => (
        <div
          key={product._id}
          className="grid animate-fade-in-up"
          style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
