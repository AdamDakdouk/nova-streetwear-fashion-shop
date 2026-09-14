import { Request, Response } from "express";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../middleware/asyncHandler";

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.userId).populate("wishlist");
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).json(user.wishlist);
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

  res.status(200).json(user.wishlist);
});

export const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(
    req.userId,
    { $pull: { wishlist: req.params.productId } },
    { new: true }
  ).populate("wishlist");
  if (!user) throw new ApiError(404, "User not found");

  res.status(200).json(user.wishlist);
});
