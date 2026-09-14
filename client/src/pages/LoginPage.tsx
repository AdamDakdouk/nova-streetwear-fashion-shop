import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { extractErrorMessage, extractFieldErrors } from "../api/client";
import { useToast } from "../components/ui/Toast";

type Mode = "login" | "register";

export function LoginPage() {
  const { isAuthenticated, login, register, isLoggingIn, isRegistering } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const initialMode = (location.state as { mode?: Mode } | null)?.mode ?? "login";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (isAuthenticated) {
    const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? "/";
    return <Navigate to={redirectTo} replace />;
  }

  const isPending = isLoggingIn || isRegistering;

  function switchMode() {
    setMode(mode === "login" ? "register" : "login");
    setName("");
    setEmail("");
    setPassword("");
    setError(null);
    setFieldErrors({});
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    try {
      if (mode === "login") {
        await login({ email, password });
        showToast("Signed in successfully");
      } else {
        await register({ name, email, password });
        showToast("Account created successfully");
      }
      const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const perField = extractFieldErrors(err);
      if (Object.keys(perField).length > 0) {
        setFieldErrors(perField);
      } else {
        setError(extractErrorMessage(err, "Unable to sign in. Please try again."));
      }
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <h1 className="font-heading text-2xl font-bold text-ink">
        {mode === "login" ? "Sign in" : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {mode === "login" ? "Welcome back to NOVA." : "Join NOVA to start shopping."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        {mode === "register" && (
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
              Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
              className="focus-ring h-11 w-full rounded-md border border-border px-3 text-sm"
            />
            {fieldErrors.name && (
              <p id="name-error" role="alert" className="mt-1 text-xs text-danger">
                {fieldErrors.name}
              </p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            className="focus-ring h-11 w-full rounded-md border border-border px-3 text-sm"
          />
          {fieldErrors.email && (
            <p id="email-error" role="alert" className="mt-1 text-xs text-danger">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
            className="focus-ring h-11 w-full rounded-md border border-border px-3 text-sm"
          />
          {fieldErrors.password && (
            <p id="password-error" role="alert" className="mt-1 text-xs text-danger">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" isLoading={isPending} className="mt-2 w-full">
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <button type="button" onClick={switchMode} className="focus-ring mt-4 self-center rounded-md text-sm text-muted hover:text-ink">
        {mode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
