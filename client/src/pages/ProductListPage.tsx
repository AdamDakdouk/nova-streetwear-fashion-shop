import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { useHero } from "../hooks/useHero";
import { ProductGrid } from "../components/product/ProductGrid";
import { HeroBanner } from "../components/product/HeroBanner";
import { CategoryNav } from "../components/layout/CategoryNav";
import { bucketMatches, CATEGORY_BUCKETS } from "../lib/categories";
import { productMatchesQuery } from "../lib/search";

/** Breathing room between the sticky header and the section title. */
const TITLE_GAP = 16;

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState<SortOption>("featured");
  const gridRef = useRef<HTMLDivElement>(null);

  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const category = searchParams.get("category");

  // Clicking a filter scrolls its section title to the top of the viewport.
  // Compares the filter value rather than tracking "is this the first render",
  // which isn't idempotent: StrictMode double-invokes effects, so a flag gets
  // consumed on the first pass and scrolls on the second, which would drag a
  // fresh page load past the hero.
  const lastFilter = useRef(`${category ?? ""}:${query}`);
  useLayoutEffect(() => {
    const current = `${category ?? ""}:${query}`;
    if (lastFilter.current === current) return;
    lastFilter.current = current;

    const grid = gridRef.current;
    if (!grid) return;
    // Scrolls to an absolute document position rather than calling
    // scrollIntoView: straight after a router navigation, scrollIntoView
    // resolves against a stale layout and lands an extra scroll-height further
    // down on each successive filter click.
    // The offset is read from the sticky header instead of hardcoded, because
    // that header wraps to a taller stack at narrow widths — a fixed value that
    // clears it on desktop tucks the title underneath it on mobile.
    const header = document.querySelector("header");
    const offset = (header?.getBoundingClientRect().height ?? 0) + TITLE_GAP;
    const target = grid.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, target) });
  }, [category, query]);

  const filtered = useMemo(() => {
    if (!products) return products;

    let list = products.filter((p) => {
      const matchesQuery = !query || productMatchesQuery(p, query);
      const matchesCategory = !category || bucketMatches(category, p.category);
      return matchesQuery && matchesCategory;
    });

    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "name-asc") list = [...list].sort((a, b) => a.title.localeCompare(b.title));

    return list;
  }, [products, query, category, sort]);

  function clearSearch() {
    // Drops only the search term — an active category filter stays put.
    const next = new URLSearchParams(searchParams);
    next.delete("q");
    setSearchParams(next, { replace: true });
  }

  const categoryLabel = CATEGORY_BUCKETS.find((b) => b.value === category)?.label;
  const heading = query ? `Results for "${searchParams.get("q")}"` : categoryLabel ?? "All Products";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {hero && (
        <HeroBanner
          hero={hero}
          onShopClick={() => gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        />
      )}

      <div ref={gridRef} className="mb-6 flex scroll-mt-32 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="font-heading text-2xl font-bold text-ink">{heading}</h1>
            {query && (
              /* Only below lg, where the header's search field is collapsed behind
                 a toggle — clearing there otherwise means reopening the field,
                 emptying it and submitting. At lg+ the field is always visible
                 with the term still in it, so this would be a second way to do
                 something already one click away. */
              <button
                type="button"
                onClick={clearSearch}
                className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold text-muted hover:border-ink hover:text-ink lg:hidden"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Clear search
              </button>
            )}
          </div>
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
