import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Lock, ShieldAlert } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { useAuthStore } from "../store/authStore";
import { placeOrder } from "../api/orders.api";
import { formatCurrency } from "../lib/formatCurrency";
import {
  DEMO_CARD_NUMBER,
  detectCardBrand,
  digitsOnly,
  expectedCardLength,
  expectedCvvLength,
  formatCardNumber,
  isExpiryInPast,
  passesLuhn,
} from "../lib/payment";
import { Button } from "../components/ui/Button";
import { PageSpinner } from "../components/ui/Spinner";
import { extractErrorMessage, extractFieldErrors } from "../api/client";

/** How long the fake payment "processes" for, so the step is visible. */
const PAYMENT_DELAY_MS = 1400;

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 12 }, (_, i) => String(CURRENT_YEAR + i));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

type Errors = Record<string, string>;

function Field({
  id,
  label,
  value,
  onChange,
  error,
  className = "",
  ...rest
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "value" | "onChange">) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="focus-ring h-11 w-full rounded-md border border-border px-3 text-sm"
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function CheckoutPage() {
  const { data: cart, isLoading } = useCart();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const [cardName, setCardName] = useState("");
  // Prefilled: this is a simulated checkout and the demo card is the only
  // number that makes sense to use here. It also removes the main reason
  // someone might reach for a real card out of habit.
  const [cardNumber, setCardNumber] = useState(DEMO_CARD_NUMBER);
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  // Set the moment the order succeeds. Without it, emptying the cart cache
  // re-renders this page, the empty-cart guard below fires, and the shopper is
  // bounced to /cart instead of the confirmation they just paid for.
  const [hasPlacedOrder, setHasPlacedOrder] = useState(false);

  const placeOrderMutation = useMutation({
    mutationFn: placeOrder,
    onSuccess: (order) => {
      setHasPlacedOrder(true);
      queryClient.setQueryData(["cart"], { items: [], total: 0 });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      navigate(`/order-confirmation/${order._id}`);
    },
    onError: (err) => {
      const perField = extractFieldErrors(err);
      if (Object.keys(perField).length > 0) setErrors(perField);
      setFormError(extractErrorMessage(err, "Could not place your order"));
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  if (isLoading) return <PageSpinner />;

  if (!hasPlacedOrder && (!cart || cart.items.length === 0)) {
    return <Navigate to="/cart" replace />;
  }

  if (!cart) return <PageSpinner />;

  const cardDigits = digitsOnly(cardNumber);
  const brand = detectCardBrand(cardDigits);

  function validate(): Errors {
    const next: Errors = {};

    if (!fullName.trim()) next.fullName = "Full name is required";
    if (!phone.trim()) next.phone = "Phone number is required";
    if (!line1.trim()) next.line1 = "Address is required";
    if (!city.trim()) next.city = "City is required";
    if (!postalCode.trim()) next.postalCode = "Postal code is required";
    if (!country.trim()) next.country = "Country is required";

    if (!cardName.trim()) next.cardName = "Name on card is required";

    if (!cardDigits) {
      next.cardNumber = "Card number is required";
    } else if (cardDigits.length !== expectedCardLength(cardDigits)) {
      next.cardNumber = `${brand} numbers are ${expectedCardLength(cardDigits)} digits`;
    } else if (!passesLuhn(cardDigits)) {
      next.cardNumber = "That card number doesn't look right";
    }

    if (!expiryMonth || !expiryYear) {
      next.expiry = "Expiry date is required";
    } else if (isExpiryInPast(expiryMonth, expiryYear)) {
      next.expiry = "That card has expired";
    }

    const cvvLength = expectedCvvLength(cardDigits);
    if (!cvv) {
      next.cvv = "Required";
    } else if (digitsOnly(cvv).length !== cvvLength) {
      next.cvv = `${cvvLength} digits`;
    }

    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Simulated authorisation. In a real store this is where a payment
    // provider's SDK would take the card directly from the browser and hand
    // back a token — which is why nothing below sends the number anywhere.
    setIsPaying(true);
    await new Promise((resolve) => setTimeout(resolve, PAYMENT_DELAY_MS));
    setIsPaying(false);

    placeOrderMutation.mutate({
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        line1: line1.trim(),
        line2: line2.trim() || undefined,
        city: city.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
      },
      // Only these two leave the browser.
      payment: { brand, last4: cardDigits.slice(-4) },
    });
  }

  const isBusy = isPaying || placeOrderMutation.isPending;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-2xl font-bold text-ink">Checkout</h1>
      <p className="mt-1 text-sm text-muted">Enter your delivery and payment details to place the order.</p>

      <div className="mt-6 flex items-start gap-2 rounded-lg border border-accent/30 bg-accent-light/40 px-4 py-3">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-ink">
          <span className="font-semibold">Demo checkout — do not enter a real card.</span> No payment is taken and
          no bank is contacted. Your card number, expiry and security code stay in this browser and are never sent
          to the server; only the card brand and last 4 digits are saved with the order. The demo card{" "}
          <span className="font-mono font-medium">{DEMO_CARD_NUMBER}</span> is filled in for you — add any future
          expiry date and any CVV.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="font-heading text-lg font-semibold text-ink">Delivery address</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="fullName" label="Full name" value={fullName} onChange={setFullName} error={errors.fullName} autoComplete="name" />
              <Field id="phone" label="Phone number" value={phone} onChange={setPhone} error={errors.phone} autoComplete="tel" inputMode="tel" />
              <Field id="line1" label="Address" value={line1} onChange={setLine1} error={errors.line1} autoComplete="address-line1" className="sm:col-span-2" />
              <Field
                id="line2"
                label="Apartment, floor (optional)"
                value={line2}
                onChange={setLine2}
                autoComplete="address-line2"
                className="sm:col-span-2"
              />
              <Field id="city" label="City" value={city} onChange={setCity} error={errors.city} autoComplete="address-level2" />
              <Field id="postalCode" label="Postal code" value={postalCode} onChange={setPostalCode} error={errors.postalCode} autoComplete="postal-code" />
              <Field id="country" label="Country" value={country} onChange={setCountry} error={errors.country} autoComplete="country-name" className="sm:col-span-2" />
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-lg font-semibold text-ink">Payment</h2>
              <span className="flex items-center gap-1 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                <Lock className="h-3 w-3" aria-hidden="true" /> Simulated
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="cardName" label="Name on card" value={cardName} onChange={setCardName} error={errors.cardName} autoComplete="off" className="sm:col-span-2" />

              <div className="sm:col-span-2">
                <label htmlFor="cardNumber" className="mb-1 block text-sm font-medium text-ink">
                  Card number
                </label>
                <div className="relative">
                  <input
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder={DEMO_CARD_NUMBER}
                    aria-invalid={Boolean(errors.cardNumber)}
                    aria-describedby={errors.cardNumber ? "cardNumber-error" : undefined}
                    className="focus-ring h-11 w-full rounded-md border border-border pl-3 pr-24 font-mono text-sm"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-xs font-medium text-muted">
                    <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
                    {cardDigits.length > 0 && brand !== "Card" ? brand : ""}
                  </span>
                </div>
                {errors.cardNumber && (
                  <p id="cardNumber-error" role="alert" className="mt-1 text-xs text-danger">
                    {errors.cardNumber}
                  </p>
                )}
              </div>

              <div>
                <span className="mb-1 block text-sm font-medium text-ink">Expiry date</span>
                <div className="flex gap-2">
                  <select
                    value={expiryMonth}
                    onChange={(e) => setExpiryMonth(e.target.value)}
                    aria-label="Expiry month"
                    aria-invalid={Boolean(errors.expiry)}
                    className="focus-ring h-11 w-full rounded-md border border-border bg-white px-2 text-sm"
                  >
                    <option value="">Month</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    value={expiryYear}
                    onChange={(e) => setExpiryYear(e.target.value)}
                    aria-label="Expiry year"
                    aria-invalid={Boolean(errors.expiry)}
                    className="focus-ring h-11 w-full rounded-md border border-border bg-white px-2 text-sm"
                  >
                    <option value="">Year</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.expiry && (
                  <p role="alert" className="mt-1 text-xs text-danger">
                    {errors.expiry}
                  </p>
                )}
              </div>

              <Field
                id="cvv"
                label="Security code (CVV)"
                value={cvv}
                onChange={(v) => setCvv(digitsOnly(v).slice(0, 4))}
                error={errors.cvv}
                inputMode="numeric"
                autoComplete="off"
                placeholder={"•".repeat(expectedCvvLength(cardDigits))}
              />
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-lg border border-border bg-surface shadow-card">
            <h2 className="border-b border-border px-4 py-3 font-heading text-base font-semibold text-ink">
              Order summary
            </h2>

            <ul className="divide-y divide-border">
              {cart.items.map((line) => (
                <li key={line.itemId} className="flex items-center gap-3 p-4">
                  <img
                    src={line.product.thumbnail}
                    alt={line.product.title}
                    className="h-14 w-14 shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-heading text-sm font-semibold text-ink">{line.product.title}</p>
                    <p className="truncate text-xs text-muted">
                      {Object.entries(line.variantSelection)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ")}{" "}
                      &middot; Qty {line.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                    {formatCurrency(line.subtotal)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-border p-4">
              <span className="font-heading text-base font-semibold text-ink">Total</span>
              <span className="text-lg font-bold tabular-nums text-ink">{formatCurrency(cart.total)}</span>
            </div>
          </div>

          {formError && (
            <p role="alert" className="mt-4 text-sm text-danger">
              {formError}
            </p>
          )}

          <Button type="submit" size="lg" className="mt-4 w-full" isLoading={isBusy}>
            {isPaying ? "Processing payment…" : `Pay ${formatCurrency(cart.total)}`}
          </Button>

          <Link to="/cart" className="mt-3 block">
            <Button size="lg" variant="ghost" type="button" className="w-full">
              Back to Cart
            </Button>
          </Link>
        </aside>
      </form>
    </div>
  );
}
