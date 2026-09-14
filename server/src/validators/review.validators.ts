import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating can't be more than 5"),
  comment: z.string().trim().max(500, "Keep it under 500 characters").optional().default(""),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
