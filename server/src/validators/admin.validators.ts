import { z } from "zod";
import { HERO_MAX_IMAGES } from "../models/SiteContent";

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

export const heroSchema = z.object({
  eyebrow: z.string().trim().min(1, "Eyebrow text is required").max(40, "Keep the eyebrow under 40 characters"),
  heading: z.string().trim().min(1, "Heading is required").max(120, "Keep the heading under 120 characters"),
  subcopy: z.string().trim().min(1, "Supporting text is required").max(240, "Keep the supporting text under 240 characters"),
  ctaLabel: z.string().trim().min(1, "Button label is required").max(40, "Keep the button label under 40 characters"),
  images: z
    .array(z.string().min(1))
    .min(1, "Add at least one image")
    .max(HERO_MAX_IMAGES, `The hero layout supports up to ${HERO_MAX_IMAGES} images`),
});

export type HeroInput = z.infer<typeof heroSchema>;
