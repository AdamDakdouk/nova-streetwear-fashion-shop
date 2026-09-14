import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useLogoutDialogStore } from "../../store/logoutDialogStore";
import { useAuthStore } from "../../store/authStore";
import { useToast } from "../ui/Toast";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";

const LOGOUT_DELAY_MS = 2000;

export function LogoutConfirmDialog() {
  const isOpen = useLogoutDialogStore((s) => s.isOpen);
  const close = useLogoutDialogStore((s) => s.close);
  const logout = useAuthStore((s) => s.logout);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<"confirm" | "loading">("confirm");

  useEffect(() => {
    if (isOpen) setPhase("confirm");
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || phase !== "loading") return;

    const timer = setTimeout(() => {
      logout();
      close();
      navigate("/");
      showToast("Logged out successfully");
    }, LOGOUT_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isOpen, phase, logout, close, navigate, showToast]);

  useEffect(() => {
    if (!isOpen || phase !== "confirm") return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, phase, close]);

  if (!isOpen) return null;

  const isLoading = phase === "loading";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-labelledby="logout-dialog-title">
      <div className="absolute inset-0 bg-black/40" onClick={() => !isLoading && close()} />

      <div className="relative w-full max-w-sm rounded-xl bg-surface p-6 shadow-popover">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-light">
          <LogOut className="h-5 w-5 text-accent" aria-hidden="true" />
        </div>

        <h2 id="logout-dialog-title" className="mt-4 font-heading text-lg font-semibold text-ink">
          Log out of NOVA?
        </h2>
        <p className="mt-1 text-sm text-muted">
          {isLoading ? "Logging you out…" : "You'll need to sign in again to access your cart and wishlist."}
        </p>

        {isLoading ? (
          <div className="mt-6 flex items-center justify-center gap-2 py-2" aria-live="polite">
            <Spinner className="h-5 w-5" />
          </div>
        ) : (
          <div className="mt-6 flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={close}>
              Cancel
            </Button>
            <button
              type="button"
              onClick={() => setPhase("loading")}
              className="focus-ring h-11 flex-1 rounded-md bg-danger text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
