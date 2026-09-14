import { Request, Response } from "express";
import { Product } from "../models/Product";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../middleware/asyncHandler";
import { getRatingSummariesByProduct, getRatingSummary } from "../services/review.service";

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const products = await Product.find().select("slug title price thumbnail variants category");
  const ratings = await getRatingSummariesByProduct();

  const summaries = products.map((p) => ({
    _id: p._id,
    slug: p.slug,
    title: p.title,
    price: p.price,
    thumbnail: p.thumbnail,
    category: p.category,
    // Listing payload intentionally omits per-option `images` (only needed on
    // the detail page) to keep the summary response light.
    variants: p.variants.map((axis) => ({
      name: axis.name,
      options: axis.options.map((opt) => ({ value: opt.value, stock: opt.stock })),
    })),
    ...(ratings.get(String(p._id)) ?? { avgRating: 0, reviewCount: 0 }),
  }));

  res.status(200).json(summaries);
});

function totalStockOf(product: {
  baseStock: number;
  variants: { options: { stock: number }[] }[];
}): number {
  if (product.variants.length === 0) {
    return product.baseStock;
  }
  // Sum of the first axis's option stocks approximates total on-hand inventory
  // for display purposes (exact per-combination stock is resolved separately).
  return product.variants[0].options.reduce((sum, opt) => sum + opt.stock, 0);
}

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const rating = await getRatingSummary(req.params.id);

  res.status(200).json({ ...product.toObject(), totalStock: totalStockOf(product), ...rating });
});
