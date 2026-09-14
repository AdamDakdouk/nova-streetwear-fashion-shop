import { Request, Response } from "express";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../middleware/asyncHandler";

// A wishlisted product can be deleted later (now that admin CRUD exists) — populate()
// leaves a `null` in its place rather than removing the entry, so every response
// filters those out instead of handing the frontend a wishlist item with no product.
function dropDeletedProducts(wishlist: unknown[]): unknown[] {
  return wishlist.filter(Boolean);
}

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.userId).populate("wishlist");
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).json(dropDeletedProducts(user.wishlist));
});

export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.body as { productId?: string };
  if (!productId) throw new ApiError(400, "productId is required");

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const user = await User.findByIdAndUpdate(
    req.userId,
    { $addToSet: { wishlist: product._id } },
    { new: true }
  ).populate("wishlist");
  if (!user) throw new ApiError(404, "User not found");

  res.status(200).json(dropDeletedProducts(user.wishlist));
});

export const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(
    req.userId,
    { $pull: { wishlist: req.params.productId } },
    { new: true }
  ).populate("wishlist");
  if (!user) throw new ApiError(404, "User not found");

  res.status(200).json(dropDeletedProducts(user.wishlist));
});
