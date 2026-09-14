import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/ui/Button";
import { extractErrorMessage } from "../../api/client";

export function AdminLoginPage() {
  const { login, isLoggingIn, logout } = useAuth();
  const isAuthenticated = Boolean(useAuthStore((s) => s.token));
  const role = useAuthStore((s) => s.user?.role);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated && role === "admin") {
    const redirectTo = (location.state as { from?: Location } | null)?.from?.pathname ?? "/admin";
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      if (useAuthStore.getState().user?.role !== "admin") {
        logout();
        setError("This account doesn't have admin access.");
        return;
      }
      const redirectTo = (location.state as { from?: Location } | null)?.from?.pathname ?? "/admin";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, "Unable to sign in."));
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-xl bg-charcoal p-8 shadow-popover">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
          <ShieldCheck className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <h1 className="mt-4 font-heading text-xl font-bold text-white">Admin Sign In</h1>
        <p className="mt-1 text-sm text-white/50">NOVA staff access only.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-white/80">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-white/80">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" isLoading={isLoggingIn} className="mt-2 w-full">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
