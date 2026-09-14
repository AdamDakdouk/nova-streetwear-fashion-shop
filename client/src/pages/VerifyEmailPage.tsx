import { FormEvent, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useResendCooldown } from "../hooks/useResendCooldown";
import { Button } from "../components/ui/Button";
import { OtpInput } from "../components/ui/OtpInput";
import { useToast } from "../components/ui/Toast";
import { extractErrorMessage, extractRetryAfterMs } from "../api/client";

interface LocationState {
  email?: string;
  from?: Location;
}

export function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, verifyEmail, isVerifyingEmail, resendOtp, isResendingOtp } = useAuth();
  const { showToast } = useToast();
  const cooldown = useResendCooldown();

  const state = location.state as LocationState | null;
  const email = state?.email;

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // A code was just sent by whatever flow (register, or "resend" from login)
    // brought the shopper here — start the cooldown immediately.
    cooldown.start(60_000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isAuthenticated) {
    const redirectTo = state?.from?.pathname ?? "/";
    return <Navigate to={redirectTo} replace />;
  }

  if (!email) {
    return <Navigate to="/login" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await verifyEmail({ email: email!, code });
      showToast("Email verified — welcome to NOVA!");
      navigate(state?.from?.pathname ?? "/", { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, "Could not verify that code."));
    }
  }

  async function handleResend() {
    setError(null);
    try {
      await resendOtp({ email: email!, purpose: "verify-email" });
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
        <MailCheck className="h-5 w-5 text-accent" aria-hidden="true" />
      </div>

      <h1 className="mt-4 font-heading text-2xl font-bold text-ink">Check your email</h1>
      <p className="mt-1 text-sm text-muted">
        We sent a 6-digit code to <span className="font-medium text-ink">{email}</span>.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        <OtpInput value={code} onChange={setCode} autoFocus />

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" isLoading={isVerifyingEmail} disabled={code.length !== 6} className="w-full">
          Verify Email
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
