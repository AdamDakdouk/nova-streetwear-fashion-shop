import { Request, Response } from "express";
import { Review } from "../models/Review";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../middleware/asyncHandler";
import { ReviewInput } from "../validators/review.validators";

export const listReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 });
  res.status(200).json(reviews);
});

export const upsertReview = asyncHandler(async (req: Request, res: Response) => {
  const { rating, comment } = req.body as ReviewInput;

  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  const user = await User.findById(req.userId).select("name");
  if (!user) throw new ApiError(404, "User not found");

  const review = await Review.findOneAndUpdate(
    { product: product._id, user: req.userId },
    { rating, comment, userName: user.name },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(201).json(review);
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const result = await Review.findOneAndDelete({ product: req.params.id, user: req.userId });
  if (!result) throw new ApiError(404, "You haven't reviewed this product");
  res.status(200).json({ message: "Review removed" });
});
