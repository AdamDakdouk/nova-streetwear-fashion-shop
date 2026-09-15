import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useLogoutDialogStore } from "../../store/logoutDialogStore";

/**
 * The header's "Account" control. Signed out it's a plain link to sign in;
 * signed in it opens a small menu. Same label either way, so the control
 * doesn't change identity depending on auth state.
 */
export function AccountMenu() {
  const user = useAuthStore((s) => s.user);
  const openLogoutDialog = useLogoutDialogStore((s) => s.open);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!user) {
    return (
      <Link
        to="/login"
        className="focus-ring hidden h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-medium text-white hover:bg-charcoal md:flex"
      >
        <UserIcon className="h-4 w-4" aria-hidden="true" /> Account
      </Link>
    );
  }

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="focus-ring flex h-10 items-center gap-1.5 rounded-full border border-border px-3 text-sm font-medium text-ink hover:bg-black/5"
      >
        <UserIcon className="h-4 w-4" aria-hidden="true" /> Account
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-surface shadow-popover"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>

          <Link
            to="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="focus-ring flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-ink hover:bg-black/5"
          >
            <UserIcon className="h-4 w-4" aria-hidden="true" /> My Account
          </Link>

          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              openLogoutDialog();
            }}
            className="focus-ring flex w-full items-center gap-2.5 border-t border-border px-4 py-3 text-left text-sm font-medium text-danger hover:bg-danger/5"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
