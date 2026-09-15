import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useHero } from "../hooks/useHero";
import { ProductGrid } from "../components/product/ProductGrid";
import { HeroBanner } from "../components/product/HeroBanner";
import { CategoryNav } from "../components/layout/CategoryNav";
import { bucketMatches, CATEGORY_BUCKETS } from "../lib/categories";

/** Breathing room above the product grid when a filter scrolls it into view. */
const GRID_SCROLL_OFFSET = 24;

type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc";

const SORT_LABELS: Record<SortOption, string> = {
  featured: "Featured",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  "name-asc": "Name: A to Z",
};

export function ProductListPage() {
  const { data: products, isLoading } = useProducts();
  const { data: hero } = useHero();
  const [searchParams] = useSearchParams();
  const [sort, setSort] = useState<SortOption>("featured");
  const gridRef = useRef<HTMLDivElement>(null);

  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const category = searchParams.get("category");
  const isDefaultView = !query && !category;

  // Changing a filter should leave you looking at the products. Scroll position
  // resets on every filter click, but only the unfiltered view renders the hero
  // above the grid — so without this, clearing a filter drops the products below
  // the fold while every other filter leaves them at the top.
  // Compares the filter itself rather than tracking "is this the first render":
  // a first-render flag isn't idempotent, so StrictMode's double-invoked effect
  // would consume it on the first pass and scroll on the second, dragging the
  // homepage past its own hero on load.
  const lastFilter = useRef(`${category ?? ""}:${query}`);
  useLayoutEffect(() => {
    const current = `${category ?? ""}:${query}`;
    if (lastFilter.current === current) return;
    lastFilter.current = current;

    const grid = gridRef.current;
    if (!grid) return;
    // Runs as a layout effect against an explicit target rather than
    // scrollIntoView in a passive effect: toggling the hero changes the page
    // height above the grid, and the browser's scroll anchoring would otherwise
    // adjust the scroll position again after a passive effect had already moved it.
    window.scrollTo({ top: grid.offsetTop - GRID_SCROLL_OFFSET });
  }, [category, query]);

  const filtered = useMemo(() => {
    if (!products) return products;

    let list = products.filter((p) => {
      const matchesQuery = !query || p.title.toLowerCase().includes(query);
      const matchesCategory = !category || bucketMatches(category, p.category);
      return matchesQuery && matchesCategory;
    });

    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "name-asc") list = [...list].sort((a, b) => a.title.localeCompare(b.title));

    return list;
  }, [products, query, category, sort]);

  const categoryLabel = CATEGORY_BUCKETS.find((b) => b.value === category)?.label;
  const heading = query ? `Results for "${searchParams.get("q")}"` : categoryLabel ?? "All Products";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {isDefaultView && hero && (
        <HeroBanner
          hero={hero}
          onShopClick={() => gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        />
      )}

      <div ref={gridRef} className="mb-6 flex scroll-mt-24 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">{heading}</h1>
          <p className="mt-1 text-sm text-muted">{filtered?.length ?? "—"} items</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <CategoryNav />
          <label className="flex items-center gap-2 text-xs font-medium text-muted">
            Sort by
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="focus-ring h-9 rounded-full border border-border bg-white pl-3 pr-8 text-sm text-ink"
            >
              {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                <option key={key} value={key}>
                  {SORT_LABELS[key]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <ProductGrid key={`${category ?? "all"}:${query}:${sort}`} products={filtered} isLoading={isLoading} />
    </div>
  );
}
