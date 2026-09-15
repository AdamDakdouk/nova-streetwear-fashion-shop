import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { MobileNav } from "./MobileNav";
import { AccountMenu } from "./AccountMenu";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: cart } = useCart();
  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(location.pathname === "/" ? (searchParams.get("q") ?? "") : "");

  useEffect(() => {
    setQuery(location.pathname === "/" ? (searchParams.get("q") ?? "") : "");
  }, [location.pathname, searchParams]);

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(location.pathname === "/" ? searchParams : undefined);
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    navigate({ pathname: "/", search: params.toString() });
    setSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="bg-ink px-4 py-2 text-center text-xs font-medium text-white sm:px-6">
        Free shipping on orders over $75 &middot; Free returns within 30 days
      </div>

      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="focus-ring rounded-md font-heading text-2xl font-bold tracking-tight text-ink"
        >
          NOVA
        </Link>

        <div className="ml-auto flex items-center justify-end gap-1">
          <form
            onSubmit={handleSearchSubmit}
            className="relative mr-1 hidden w-48 items-center lg:flex xl:w-64"
            role="search"
          >
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              className="focus-ring h-10 w-full rounded-full border border-border bg-white pl-9 pr-4 text-sm placeholder:text-muted"
            />
          </form>

          <button
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
            className="focus-ring flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-black/5 lg:hidden"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>

          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="focus-ring hidden h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-black/5 md:flex"
          >
            <Heart className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link
            to="/cart"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
            className="focus-ring relative flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-black/5"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            {itemCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          <AccountMenu />

          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="focus-ring flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-black/5 md:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={handleSearchSubmit} className="relative flex items-center border-t border-border/70 px-4 py-2 lg:hidden">
          <Search className="pointer-events-none absolute left-7 h-4 w-4 text-muted" aria-hidden="true" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            aria-label="Search products"
            className="focus-ring h-10 w-full rounded-full border border-border bg-white pl-9 pr-9 text-sm placeholder:text-muted"
          />
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
            className="focus-ring absolute right-7 flex h-6 w-6 items-center justify-center text-muted"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      )}

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
