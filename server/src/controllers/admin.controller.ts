import { Request, Response } from "express";
import { Product } from "../models/Product";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../middleware/asyncHandler";
import { ProductInput } from "../validators/admin.validators";

export const listProducts = asyncHandler(async (_req: Request, res: Response) => {
  const products = await Product.find().sort({ title: 1 });
  res.status(200).json(products);
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");
  res.status(200).json(product);
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as ProductInput;
  const product = await Product.create(input);
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as ProductInput;
  const product = await Product.findByIdAndUpdate(req.params.id, input, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new ApiError(404, "Product not found");
  res.status(200).json(product);
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");
  res.status(200).json({ message: "Product deleted" });
});

export const uploadProductImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, "No image file was provided");
  }
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});
