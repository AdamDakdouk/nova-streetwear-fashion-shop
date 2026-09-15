import { FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { extractErrorCode, extractErrorMessage, extractFieldErrors, extractRetryAfterMs } from "../api/client";
import { useToast } from "../components/ui/Toast";

type Mode = "login" | "register";

export function LoginPage() {
  const { isAuthenticated, login, register, isLoggingIn, isRegistering, resendOtp, isResendingOtp } = useAuth();
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
  const [needsVerification, setNeedsVerification] = useState(false);

  if (isAuthenticated) {
    const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? "/";
    return <Navigate to={redirectTo} replace />;
  }

  const isPending = isLoggingIn || isRegistering;
  const from = (location.state as { from?: Location } | null)?.from;

  function switchMode() {
    setMode(mode === "login" ? "register" : "login");
    setName("");
    setEmail("");
    setPassword("");
    setError(null);
    setFieldErrors({});
    setNeedsVerification(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setNeedsVerification(false);
    try {
      if (mode === "login") {
        await login({ email, password });
        showToast("Signed in successfully");
        navigate(from?.pathname ?? "/", { replace: true });
      } else {
        await register({ name, email, password });
        navigate("/verify-email", { state: { email, from } });
      }
    } catch (err) {
      if (mode === "login" && extractErrorCode(err) === "EMAIL_NOT_VERIFIED") {
        setNeedsVerification(true);
        return;
      }
      const perField = extractFieldErrors(err);
      if (Object.keys(perField).length > 0) {
        setFieldErrors(perField);
      } else {
        setError(extractErrorMessage(err, "Unable to sign in. Please try again."));
      }
    }
  }

  async function handleResendVerification() {
    try {
      await resendOtp({ email, purpose: "verify-email" });
      navigate("/verify-email", { state: { email, from } });
    } catch (err) {
      const retryAfterMs = extractRetryAfterMs(err);
      if (retryAfterMs) {
        // Already on cooldown from an earlier send (e.g. at registration) — still
        // take them to the verify screen so they see the real countdown instead
        // of a bare "please wait" with no indication of how long.
        navigate("/verify-email", { state: { email, from, retryAfterMs } });
        return;
      }
      setError(extractErrorMessage(err, "Could not resend the code."));
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
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-ink">
              Password
            </label>
            {mode === "login" && (
              <Link to="/forgot-password" className="focus-ring rounded-md text-xs text-accent hover:text-accent-hover">
                Forgot password?
              </Link>
            )}
          </div>
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

        {needsVerification && (
          <div className="rounded-md border border-accent/30 bg-accent-light/40 px-4 py-3 text-sm text-ink">
            Please verify your email before signing in.{" "}
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isResendingOtp}
              className="focus-ring font-medium text-accent underline underline-offset-2 hover:text-accent-hover disabled:opacity-50"
            >
              Resend verification code
            </button>
          </div>
        )}

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
