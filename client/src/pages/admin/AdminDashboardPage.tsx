import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, LogOut, Pencil, Plus, Trash2, X } from "lucide-react";
import { useAdminProducts, useDeleteAdminProduct } from "../../hooks/useAdminProducts";
import { useAuthStore } from "../../store/authStore";
import { useLogoutDialogStore } from "../../store/logoutDialogStore";
import { Button } from "../../components/ui/Button";
import { PageSpinner } from "../../components/ui/Spinner";
import { useToast } from "../../components/ui/Toast";
import { formatCurrency } from "../../lib/formatCurrency";
import { extractErrorMessage } from "../../api/client";
import type { AdminProduct } from "../../types";

function totalStockOf(product: AdminProduct): number {
  if (product.variants.length === 0) return product.baseStock;
  return product.variants[0].options.reduce((sum, opt) => sum + opt.stock, 0);
}

function DeleteButton({ product }: { product: AdminProduct }) {
  const [confirming, setConfirming] = useState(false);
  const deleteProduct = useDeleteAdminProduct();
  const { showToast } = useToast();

  async function handleDelete() {
    try {
      await deleteProduct.mutateAsync(product._id);
      showToast(`Deleted ${product.title}`);
    } catch (err) {
      showToast(extractErrorMessage(err, "Could not delete this product."), "error");
    } finally {
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleDelete}
          disabled={deleteProduct.isPending}
          className="focus-ring rounded-md bg-danger px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          Confirm
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="focus-ring rounded-md px-2 py-1 text-xs font-medium text-muted hover:text-ink"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      aria-label={`Delete ${product.title}`}
      className="focus-ring flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-danger/5 hover:text-danger"
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

type SortKey = "title" | "price" | "stock";
type SortDirection = "asc" | "desc";
interface SortState {
  key: SortKey;
  direction: SortDirection;
}

function SortableHeader({
  label,
  sortKey,
  activeSort,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeSort: SortState | null;
  onSort: (key: SortKey) => void;
}) {
  const isActive = activeSort?.key === sortKey;
  const Icon = !isActive ? ArrowUpDown : activeSort.direction === "asc" ? ArrowUp : ArrowDown;

  return (
    <th className="px-4 py-3">
      <button
        onClick={() => onSort(sortKey)}
        className={`focus-ring inline-flex items-center gap-1 hover:text-ink ${isActive ? "text-ink" : ""}`}
      >
        {label}
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </th>
  );
}

function CategoryHeader({
  categories,
  activeCategory,
  onSelect,
}: {
  categories: string[];
  activeCategory: string | null;
  onSelect: (category: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <th className="relative px-4 py-3" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`focus-ring inline-flex items-center gap-1 hover:text-ink ${activeCategory ? "text-ink" : ""}`}
      >
        Category
        <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      {activeCategory && (
        <button
          onClick={() => onSelect(null)}
          aria-label="Clear category filter"
          className="focus-ring ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white"
        >
          <X className="h-2.5 w-2.5" aria-hidden="true" />
        </button>
      )}

      {open && (
        <div className="absolute left-4 top-full z-10 mt-1 w-44 rounded-md border border-border bg-surface py-1 normal-case shadow-popover">
          <button
            onClick={() => {
              onSelect(null);
              setOpen(false);
            }}
            className={`block w-full px-3 py-2 text-left text-sm hover:bg-black/5 ${!activeCategory ? "font-semibold text-ink" : "text-muted"}`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => {
                onSelect(c);
                setOpen(false);
              }}
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-black/5 ${activeCategory === c ? "font-semibold text-ink" : "text-muted"}`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </th>
  );
}

export function AdminDashboardPage() {
  const { data: products, isLoading } = useAdminProducts();
  const { user } = useAuthStore();
  const openLogoutDialog = useLogoutDialogStore((s) => s.open);

  const [sort, setSort] = useState<SortState | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set((products ?? []).map((p) => p.category))).sort(),
    [products]
  );

  const visibleProducts = useMemo(() => {
    let list = products ?? [];
    if (categoryFilter) {
      list = list.filter((p) => p.category === categoryFilter);
    }
    if (sort) {
      const dir = sort.direction === "asc" ? 1 : -1;
      list = [...list].sort((a, b) => {
        if (sort.key === "title") return a.title.localeCompare(b.title) * dir;
        if (sort.key === "price") return (a.price - b.price) * dir;
        return (totalStockOf(a) - totalStockOf(b)) * dir;
      });
    }
    return list;
  }, [products, categoryFilter, sort]);

  function handleSort(key: SortKey) {
    setSort((prev) =>
      prev?.key === key ? { key, direction: prev.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" }
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="font-heading text-lg font-bold text-ink">NOVA Admin</p>
            <p className="text-xs text-muted">Signed in as {user?.email}</p>
          </div>
          <button
            onClick={openLogoutDialog}
            className="focus-ring flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-ink hover:bg-black/5"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-ink">Products</h1>
            <p className="mt-1 text-sm text-muted">
              {visibleProducts.length} of {products?.length ?? 0}
            </p>
          </div>
          <Link to="/admin/products/new">
            <Button>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add Product
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <PageSpinner />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-background text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <SortableHeader label="Product" sortKey="title" activeSort={sort} onSort={handleSort} />
                  <CategoryHeader categories={categories} activeCategory={categoryFilter} onSelect={setCategoryFilter} />
                  <SortableHeader label="Price" sortKey="price" activeSort={sort} onSort={handleSort} />
                  <SortableHeader label="Stock" sortKey="stock" activeSort={sort} onSort={handleSort} />
                  <th className="px-4 py-3">Variants</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {visibleProducts.map((product) => (
                  <tr key={product._id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.thumbnail}
                          alt=""
                          className="h-10 w-10 flex-shrink-0 rounded-md object-cover"
                        />
                        <span className="font-medium text-ink">{product.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{product.category}</td>
                    <td className="px-4 py-3 tabular-nums text-ink">{formatCurrency(product.price)}</td>
                    <td className="px-4 py-3 tabular-nums text-ink">{totalStockOf(product)}</td>
                    <td className="px-4 py-3 text-muted">
                      {product.variants.length === 0 ? "—" : product.variants.map((v) => v.name).join(", ")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          aria-label={`Edit ${product.title}`}
                          className="focus-ring flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-black/5 hover:text-ink"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <DeleteButton product={product} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {visibleProducts.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-muted">
                {categoryFilter ? `No products in "${categoryFilter}".` : "No products yet."}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
