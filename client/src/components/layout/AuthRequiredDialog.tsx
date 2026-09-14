import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock, X } from "lucide-react";
import { useAuthRequiredDialogStore } from "../../store/authRequiredDialogStore";
import { Button } from "../ui/Button";

export function AuthRequiredDialog() {
  const isOpen = useAuthRequiredDialogStore((s) => s.isOpen);
  const close = useAuthRequiredDialogStore((s) => s.close);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  function goTo(mode: "login" | "register") {
    close();
    navigate("/login", { state: { mode, from: location } });
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-required-title"
    >
      <div className="absolute inset-0 bg-black/40" onClick={close} />

      <div className="relative w-full max-w-sm rounded-xl bg-surface p-6 shadow-popover">
        <button
          onClick={close}
          aria-label="Close"
          className="focus-ring absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-black/5 hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-light">
          <Lock className="h-5 w-5 text-accent" aria-hidden="true" />
        </div>

        <h2 id="auth-required-title" className="mt-4 font-heading text-lg font-semibold text-ink">
          Sign in required
        </h2>
        <p className="mt-1 text-sm text-muted">
          You need an account to add items to your cart or wishlist.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Button className="w-full" onClick={() => goTo("login")}>
            Sign In
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => goTo("register")}>
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
}
