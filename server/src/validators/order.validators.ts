import { z } from "zod";

/**
 * Checkout payload.
 *
 * Note what is NOT here: the card number, expiry and CVV. Those stay in the
 * browser, are validated there, and are discarded once the simulated payment
 * finishes. 
 */
export const checkoutSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string().trim().min(1, "Full name is required").max(100),
    phone: z.string().trim().min(1, "Phone number is required").max(30),
    line1: z.string().trim().min(1, "Address is required").max(200),
    line2: z.string().trim().max(200).optional(),
    city: z.string().trim().min(1, "City is required").max(100),
    postalCode: z.string().trim().min(1, "Postal code is required").max(20),
    country: z.string().trim().min(1, "Country is required").max(100),
  }),
  payment: z.object({
    brand: z.string().trim().min(1).max(30),
    // Exactly four digits. Anything longer would mean more of the card number
    // than a storefront has any reason to keep.
    last4: z.string().regex(/^[0-9]{4}$/, "Expected the last 4 digits of the card"),
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
