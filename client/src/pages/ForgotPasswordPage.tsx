import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { extractErrorMessage } from "../api/client";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { forgotPassword, isSendingForgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await forgotPassword(email);
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      setError(extractErrorMessage(err, "Something went wrong. Please try again."));
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-light">
        <KeyRound className="h-5 w-5 text-accent" aria-hidden="true" />
      </div>

      <h1 className="mt-4 font-heading text-2xl font-bold text-ink">Forgot your password?</h1>
      <p className="mt-1 text-sm text-muted">
        Enter your account email and we'll send you a 6-digit code to reset it.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
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
            className="focus-ring h-11 w-full rounded-md border border-border px-3 text-sm"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" isLoading={isSendingForgotPassword} className="w-full">
          Send Reset Code
        </Button>
      </form>

      <Link to="/login" className="focus-ring mt-4 self-center rounded-md text-sm text-muted hover:text-ink">
        Back to sign in
      </Link>
    </div>
  );
}
