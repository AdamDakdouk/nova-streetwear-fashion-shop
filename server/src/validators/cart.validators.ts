import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().min(1),
  variantSelection: z.record(z.string()).default({}),
  quantity: z.number().int().positive(),
});

export const updateCartSchema = z
  .object({
    quantity: z.number().int().positive().optional(),
    variantSelection: z.record(z.string()).optional(),
  })
  .refine((data) => data.quantity !== undefined || data.variantSelection !== undefined, {
    message: "Provide quantity and/or variantSelection to update",
  });

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartInput = z.infer<typeof updateCartSchema>;
