/**
 * Card helpers for the simulated checkout.
 *
 * Everything here runs in the browser and nothing in this file is ever sent to
 * the API. Only the detected brand and the last four digits leave the page —
 * see `CheckoutPage`. The full number, expiry and CVV are held in component
 * state for as long as the form is open and are discarded with it.
 */

export type CardBrand = "Visa" | "Mastercard" | "American Express" | "Discover" | "Card";

export function detectCardBrand(digits: string): CardBrand {
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "American Express";
  if (/^6(?:011|5)/.test(digits)) return "Discover";
  return "Card";
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Amex is 4-6-5; everything else is grouped in fours. */
export function formatCardNumber(value: string): string {
  const digits = digitsOnly(value).slice(0, 19);
  if (detectCardBrand(digits) === "American Express") {
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)].filter(Boolean).join(" ");
  }
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function expectedCardLength(digits: string): number {
  return detectCardBrand(digits) === "American Express" ? 15 : 16;
}

export function expectedCvvLength(digits: string): number {
  return detectCardBrand(digits) === "American Express" ? 4 : 3;
}

/**
 * The Luhn checksum every real card number satisfies. Worth doing even in a
 * mock: it's what makes a typo in the number fail at the point of typing
 * rather than sailing through as a "successful" payment.
 */
export function passesLuhn(digits: string): boolean {
  if (digits.length < 12) return false;

  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}

export function isExpiryInPast(month: string, year: string): boolean {
  const m = Number(month);
  const y = Number(year);
  if (!m || !y) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  return y < currentYear || (y === currentYear && m < currentMonth);
}

/** A well-known test number, so the demo can be exercised without a real card. */
export const DEMO_CARD_NUMBER = "4242 4242 4242 4242";
