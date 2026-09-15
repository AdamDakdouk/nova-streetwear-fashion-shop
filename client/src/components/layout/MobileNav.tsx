import { useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Heart, LogOut, Package, ShoppingBag, User as UserIcon, X } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useLogoutDialogStore } from "../../store/logoutDialogStore";
import { CATEGORY_BUCKETS } from "../../lib/categories";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const location = useLocation();
  const { user } = useAuthStore();
  const openLogoutDialog = useLogoutDialogStore((s) => s.open);

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `focus-ring flex items-center gap-3 rounded-md px-4 py-3 text-base font-medium ${
      isActive ? "bg-accent-light text-accent" : "text-ink hover:bg-black/5"
    }`;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex w-4/5 max-w-xs flex-col bg-surface p-4 shadow-popover">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-heading text-lg font-bold text-ink">Menu</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="focus-ring flex h-11 w-11 items-center justify-center rounded-md text-ink hover:bg-black/5"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          <NavLink to="/" end className={linkClass}>
            <Package className="h-5 w-5" aria-hidden="true" /> Products
          </NavLink>
          <NavLink to="/wishlist" className={linkClass}>
            <Heart className="h-5 w-5" aria-hidden="true" /> Wishlist
          </NavLink>
          <NavLink to="/cart" className={linkClass}>
            <ShoppingBag className="h-5 w-5" aria-hidden="true" /> Cart
          </NavLink>
        </nav>

        <p className="mb-2 mt-6 px-4 text-xs font-semibold uppercase tracking-wider text-muted">Shop by category</p>
        <nav className="flex flex-col gap-1">
          {CATEGORY_BUCKETS.map((bucket) => (
            <Link
              key={bucket.value}
              to={`/?category=${bucket.value}`}
              className="focus-ring rounded-md px-4 py-2.5 text-sm font-medium text-ink hover:bg-black/5"
            >
              {bucket.label}
            </Link>
          ))}
        </nav>

        {user ? (
          <div className="mt-auto border-t border-border pt-2">
            <div className="px-4 py-2">
              <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
            <NavLink to="/account" className={linkClass}>
              <UserIcon className="h-5 w-5" aria-hidden="true" /> My Account
            </NavLink>
            <button
              onClick={() => {
                onClose();
                openLogoutDialog();
              }}
              className="focus-ring flex w-full items-center gap-3 rounded-md px-4 py-3 text-base font-medium text-danger hover:bg-danger/5"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" /> Log out
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="focus-ring mt-auto flex items-center gap-3 rounded-md px-4 py-3 text-base font-medium text-ink hover:bg-black/5"
          >
            <UserIcon className="h-5 w-5" aria-hidden="true" /> Account
          </Link>
        )}
      </div>
    </div>
  );
}
