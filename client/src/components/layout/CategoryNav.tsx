import { Link, useLocation, useSearchParams } from "react-router-dom";
import { CATEGORY_BUCKETS } from "../../lib/categories";

export function CategoryNav() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const activeCategory = location.pathname === "/" ? searchParams.get("category") : null;

  const linkClass = (isActive: boolean) =>
    `focus-ring whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 active:scale-95 ${
      isActive ? "border-ink bg-ink text-white scale-105" : "border-border text-muted hover:border-ink hover:text-ink"
    }`;

  return (
    <nav className="no-scrollbar flex items-center gap-2 overflow-x-auto">
      <Link to="/" className={linkClass(!activeCategory)}>
        All
      </Link>
      {CATEGORY_BUCKETS.map((bucket) => (
        <Link key={bucket.value} to={`/?category=${bucket.value}`} className={linkClass(activeCategory === bucket.value)}>
          {bucket.label}
        </Link>
      ))}
    </nav>
  );
}
