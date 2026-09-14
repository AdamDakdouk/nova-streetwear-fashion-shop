import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { ProductGrid } from "../components/product/ProductGrid";
import { CategoryNav } from "../components/layout/CategoryNav";
import { bucketMatches, CATEGORY_BUCKETS } from "../lib/categories";

export function ProductListPage() {
  const { data: products, isLoading } = useProducts();
  const [searchParams] = useSearchParams();

  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const category = searchParams.get("category");

  const filtered = useMemo(() => {
    if (!products) return products;
    return products.filter((p) => {
      const matchesQuery = !query || p.title.toLowerCase().includes(query);
      const matchesCategory = !category || bucketMatches(category, p.category);
      return matchesQuery && matchesCategory;
    });
  }, [products, query, category]);

  const categoryLabel = CATEGORY_BUCKETS.find((b) => b.value === category)?.label;
  const heading = query ? `Results for "${searchParams.get("q")}"` : categoryLabel ?? "All Products";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">{heading}</h1>
          <p className="mt-1 text-sm text-muted">{filtered?.length ?? "—"} items</p>
        </div>
        <CategoryNav />
      </div>
      <ProductGrid key={`${category ?? "all"}:${query}`} products={filtered} isLoading={isLoading} />
    </div>
  );
}
