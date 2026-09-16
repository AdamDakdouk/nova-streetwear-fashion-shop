import { FormEvent, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useResendCooldown } from "../hooks/useResendCooldown";
import { Button } from "../components/ui/Button";
import { OtpInput } from "../components/ui/OtpInput";
import { useToast } from "../components/ui/Toast";
import { extractErrorMessage, extractFieldErrors, extractRetryAfterMs } from "../api/client";

interface LocationState {
  email?: string;
}

export function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdmin = searchParams.get("from") === "admin";
  const { resetPassword, isResettingPassword, resendOtp, isResendingOtp } = useAuth();
  const { showToast } = useToast();
  const cooldown = useResendCooldown();

  const email = (location.state as LocationState | null)?.email;

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    cooldown.start(60_000);
  }, []);

  if (!email) {
    return <Navigate to={`/forgot-password${isAdmin ? "?from=admin" : ""}`} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (newPassword !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords don't match" });
      return;
    }

    try {
      await resetPassword({ email: email!, code, newPassword });
      showToast("Password reset — please sign in.");
      navigate(isAdmin ? "/admin/login" : "/login", { replace: true });
    } catch (err) {
      const perField = extractFieldErrors(err);
      if (Object.keys(perField).length > 0) {
        setFieldErrors(perField);
      } else {
        setError(extractErrorMessage(err, "Could not reset your password."));
      }
    }
  }

  async function handleResend() {
    setError(null);
    try {
      await resendOtp({ email: email!, purpose: "reset-password" });
      cooldown.start(60_000);
      showToast("New code sent.");
    } catch (err) {
      const retryAfter = extractRetryAfterMs(err);
      if (retryAfter) cooldown.start(retryAfter);
      setError(extractErrorMessage(err, "Could not resend the code."));
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-light">
        <KeyRound className="h-5 w-5 text-accent" aria-hidden="true" />
      </div>

      <h1 className="mt-4 font-heading text-2xl font-bold text-ink">Reset your password</h1>
      <p className="mt-1 text-sm text-muted">
        Enter the code sent to <span className="font-medium text-ink">{email}</span> and choose a new password.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        <OtpInput value={code} onChange={setCode} autoFocus />

        <div>
          <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-ink">
            New password
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            aria-invalid={Boolean(fieldErrors.newPassword)}
            className="focus-ring h-11 w-full rounded-md border border-border px-3 text-sm"
          />
          {fieldErrors.newPassword && (
            <p role="alert" className="mt-1 text-xs text-danger">
              {fieldErrors.newPassword}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-ink">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            className="focus-ring h-11 w-full rounded-md border border-border px-3 text-sm"
          />
          {fieldErrors.confirmPassword && (
            <p role="alert" className="mt-1 text-xs text-danger">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          isLoading={isResettingPassword}
          disabled={code.length !== 6}
          className="w-full"
        >
          Reset Password
        </Button>
      </form>

      <button
        type="button"
        onClick={handleResend}
        disabled={cooldown.isActive || isResendingOtp}
        className="focus-ring mt-4 self-center rounded-md text-sm text-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
      >
        {cooldown.isActive ? `Resend code in ${cooldown.remainingSeconds}s` : "Resend code"}
      </button>
    </div>
  );
}
