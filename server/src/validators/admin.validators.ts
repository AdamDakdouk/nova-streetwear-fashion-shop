import { z } from "zod";

const variantOptionSchema = z.object({
  value: z.string().min(1, "Option value is required"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  images: z.array(z.string().min(1)).optional(),
});

const variantAxisSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  options: z.array(variantOptionSchema).min(1, "Add at least one option"),
});

export const productSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  title: z.string().min(1, "Title is required"),
  price: z.number().int().positive("Price must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  images: z.array(z.string().min(1)).min(1, "Add at least one image"),
  thumbnail: z.string().min(1, "A thumbnail is required"),
  variants: z.array(variantAxisSchema).default([]),
  baseStock: z.number().int().min(0).default(0),
});

export type ProductInput = z.infer<typeof productSchema>;
